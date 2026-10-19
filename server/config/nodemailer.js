import nodemailer from 'nodemailer';
import { MAIL_USER, MAIL_PASSWORD, MAIL_HOST, MAIL_PORT, MAIL_SECURE } from './env.js';

let transporter = null;
let warnedMissingCredentials = false;

export const resolveCredentials = () => {
    return {
        user: MAIL_USER,
        pass: MAIL_PASSWORD,
    };
};

export const getTransporter = () => {
    if (transporter) {
        return transporter;
    }

    const { user, pass } = resolveCredentials();

    if (!user || !pass) {
        if (!warnedMissingCredentials) {
            console.warn('[Nodemailer] Email credentials missing in environment.');
            warnedMissingCredentials = true;
        }
        return null;
    }

    const isGmail = !MAIL_HOST && user.endsWith('@gmail.com');

    if (isGmail) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
        });
    } else {
        transporter = nodemailer.createTransport({
            host: MAIL_HOST || 'smtp.gmail.com',
            port: MAIL_PORT,
            secure: MAIL_SECURE,
            auth: { user, pass },
        });
    }

    return transporter;
};

export const verifyTransporter = async () => {
    const service = getTransporter();

    if (!service) {
        throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in your .env file.');
    }

    return service.verify();
};

export default getTransporter;
