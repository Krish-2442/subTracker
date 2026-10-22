import cron from 'node-cron'; // cron-job scheduling library for Node.js
import Subscription from '../models/subscription.model.js';
import '../models/user.model.js';
import { sendBillingReminderEmail } from '../utils/send-email.js';
import { syncSubscriptionLifecycles } from '../utils/lifecycle.js';
import { BILLING_REMINDER_CRON, REMINDER_TIME_ZONE } from '../config/env.js';

// Calculate days left between target date and today
const calculateDaysLeft = (targetDate) => {
    const target = new Date(targetDate);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

// Check active subscriptions and send reminder emails
export const runBillingReminderJob = async () => {
    // 1. Sync expired/due subscriptions first
    await syncSubscriptionLifecycles();

    // 2. Fetch all active subscriptions with user details
    const subscriptions = await Subscription.find({
        status: { $in: ['Active', 'active'] },
    }).populate('userId', 'name email');

    // 3. Loop over subscriptions and check due dates
    for (let i = 0; i < subscriptions.length; i++) {
        const sub = subscriptions[i];
        if (!sub.nextBillingDate || !sub.userId?.email) continue;

        const daysLeft = calculateDaysLeft(sub.nextBillingDate);

        // Send email reminder if renewal is in 5 days or 2 days
        if (daysLeft === 5 || daysLeft === 2) {
            // Avoid duplicate email if already sent for this milestone
            if (sub.lastReminderDaysLeft === daysLeft) {
                continue;
            }

            try {
                await sendBillingReminderEmail({
                    recipient: sub.userId,
                    to: sub.userId.email,
                    subscription: sub,
                    daysUntilBilling: daysLeft,
                });
                sub.lastReminderDaysLeft = daysLeft;
                sub.lastReminderSentForDate = sub.nextBillingDate;
                sub.lastNotifiedBillingDate = sub.nextBillingDate;
                sub.lastNotifiedAt = new Date();
                await sub.save();
                console.log(`[Reminder] Sent to ${sub.userId.email} for "${sub.name}" (${daysLeft} days left)`);
            } catch (err) {
                console.error(`[Reminder Error] Failed for "${sub.name}":`, err.message);
            }
        }
    }
};

// Schedule the cron job
export const startBillingReminderJob = () => {
    const schedule = BILLING_REMINDER_CRON || '0 9 * * *';
    const timezone = REMINDER_TIME_ZONE || 'Asia/Kolkata';

    return cron.schedule(
        schedule,
        async () => {
            console.log('Running daily billing reminder job...');
            await runBillingReminderJob();
        },
        { timezone }
    );
};

export default startBillingReminderJob;
