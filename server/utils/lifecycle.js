import Subscription from '../models/subscription.model.js';
import { getTodayIST, advanceBillingDate } from './date-utils.js';

// Synchronize expired or past-due subscriptions
export const syncSubscriptionLifecycles = async (userId = null) => {
    const today = getTodayIST();

    const filter = {
        status: { $in: ['Active', 'active'] },
        nextBillingDate: { $lt: today },
    };

    if (userId) {
        filter.userId = userId;
    }

    const subscriptions = await Subscription.find(filter);
    const results = { renewed: 0, cancelled: 0 };

    for (let i = 0; i < subscriptions.length; i++) {
        const sub = subscriptions[i];

        if (sub.autoPay) {
            // AutoPay ON -> Advance to next billing cycle
            sub.nextBillingDate = advanceBillingDate(sub.nextBillingDate, sub.billingCycle);
            await sub.save();
            results.renewed++;
        } else {
            // AutoPay OFF -> Cancel subscription
            sub.status = 'Cancelled';
            sub.autoPay = false;
            await sub.save();
            results.cancelled++;
        }
    }

    return results;
};

export default syncSubscriptionLifecycles;
