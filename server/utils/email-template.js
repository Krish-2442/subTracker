import { REMINDER_TIME_ZONE } from '../config/env.js';

export const escapeHtml = (value) => {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
};

export const formatBillingDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: REMINDER_TIME_ZONE || 'Asia/Kolkata',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
};

export const generateReminderTemplate = ({ subscription, recipient, daysUntilBilling }) => {
    const isAutoPay = subscription.autoPay !== false;
    const subscriptionName = escapeHtml(subscription.name);
    const recipientName = escapeHtml((typeof recipient === 'object' ? recipient?.name : '') || 'there');
    const formattedCost = formatCurrency(subscription.cost);
    const formattedDate = formatBillingDate(subscription.nextBillingDate);
    const timing = `in ${daysUntilBilling} day${daysUntilBilling === 1 ? '' : 's'}`;

    let subject = '';
    let actionLine = '';
    let actionHtml = '';

    if (isAutoPay) {
        subject = `Reminder: ${subscription.name} auto-renews ${timing} on ${formattedDate}`;
        actionLine = `Your ${subscription.name} subscription (${formattedCost}) will automatically renew ${timing} on ${formattedDate}.`;
        actionHtml = `<p style="line-height:1.6">Hi ${recipientName}, your <strong>${subscriptionName}</strong> subscription (<strong>${escapeHtml(formattedCost)}</strong>) will <strong>automatically renew</strong> ${timing} on <strong>${escapeHtml(formattedDate)}</strong>.</p>`;
    } else {
        subject = `Warning: ${subscription.name} expires ${timing} — Auto-Pay is OFF`;
        actionLine = `Auto-Pay is OFF for your ${subscription.name} subscription. It will expire and be cancelled ${timing} on ${formattedDate} unless you renew it.`;
        actionHtml = `<p style="line-height:1.6">Hi ${recipientName}, <strong>Auto-Pay is OFF</strong> for your <strong>${subscriptionName}</strong> subscription. It will <strong>expire and be cancelled</strong> ${timing} on <strong>${escapeHtml(formattedDate)}</strong> unless you renew it.</p>`;
    }

    const html = `
        <div style="background:#f6f7fb;padding:32px;font-family:Arial,sans-serif;color:#1f2937">
            <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px">
                <h1 style="margin:0 0 16px;font-size:24px">${isAutoPay ? 'Upcoming subscription renewal' : '⚠️ Subscription expiring soon'}</h1>
                ${actionHtml}
                <table style="width:100%;border-collapse:collapse;margin:24px 0">
                    <tr><td style="padding:10px 0;color:#6b7280">Subscription</td><td style="padding:10px 0;text-align:right;font-weight:600">${subscriptionName}</td></tr>
                    <tr><td style="padding:10px 0;color:#6b7280">Cost</td><td style="padding:10px 0;text-align:right;font-weight:600">${escapeHtml(formattedCost)}</td></tr>
                    <tr><td style="padding:10px 0;color:#6b7280">Next billing date</td><td style="padding:10px 0;text-align:right;font-weight:600">${escapeHtml(formattedDate)}</td></tr>
                    <tr><td style="padding:10px 0;color:#6b7280">Auto-Pay</td><td style="padding:10px 0;text-align:right;font-weight:600">${isAutoPay ? '✅ On' : '❌ Off'}</td></tr>
                </table>
                <p style="color:#6b7280;line-height:1.6">This is an automated reminder from SubTracker.</p>
            </div>
        </div>`;

    const text = [
        `Hi ${recipientName},`,
        '',
        actionLine,
        `Cost: ${formattedCost}`,
        `Next billing date: ${formattedDate}`,
        `Auto-Pay: ${isAutoPay ? 'On' : 'Off'}`,
        '',
        'This is an automated reminder from SubTracker.',
    ].join('\n');

    return { subject, text, html };
};
