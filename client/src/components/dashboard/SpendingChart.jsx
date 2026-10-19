import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// Simple standard color palette
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const SpendingChart = ({ data = [], totalMonthly = 0, loading = false }) => {
    if (loading) {
        return (
            <div className="bg-white border rounded-lg p-4 shadow-sm flex items-center justify-center h-72">
                <p className="text-xs text-gray-400">Loading chart...</p>
            </div>
        );
    }

    // Calculate total spend using a simple for loop if not passed
    let total = Number(totalMonthly) || 0;
    if (total <= 0 && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            total += Number(data[i].amount) || 0;
        }
    }

    if (!data || data.length === 0 || total <= 0) {
        return (
            <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col items-center justify-center h-72 text-center">
                <p className="text-sm font-medium text-gray-500">No active spending data</p>
                <p className="text-xs text-gray-400 mt-1">Add an active subscription to see category breakdown</p>
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700">
                    Category Breakdown
                </h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">
                    ₹ (INR)
                </span>
            </div>

            <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={75}
                            paddingAngle={2}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={entry.category || index}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Simple readable paragraph for Total Monthly */}
            <p className="mt-2 text-center text-sm font-semibold text-gray-800">
                Total Monthly: ₹{total.toFixed(2)}
            </p>
        </div>
    );
};

export default SpendingChart;
