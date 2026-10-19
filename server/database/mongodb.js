import mongoose from 'mongoose';
import { MONGODB_URI } from '../config/env.js';

export const connectToDatabase = async () => {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not defined.');
    }

    try {
        const connection = await mongoose.connect(MONGODB_URI);
        console.log(`MongoDB Connected: ${connection.connection.host}`);
        return connection;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectToDatabase;
