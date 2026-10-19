import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5001;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET || 'subtracker_jwt_secret_key_change_in_production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const MAIL_USER = process.env.MAIL_USER || process.env.EMAIL_USER;
export const MAIL_PASSWORD = process.env.MAIL_PASSWORD || process.env.EMAIL_PASS;
export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_PORT = Number(process.env.MAIL_PORT || 587);
export const MAIL_SECURE = process.env.MAIL_SECURE === 'true';
export const MAIL_FROM = process.env.MAIL_FROM || (MAIL_USER ? `SubTracker <${MAIL_USER}>` : undefined);

export const BILLING_REMINDER_CRON = process.env.BILLING_REMINDER_CRON || '0 9 * * *';
export const REMINDER_TIME_ZONE = process.env.REMINDER_TIME_ZONE || 'Asia/Kolkata';
