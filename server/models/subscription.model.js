import mongoose from 'mongoose';
import { calculateNextBillingDate, normalizeDate } from '../utils/date-utils.js';

const subscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        name: {
            type: String,
            required: [true, 'Subscription name is required'],
            trim: true,
        },
        cost: {
            type: Number,
            required: [true, 'Cost is required'],
            min: [0.01, 'Cost must be greater than 0'],
        },
        billingCycle: {
            type: String,
            enum: ['monthly', 'yearly', 'weekly'],
            required: [true, 'Billing cycle is required'],
        },
        category: {
            type: String,
            enum: [
                'Entertainment',
                'Productivity',
                'Cloud Services',
                'Utilities',
                'Health & Fitness',
                'Other',
            ],
            required: [true, 'Category is required'],
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
            set: (v) => {
                if (!v) return v;
                return normalizeDate(v);
            },
        },
        nextBillingDate: {
            type: Date,
            set: (v) => {
                if (!v) return v;
                return normalizeDate(v);
            },
        },
        status: {
            type: String,
            enum: ['Active', 'Paused', 'Cancelled'],
            default: 'Active',
            set: (v) => {
                if (typeof v !== 'string') return v;
                const normalized = v.trim();
                return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
            },
        },
        autoPay: {
            type: Boolean,
            default: true,
        },
        lastReminderSentForDate: {
            type: Date,
            default: null,
        },
        lastReminderDaysLeft: {
            type: Number,
            default: null,
        },
        lastNotifiedBillingDate: {
            type: Date,
            default: null,
        },
        lastNotifiedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

subscriptionSchema.pre('save', function () {
    if (this.status === 'Paused' || this.status === 'Cancelled') {
        this.autoPay = false;
        this.lastReminderSentForDate = null;
        this.lastReminderDaysLeft = null;
        this.lastNotifiedBillingDate = null;
        this.lastNotifiedAt = null;
        return;
    }

    if (this.isModified('nextBillingDate')) {
        this.lastReminderSentForDate = null;
        this.lastReminderDaysLeft = null;
        this.lastNotifiedBillingDate = null;
        this.lastNotifiedAt = null;
    } else if (!this.nextBillingDate) {
        this.nextBillingDate = calculateNextBillingDate(this.startDate, this.billingCycle, this.autoPay);
        this.lastReminderSentForDate = null;
        this.lastReminderDaysLeft = null;
        this.lastNotifiedBillingDate = null;
        this.lastNotifiedAt = null;
    }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
