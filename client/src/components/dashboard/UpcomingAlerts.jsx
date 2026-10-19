import { formatDate } from '../../utils/formatters';

const UpcomingAlerts = ({ upcoming = [] }) => {
    if (!upcoming || upcoming.length === 0) return null;

    // Filter upcoming subscriptions in next 7 days using basic for loop
    const upcomingSoon = [];
    let autoPayTotal = 0;

    for (let i = 0; i < upcoming.length; i++) {
        const sub = upcoming[i];
        const status = sub.status ? sub.status.toLowerCase() : 'active';
        if (status === 'active') {
            upcomingSoon.push(sub);
            if (sub.autoPay) {
                autoPayTotal += Number(sub.cost) || 0;
            }
        }
    }

    if (upcomingSoon.length === 0) return null;

    return (
        <div className="bg-white border rounded-lg p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                <h3 className="text-sm font-semibold tracking-tight text-gray-800">
                    Upcoming Renewals (Next 7 Days)
                </h3>
                <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-200">
                        Total Due: ₹{autoPayTotal.toFixed(2)}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded border">
                        {upcomingSoon.length} renewal{upcomingSoon.length > 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div className="divide-y border rounded-lg overflow-hidden bg-gray-50">
                {upcomingSoon.map((sub) => {
                    let daysText = 'Due soon';
                    if (sub.days !== undefined) {
                        if (sub.days === 0) daysText = 'Today';
                        else if (sub.days === 1) daysText = 'Tomorrow';
                        else daysText = `In ${sub.days} days`;
                    }

                    return (
                        <div key={sub._id} className="flex items-center justify-between px-3.5 py-2.5 text-sm bg-white">
                            <div>
                                <span className="font-semibold text-gray-900">{sub.name}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                    {formatDate(sub.nextBillingDate)}
                                </span>
                                <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded border ${
                                    sub.autoPay
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {sub.autoPay ? 'Auto-Renew' : 'Manual / Expires'}
                                </span>
                            </div>

                            <div className="text-right">
                                <span className="text-xs font-medium text-gray-500 mr-2">{daysText}</span>
                                <span className="font-bold text-gray-900">₹{Number(sub.cost || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UpcomingAlerts;
