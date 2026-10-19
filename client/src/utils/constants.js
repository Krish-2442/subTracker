export const CATEGORIES = [
    'Entertainment',
    'Productivity',
    'Cloud Services',
    'Utilities',
    'Health & Fitness',
    'Other',
];

export const STATUSES = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'Paused', value: 'Paused' },
    { label: 'Cancelled', value: 'Cancelled' },
];

export const BILLING_CYCLES = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
    { label: 'Weekly', value: 'weekly' },
];

export const SORT_OPTIONS = [
    { label: 'Next Billing', value: 'nextBillingDate' },
    { label: 'Name', value: 'name' },
    { label: 'Cost', value: 'cost' },
];

export const DEFAULT_SUBSCRIPTION_SORT = {
    sortBy: 'nextBillingDate',
    order: 'asc',
};

export const SELECT_CLASSES =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer';

export const CURRENCY_SYMBOL = '₹';
