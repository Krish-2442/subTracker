import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';

export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

// Verify the JWT token and return the decoded payload. If the token is invalid or expired, it will throw an error. and JWT_SECRET is the secret key used to sign and verify the token. It should be kept secure and not exposed publicly. The JWT_EXPIRES_IN is the duration for which the token is valid, after which it will expire and require re-authentication.
export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

export default generateToken;
