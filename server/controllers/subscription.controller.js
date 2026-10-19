import Subscription from '../models/subscription.model.js';
import { syncSubscriptionLifecycles } from '../utils/lifecycle.js';
import {
    normalizeDate,
    getTodayIST,
    calculateNextBillingDate,
} from '../utils/date-utils.js';

// Capitalize first letter of status (Active, Paused, Cancelled)
const formatStatus = (status) => {
    if (!status || typeof status !== 'string') return 'Active';
    const s = status.trim();
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

// GET /api/subscriptions - Get all subscriptions for logged-in user
export const getSubscriptions = async (req, res, next) => {
    try {
        const { search, category, status, sortBy, order } = req.query;

        // Auto-renew or cancel overdue subscriptions first
        await syncSubscriptionLifecycles(req.user._id);

        const filter = { userId: req.user._id };

        // Search by subscription name
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        // Filter by category
        if (category && category !== 'All Categories') {
            filter.category = category;
        }

        // Filter by status (Active, Paused, Cancelled)
        if (status) {
            filter.status = formatStatus(status);
        }

        // Sort configuration
        const sortField = ['name', 'cost', 'nextBillingDate'].includes(sortBy)
            ? sortBy
            : 'nextBillingDate';
        const sortDirection = order === 'desc' ? -1 : 1;

        const subscriptions = await Subscription.find(filter).sort({ [sortField]: sortDirection });
        res.json(subscriptions);
    } catch (error) {
        next(error);
    }
};

// POST /api/subscriptions - Create new subscription
export const createSubscription = async (req, res, next) => {
    try {
        const { name, cost, billingCycle, category, startDate, status, autoPay } = req.body;

        const cleanStatus = formatStatus(status);
        let cleanAutoPay = autoPay !== undefined ? autoPay : true;

        if (cleanStatus === 'Paused' || cleanStatus === 'Cancelled') {
            cleanAutoPay = false;
        }

        const validStartDate = normalizeDate(startDate || new Date());
        const cycle = billingCycle || 'monthly';

        // Calculate initial next billing date
        const nextBillingDate = calculateNextBillingDate(validStartDate, cycle, cleanAutoPay);

        const subscription = new Subscription({
            userId: req.user._id,
            name: name ? name.trim() : 'Unnamed Subscription',
            cost: Number(cost) || 0,
            billingCycle: cycle,
            category: category || 'Other',
            startDate: validStartDate,
            nextBillingDate,
            status: cleanStatus,
            autoPay: cleanAutoPay,
        });

        const saved = await subscription.save();
        res.status(201).json(saved);
    } catch (error) {
        next(error);
    }
};

// PUT /api/subscriptions/:id - Update existing subscription
export const updateSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        if (subscription.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this subscription' });
        }

        const oldStatus = subscription.status;
        const oldStartDate = subscription.startDate ? new Date(subscription.startDate).getTime() : 0;
        const oldCycle = subscription.billingCycle;

        // Update fields if provided
        if (req.body.name !== undefined) subscription.name = req.body.name.trim();
        if (req.body.cost !== undefined) subscription.cost = Number(req.body.cost);
        if (req.body.category !== undefined) subscription.category = req.body.category;
        if (req.body.billingCycle !== undefined) subscription.billingCycle = req.body.billingCycle;
        if (req.body.startDate !== undefined) subscription.startDate = normalizeDate(req.body.startDate);
        if (req.body.autoPay !== undefined) subscription.autoPay = req.body.autoPay;

        if (req.body.status !== undefined) {
            subscription.status = formatStatus(req.body.status);
            if (subscription.status === 'Paused' || subscription.status === 'Cancelled') {
                subscription.autoPay = false;
            }
        }

        // Check if date or cycle changed, or subscription reactivated
        const newStartDate = subscription.startDate ? new Date(subscription.startDate).getTime() : 0;
        const isReactivating = (oldStatus === 'Paused' || oldStatus === 'Cancelled') && subscription.status === 'Active';
        const dateOrCycleChanged = oldStartDate !== newStartDate || oldCycle !== subscription.billingCycle;

        if (isReactivating || (dateOrCycleChanged && subscription.status === 'Active')) {
            subscription.nextBillingDate = calculateNextBillingDate(
                subscription.startDate,
                subscription.billingCycle,
                subscription.autoPay
            );
        }

        const updated = await subscription.save();
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/subscriptions/:id - Delete subscription
export const deleteSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        if (subscription.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this subscription' });
        }

        await Subscription.findByIdAndDelete(req.params.id);
        res.json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// GET /api/subscriptions/summary - Get spend stats & category breakdown
export const getSummary = async (req, res, next) => {
    try {
        await syncSubscriptionLifecycles(req.user._id);

        const subscriptions = await Subscription.find({
            userId: req.user._id,
            status: { $in: ['Active', 'active'] },
        });

        let totalMonthly = 0;
        let totalAnnual = 0;
        const categoryTotals = {};

        // Loop over active subscriptions and sum totals
        for (let i = 0; i < subscriptions.length; i++) {
            const sub = subscriptions[i];
            const cost = Number(sub.cost) || 0;

            let monthlyCost = 0;
            if (sub.billingCycle === 'yearly') {
                monthlyCost = cost / 12;
            } else if (sub.billingCycle === 'weekly') {
                monthlyCost = (cost * 52) / 12;
            } else {
                monthlyCost = cost;
            }

            totalMonthly += monthlyCost;

            if (sub.autoPay) {
                totalAnnual += monthlyCost * 12;
            } else {
                totalAnnual += cost;
            }

            const cat = sub.category || 'Other';
            if (categoryTotals[cat]) {
                categoryTotals[cat] += monthlyCost;
            } else {
                categoryTotals[cat] = monthlyCost;
            }
        }

        const categoryBreakdown = [];
        for (const cat in categoryTotals) {
            categoryBreakdown.push({
                category: cat,
                amount: Math.round(categoryTotals[cat] * 100) / 100,
            });
        }

        res.json({
            currency: 'INR',
            totalMonthly: Math.round(totalMonthly * 100) / 100,
            totalAnnual: Math.round(totalAnnual * 100) / 100,
            activeCount: subscriptions.length,
            categoryBreakdown,
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/subscriptions/upcoming - Get renewals due in next 7 days
export const getUpcoming = async (req, res, next) => {
    try {
        await syncSubscriptionLifecycles(req.user._id);

        const today = getTodayIST();
        const next7Days = new Date(today);
        next7Days.setDate(next7Days.getDate() + 7);
        next7Days.setHours(23, 59, 59, 999);

        const upcoming = await Subscription.find({
            userId: req.user._id,
            status: { $in: ['Active', 'active'] },
            nextBillingDate: {
                $gte: today,
                $lte: next7Days,
            },
        }).sort({ nextBillingDate: 1 });

        res.json(upcoming);
    } catch (error) {
        next(error);
    }
};
