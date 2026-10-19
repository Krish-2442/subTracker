import { getTransporter, resolveCredentials } from '../config/nodemailer.js';
import { MAIL_FROM } from '../config/env.js';
import { generateReminderTemplate } from './email-template.js';

// Send reminder email to user
export const sendBillingReminderEmail = async ({ recipient, to, userEmail, subscription, daysUntilBilling }) => {
    const recipientEmail = to || userEmail || (typeof recipient === 'string' ? recipient : recipient?.email);
    if (!recipientEmail) return null;

    const transporter = getTransporter();
    if (!transporter) return null;

    // Generate email content from template
    const { subject, text, html } = generateReminderTemplate({
        subscription,
        recipient,
        daysUntilBilling: daysUntilBilling || 0,
    });

    const { user } = resolveCredentials();
    const from = MAIL_FROM || (user ? `SubTracker <${user}>` : 'SubTracker');

    const mailOptions = {
        from,
        to: recipientEmail,
        subject,
        text,
        html,
    };

    return await transporter.sendMail(mailOptions);
};

export default sendBillingReminderEmail;