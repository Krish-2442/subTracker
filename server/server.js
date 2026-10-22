import { PORT } from './config/env.js'; // must be first
import app from './app.js';
import connectToDatabase from './database/mongodb.js';
import { startBillingReminderJob } from './jobs/billing-reminder.job.js';

const startServer = async () => {
    try {
        await connectToDatabase();
        startBillingReminderJob();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

