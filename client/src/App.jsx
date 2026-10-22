import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StatCards from './components/dashboard/StatCards';
import SpendingChart from './components/dashboard/SpendingChart';
import UpcomingAlerts from './components/dashboard/UpcomingAlerts';
import SubscriptionTable from './components/subscriptions/SubscriptionTable';
import SubscriptionForm from './components/subscriptions/SubscriptionForm';
import SubscriptionFilters from './components/subscriptions/SubscriptionFilters';
import Modal from './components/common/Modal';
import ConfirmDialog from './components/common/ConfirmDialog';
import Button from './components/common/Button';
import {
    getSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
} from './services/api';

/* ─── Protected Route Wrapper ─── */
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth(); // useAuth is a custom hook that provides access to the authentication state and functions from the AuthContext. It returns an object containing the current user, loading state, and authentication functions like login, register, and logout.

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Loading SubTracker...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />; // replace means that the current entry in the history stack will be replaced with the new one.
    }

    return children;
};

/* ─── Dashboard Component ─── */
const Dashboard = () => {
    const { user, logout } = useAuth();

    const [subscriptions, setSubscriptions] = useState([]); // subs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [filters, setFilters] = useState({
        search: '',
        category: 'All Categories',
        status: '',
        sortBy: 'nextBillingDate',
        order: 'asc',
    });

    // Simple async function to fetch all subscriptions
    const fetchSubscriptions = async () => {
        try {
            setError(null);
            const res = await getSubscriptions();
            setSubscriptions(res.data);
        } catch (err) {
            console.error('Error fetching subscriptions:', err);
            setError('Failed to load subscription data. Please check connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    // useEffect called on component mount to fetch subscriptions from the server. It runs only once.
    useEffect(() => {
        fetchSubscriptions();
    }, []);

    // Calculate Summary Stats, Upcoming Renewals & Chart Data using simple for loops
    let monthlySpend = 0;
    let annualSpend = 0;
    let activeSubs = 0;
    const categoryTotals = {};
    const upcomingRenewals = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for accurate date comparisons

    for (let i = 0; i < subscriptions.length; i++) {
        const sub = subscriptions[i];

        // Check if subscription is active
        const status = sub.status ? sub.status.toLowerCase() : 'active';
        if (status === 'active') {
            activeSubs++;

            const cost = Number(sub.cost) || 0;
            let monthlyCost = 0;

            if (sub.billingCycle === 'yearly') {
                monthlyCost = cost / 12;
            } else if (sub.billingCycle === 'weekly') {
                monthlyCost = (cost * 52) / 12;
            } else {
                // Default: monthly
                monthlyCost = cost;
            }

            monthlySpend += monthlyCost;

            if (sub.autoPay) {
                annualSpend += monthlyCost * 12;
            } else {
                annualSpend += cost;
            }

            // Category breakdown for recharts
            const cat = sub.category || 'Other';
            if (categoryTotals[cat]) {
                categoryTotals[cat] += monthlyCost;
            } else {
                categoryTotals[cat] = monthlyCost;
            }

            // Upcoming renewals in next 7 days
            if (sub.nextBillingDate) {
                const billDate = new Date(sub.nextBillingDate);
                billDate.setHours(0, 0, 0, 0);
                const diffTime = billDate.getTime() - today.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 0 && diffDays <= 7) {
                    upcomingRenewals.push({
                        ...sub,
                        days: diffDays,
                    });
                }
            }
        }
    }

    // Convert categoryTotals to simple array for Recharts
    const chartData = [];
    for (const cat in categoryTotals) {
        chartData.push({
            category: cat,
            amount: Math.round(categoryTotals[cat] * 100) / 100,
        });
    }

    // Sort upcoming renewals by nearest days left
    upcomingRenewals.sort((a, b) => a.days - b.days);

    // Filter & Sort Subscriptions
    const filteredSubscriptions = subscriptions.filter((sub) => {
        // Search filter
        if (filters.search) {
            const nameLower = (sub.name || '').toLowerCase();
            const searchLower = filters.search.toLowerCase().trim();
            if (!nameLower.includes(searchLower)) {
                return false;
            }
        }

        // Category filter
        if (filters.category && filters.category !== 'All Categories') {
            if (sub.category !== filters.category) {
                return false;
            }
        }

        // Status filter
        if (filters.status) {
            const subStatus = (sub.status || 'Active').toLowerCase();
            const targetStatus = filters.status.toLowerCase();
            if (subStatus !== targetStatus) {
                return false;
            }
        }

        return true;
    });

    // Sort subscriptions
    filteredSubscriptions.sort((a, b) => {
        const orderMultiplier = filters.order === 'desc' ? -1 : 1;

        if (filters.sortBy === 'name') {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            if (nameA < nameB) return -1 * orderMultiplier;
            if (nameA > nameB) return 1 * orderMultiplier;
            return 0;
        } else if (filters.sortBy === 'cost') {
            return (Number(a.cost || 0) - Number(b.cost || 0)) * orderMultiplier;
        } else {
            // Default sort: nextBillingDate
            const dateA = new Date(a.nextBillingDate || 0).getTime();
            const dateB = new Date(b.nextBillingDate || 0).getTime();
            return (dateA - dateB) * orderMultiplier;
        }
    });

    const hasActiveFilters =
        Boolean(filters.search) ||
        (Boolean(filters.category) && filters.category !== 'All Categories') ||
        Boolean(filters.status) ||
        filters.sortBy !== 'nextBillingDate' ||
        filters.order !== 'asc';

    // Action Handlers
    const handleAdd = () => {
        setEditing(null);
        setModalOpen(true); // set modal open for adding a new subscription
    };

    const handleEdit = (sub) => {
        setEditing(sub);
        setModalOpen(true); 
    };

    const handleDeleteClick = (id) => {
        const sub = subscriptions.find((s) => s._id === id);
        setDeleteTarget(sub || { _id: id, name: 'this subscription' });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget._id);
        try {
            await deleteSubscription(deleteTarget._id);
            toast.success(`"${deleteTarget.name}" deleted successfully`);
            setDeleteTarget(null);
            fetchSubscriptions();
        } catch (err) {
            console.error('Delete failed:', err);
            toast.error('Failed to delete subscription');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editing) {
                await updateSubscription(editing._id, formData);
                toast.success(`"${formData.name}" updated successfully`);
            } else {
                await createSubscription(formData);
                toast.success(`"${formData.name}" added successfully`);
            }
            setModalOpen(false);
            setEditing(null);
            fetchSubscriptions();
        } catch (err) {
            console.error('Save failed:', err);
            const msg = err.response?.data?.message || 'Failed to save subscription';
            toast.error(msg);
            throw err;
        }
    };

    const handleToggleAutoPay = async (sub) => {
        try {
            await updateSubscription(sub._id, { autoPay: !sub.autoPay });
            toast.success(`Auto-Pay turned ${!sub.autoPay ? 'ON' : 'OFF'} for "${sub.name}"`);
            fetchSubscriptions();
        } catch (err) {
            console.error('Failed to toggle auto-pay:', err);
            toast.error('Failed to update auto-pay');
        }
    };

    const handleQuickStatus = async (sub, newStatus) => {
        try {
            if (newStatus === 'Paused') {
                await updateSubscription(sub._id, { status: 'Paused' });
                toast.success(`"${sub.name}" paused`);
            } else if (newStatus === 'Active') {
                await updateSubscription(sub._id, { status: 'Active', autoPay: true });
                toast.success(`"${sub.name}" reactivated`);
            }
            fetchSubscriptions();
        } catch (err) {
            console.error('Failed to update status:', err);
            toast.error('Failed to update subscription status');
        }
    };

    return (
        // flex-col ensure that the header and main content stack vertically
        // flex ensures that the main content area can grow and fill the remaining space, allowing for a responsive layout
        // tracking-tight can be used to adjust the letter spacing for better readability and visual appeal
        // text-gray-900 here 900 is dark shade of gray
        // shadow-sm adds a subtle shadow to the button for better visual separation and depth
        // space-y-5 adds vertical spacing between child elements, improving readability and layout structure
        // sm-px-6 adds horizontal padding on small screens and above.
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col overflow-x-hidden"> 
            {/* Clean Dashboard Navbar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-900 text-white font-bold text-xs tracking-wider">
                            ST
                        </div>
                        <span className="font-bold text-base tracking-tight text-gray-900">
                            SubTracker
                        </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                            Welcome, {user?.name}
                        </span>

                        <Button onClick={handleAdd}>
                            + Add Subscription
                        </Button>
                    
                        <button
                            onClick={logout}
                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer shadow-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area here error && something means if there is an error then show the error message otherwise show the main content */}
            <main className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 py-6 flex-1 w-full max-w-full">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center justify-between">
                        <p className="text-sm font-medium">{error}</p>
                        <button
                            onClick={fetchSubscriptions}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-800 font-semibold px-3 py-1 rounded transition cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* 1. Top Section: 3 Spend & Active Cards : StatCards is a component that displays the spending and subscription data*/}
                <StatCards
                    monthlySpend={monthlySpend}
                    annualSpend={annualSpend}
                    activeSubs={activeSubs}
                    loading={loading}
                />

                {/* 2. Upcoming Renewals Section : UpcomingAlerts is a component that displays upcoming subscription renewals */}
                <UpcomingAlerts upcoming={upcomingRenewals} />

                {/* 3. Middle Section: Category Breakdown Chart & All Subscriptions Table */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
                    {/* Left: Recharts Category Breakdown */}
                    <div className="lg:col-span-2">
                        <SpendingChart
                            data={chartData}
                            totalMonthly={monthlySpend}
                            loading={loading}
                        />
                    </div>

                    {/* Right: Subscriptions Table with Filters */}
                    <div className="lg:col-span-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-700">
                                All Subscriptions
                            </h2>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-medium">
                                {subscriptions.length} total
                            </span>
                        </div>

                        {/* Filter Bar */}
                        <SubscriptionFilters
                            filters={filters}
                            onFilterChange={setFilters}
                        />

                        {/* Table */}
                        <SubscriptionTable
                            subscriptions={filteredSubscriptions}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onAdd={handleAdd}
                            onToggleAutoPay={handleToggleAutoPay}
                            onQuickStatus={handleQuickStatus}
                            loading={loading}
                            deletingId={deletingId}
                            hasActiveFilters={hasActiveFilters}
                        />
                    </div>
                </div>
            </main>

            {/* Add / Edit Subscription Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                title={editing ? 'Edit Subscription' : 'Add Subscription'}
            >
                <SubscriptionForm
                    initial={editing}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setModalOpen(false);
                        setEditing(null);
                    }}
                />
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Subscription"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                loading={Boolean(deletingId)}
            />
        </div>
    );
};

/* Root Route Redirect */
const RootRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Loading SubTracker...</p>
            </div>
        );
    }

    return <Navigate to={user ? '/dashboard' : '/login'} replace />;
};

/* Main App with Clean Routing (No Custom 404 Component) */
const App = () => {
    const { login, register } = useAuth();

    return (
        <Routes>
            {/* Public routes - Direct URL navigation ALWAYS opens Login or Register */}
            <Route path="/login" element={<LoginPage onLogin={login} />} />
            <Route path="/register" element={<RegisterPage onRegister={register} />} />

            {/* Protected dashboard route */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            {/* Root redirect : it can be used to redirect the user to the appropriate page based on their authentication status */}
            <Route path="/" element={<RootRedirect />} />

            {/* Standard fallback redirect : This will redirect any unmatched routes to the root route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;
