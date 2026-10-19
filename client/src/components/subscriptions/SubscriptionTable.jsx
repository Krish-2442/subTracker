import { formatDate } from '../../utils/formatters';

const SubscriptionTable = ({
    subscriptions = [],
    onEdit,
    onDelete,
    onAdd,
    onToggleAutoPay,
    onQuickStatus,
    loading = false,
    deletingId = null,
    hasActiveFilters = false,
}) => {
    if (loading) {
        return (
            <div className="bg-white border rounded-lg p-8 text-center text-sm text-gray-400 shadow-sm">
                Loading subscriptions...
            </div>
        );
    }

    if (!subscriptions || subscriptions.length === 0) {
        return (
            <div className="bg-white border rounded-lg p-8 text-center shadow-sm">
                <p className="text-sm font-medium text-gray-700">
                    {hasActiveFilters ? 'No subscriptions match your search filters.' : 'No subscriptions added yet.'}
                </p>
                {onAdd && !hasActiveFilters && (
                    <button
                        onClick={onAdd}
                        className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3.5 py-1.5 rounded transition cursor-pointer"
                    >
                        + Add Your First Subscription
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b text-xs font-semibold uppercase text-gray-500">
                            <th className="px-3 py-2.5">Name</th>
                            <th className="px-3 py-2.5">Category</th>
                            <th className="px-3 py-2.5">Cost</th>
                            <th className="px-3 py-2.5">Cycle</th>
                            <th className="px-3 py-2.5">Next Billing</th>
                            <th className="px-3 py-2.5">Status</th>
                            <th className="px-3 py-2.5 text-right pr-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {subscriptions.map((sub) => {
                            const isDeleting = deletingId === sub._id;
                            const status = sub.status || 'Active';

                            // Simple status badge color
                            let statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                            if (status === 'Paused') {
                                statusBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                            } else if (status === 'Cancelled') {
                                statusBadgeClass = 'bg-gray-100 text-gray-600 border-gray-200';
                            }

                            return (
                                <tr
                                    key={sub._id}
                                    className={`hover:bg-gray-50 transition ${isDeleting ? 'opacity-40' : ''}`}
                                >
                                    {/* Name */}
                                    <td className="px-3 py-2.5 font-semibold text-gray-900">
                                        {sub.name}
                                    </td>

                                    {/* Category */}
                                    <td className="px-3 py-2.5 text-gray-600">
                                        {sub.category}
                                    </td>

                                    {/* Cost */}
                                    <td className="px-3 py-2.5 font-bold text-gray-900">
                                        ₹{Number(sub.cost || 0).toFixed(2)}
                                    </td>

                                    {/* Billing Cycle + AutoPay toggle */}
                                    <td className="px-3 py-2.5">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded border capitalize text-gray-700">
                                                {sub.billingCycle}
                                            </span>
                                            {status === 'Active' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => onToggleAutoPay && onToggleAutoPay(sub)}
                                                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded border cursor-pointer transition ${
                                                        sub.autoPay
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                                    }`}
                                                    title="Click to toggle auto-pay"
                                                >
                                                    AutoPay: {sub.autoPay ? 'ON' : 'OFF'}
                                                </button>
                                            ) : (
                                                <span className="px-1.5 py-0.5 text-[10px] rounded border bg-gray-50 text-gray-400">
                                                    AutoPay: OFF
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Next Billing Date */}
                                    <td className="px-3 py-2.5 text-gray-700">
                                        {status === 'Paused' ? (
                                            <span className="text-amber-600 font-medium text-xs">Paused</span>
                                        ) : status === 'Cancelled' ? (
                                            <span className="text-gray-400 text-xs">Cancelled</span>
                                        ) : (
                                            <span className="text-xs font-medium">
                                                {sub.nextBillingDate ? formatDate(sub.nextBillingDate) : '—'}
                                            </span>
                                        )}
                                    </td>

                                    {/* Status Badge */}
                                    <td className="px-3 py-2.5">
                                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${statusBadgeClass}`}>
                                            {status}
                                        </span>
                                    </td>

                                    {/* ACTIONS Column: Simple Readable Text Buttons */}
                                    <td className="px-3 py-2.5 text-right whitespace-nowrap pr-4">
                                        <div className="inline-flex items-center justify-end gap-1.5">
                                            {/* Pause / Resume button */}
                                            {status === 'Active' && (
                                                <button
                                                    onClick={() => onQuickStatus && onQuickStatus(sub, 'Paused')}
                                                    disabled={isDeleting}
                                                    className="px-2 py-1 text-xs rounded border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition cursor-pointer"
                                                >
                                                    Pause
                                                </button>
                                            )}
                                            {(status === 'Paused' || status === 'Cancelled') && (
                                                <button
                                                    onClick={() => onQuickStatus && onQuickStatus(sub, 'Active')}
                                                    disabled={isDeleting}
                                                    className="px-2 py-1 text-xs rounded border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                                                >
                                                    Resume
                                                </button>
                                            )}

                                            {/* Edit button */}
                                            <button
                                                onClick={() => onEdit && onEdit(sub)}
                                                disabled={isDeleting}
                                                className="px-2 py-1 text-xs rounded border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                                            >
                                                Edit
                                            </button>

                                            {/* Delete button */}
                                            <button
                                                onClick={() => onDelete && onDelete(sub._id)}
                                                disabled={isDeleting}
                                                className="px-2 py-1 text-xs rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubscriptionTable;
