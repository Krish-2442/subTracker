const StatCards = ({ monthlySpend = 0, annualSpend = 0, activeSubs = 0, summary = null, loading = false }) => {
    // If summary object was passed, extract values, otherwise use direct props
    const monthly = summary ? summary.totalMonthly : monthlySpend;
    const annual = summary ? summary.totalAnnual : annualSpend;
    const activeCount = summary ? summary.activeCount : activeSubs;

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-white border rounded-lg p-4 shadow-sm text-center text-sm text-gray-400">Loading cards...</div>
                <div className="bg-white border rounded-lg p-4 shadow-sm text-center text-sm text-gray-400">Loading cards...</div>
                <div className="bg-white border rounded-lg p-4 shadow-sm text-center text-sm text-gray-400">Loading cards...</div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Card 1: Monthly Spend */}
            <div className="bg-white border rounded-lg p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Monthly Spend</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">₹{Number(monthly || 0).toFixed(2)}</p>
                <p className="mt-1 text-xs text-gray-400">Calculated monthly recurring total</p>
            </div>

            {/* Card 2: Annual Spend */}
            <div className="bg-white border rounded-lg p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Annual Spend</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">₹{Number(annual || 0).toFixed(2)}</p>
                <p className="mt-1 text-xs text-gray-400">Projected 12-month expense</p>
            </div>

            {/* Card 3: Active Subs */}
            <div className="bg-white border rounded-lg p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Subs</p>
                <p className="mt-2 text-2xl font-bold text-indigo-600">{activeCount || 0}</p>
                <p className="mt-1 text-xs text-gray-400">Total active subscriptions</p>
            </div>
        </div>
    );
};

export default StatCards;
