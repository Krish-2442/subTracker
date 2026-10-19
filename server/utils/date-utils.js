export const TIMEZONE_IST = 'Asia/Kolkata';

// Normalize date to start of day (midnight: 00:00:00.000)
export const normalizeDate = (dateInput = new Date()) => {
    if (!dateInput) dateInput = new Date();
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

// Returns today at midnight
export const getTodayIST = () => {
    return normalizeDate(new Date());
};

// Format Date as "YYYY-MM-DD"
export const toISTDateString = (dateInput = new Date()) => {
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Format Date for user-facing display (e.g., "Oct 18, 2026")
export const formatDateIST = (dateInput) => {
    if (!dateInput) return '—';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Calculate difference in calendar days between two dates
export const differenceInCalendarDays = (targetDate, baseDate = new Date()) => {
    const target = normalizeDate(targetDate);
    const base = normalizeDate(baseDate);
    const diffMs = target.getTime() - base.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

// Add billing cycles (weekly, monthly, yearly) using standard Date methods
export const addCyclesToDate = (baseDate, billingCycle = 'monthly', cycleCount = 1) => {
    const d = new Date(baseDate);
    const cycle = (billingCycle || 'monthly').toLowerCase();

    if (cycle === 'weekly') {
        d.setDate(d.getDate() + cycleCount * 7);
    } else if (cycle === 'yearly') {
        d.setFullYear(d.getFullYear() + cycleCount);
    } else {
        // Default to monthly
        d.setMonth(d.getMonth() + cycleCount);
    }

    d.setHours(0, 0, 0, 0);
    return d;
};

// Calculate next billing date from startDate based on cycle and autoPay status
export const calculateNextBillingDate = (startDate, billingCycle = 'monthly', autoPay = true) => {
    const today = getTodayIST();
    const start = normalizeDate(startDate);

    // If start date is in the future, the first billing is that date
    if (start > today) {
        return start;
    }

    // Otherwise, start + 1 cycle
    let candidate = addCyclesToDate(start, billingCycle, 1);

    // If past today and autoPay is on, keep advancing until future
    if (autoPay) {
        while (candidate < today) {
            candidate = addCyclesToDate(candidate, billingCycle, 1);
        }
    }

    return candidate;
};

// Advance billing date to next cycle in the future
export const advanceBillingDate = (currentBillingDate, billingCycle = 'monthly') => {
    const today = getTodayIST();
    let candidate = addCyclesToDate(currentBillingDate, billingCycle, 1);

    while (candidate <= today) {
        candidate = addCyclesToDate(candidate, billingCycle, 1);
    }

    return candidate;
};
