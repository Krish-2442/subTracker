import { CATEGORIES, STATUSES, SORT_OPTIONS } from '../../utils/constants';

const SubscriptionFilters = ({ filters = {}, onFilterChange }) => {
    const handleChange = (field, value) => {
        onFilterChange({
            ...filters,
            [field]: value,
        });
    };

    const toggleOrder = () => {
        const nextOrder = filters.order === 'asc' ? 'desc' : 'asc';
        handleChange('order', nextOrder);
    };

    const clearFilters = () => {
        onFilterChange({
            search: '',
            category: 'All Categories',
            status: '',
            sortBy: 'nextBillingDate',
            order: 'asc',
        });
    };

    const hasActiveFilters =
        Boolean(filters.search) ||
        (Boolean(filters.category) && filters.category !== 'All Categories') ||
        Boolean(filters.status) ||
        filters.sortBy !== 'nextBillingDate' ||
        filters.order !== 'asc';

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 text-sm">
            {/* Search Input */}
            <input
                type="text"
                placeholder="Search subscriptions..."
                value={filters.search || ''}
                onChange={(e) => handleChange('search', e.target.value)}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm flex-1 min-w-[180px] focus:outline-none focus:border-indigo-500"
            />

            {/* Category Select */}
            <select
                value={filters.category || 'All Categories'}
                onChange={(e) => handleChange('category', e.target.value)}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
            >
                <option value="All Categories">All Categories</option>
                {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            {/* Status Select */}
            <select
                value={filters.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
            >
                {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </select>

            {/* Sort Select */}
            <select
                value={filters.sortBy || 'nextBillingDate'}
                onChange={(e) => handleChange('sortBy', e.target.value)}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
            >
                {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>
                ))}
            </select>

            {/* Order Toggle Button */}
            <button
                type="button"
                onClick={toggleOrder}
                className="rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                title="Toggle Sort Order"
            >
                {filters.order === 'asc' ? 'Order: Asc ↑' : 'Order: Desc ↓'}
            </button>

            {/* Clear Button */}
            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded border border-red-300 bg-red-50 text-red-700 px-2.5 py-1.5 text-xs font-medium hover:bg-red-100 transition cursor-pointer"
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
};

export default SubscriptionFilters;