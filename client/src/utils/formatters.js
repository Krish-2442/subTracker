export const TIMEZONE_IST = 'Asia/Kolkata';

export const formatCurrency = (amount) => {
    const value = Number(amount) || 0;
    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `₹${value.toFixed(2)}`;
    }
};

export const getISTDateParts = (dateInput = new Date()) => {
    if (typeof dateInput === 'string') {
        const trimmed = dateInput.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            const [year, month, day] = trimmed.split('-').map(Number);
            return { year, month, day };
        }
    }
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;

    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: TIMEZONE_IST,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const parts = formatter.format(d).split('-');
    return {
        year: Number(parts[0]),
        month: Number(parts[1]),
        day: Number(parts[2]),
    };
};

export const toDateInputValue = (dateInput) => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
        return dateInput.trim();
    }
    const parts = getISTDateParts(dateInput);
    if (!parts) return '';
    const m = String(parts.month).padStart(2, '0');
    const d = String(parts.day).padStart(2, '0');
    return `${parts.year}-${m}-${d}`;
};

export const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = getISTDateParts(dateStr);
    if (!parts) return '—';
    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
    return date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const daysUntil = (dateStr, now = new Date()) => {
    if (!dateStr) return null;
    const targetParts = getISTDateParts(dateStr);
    const todayParts = getISTDateParts(now);
    if (!targetParts || !todayParts) return null;

    const targetDays = Date.UTC(targetParts.year, targetParts.month - 1, targetParts.day);
    const todayDays = Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day);
    return Math.round((targetDays - todayDays) / (1000 * 60 * 60 * 24));
};
