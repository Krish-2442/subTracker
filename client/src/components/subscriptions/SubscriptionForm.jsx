import { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { toDateInputValue } from '../../utils/formatters';
import { CATEGORIES, SELECT_CLASSES } from '../../utils/constants';

const getInitialForm = () => ({
    name: '',
    cost: '',
    billingCycle: 'monthly',
    category: 'Entertainment',
    startDate: toDateInputValue(new Date()),
    status: 'Active',
    autoPay: true,
});

const normalizeStatus = (status) => {
    if (!status) return 'Active';
    const s = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    if (['Active', 'Paused', 'Cancelled'].includes(s)) return s;
    return 'Active';
};

const SubscriptionForm = ({ initial, onSubmit, onCancel }) => {
    const [form, setForm] = useState(getInitialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initial) {
            const normalizedStatus = normalizeStatus(initial.status);
            const isPausedOrCancelled = normalizedStatus === 'Paused' || normalizedStatus === 'Cancelled';
            setForm({
                name: initial.name || '',
                cost: initial.cost || '',
                billingCycle: initial.billingCycle || 'monthly',
                category: initial.category || 'Entertainment',
                startDate: toDateInputValue(initial.startDate || new Date()),
                status: normalizedStatus,
                autoPay: isPausedOrCancelled ? false : (initial.autoPay !== undefined ? initial.autoPay : true),
            });
        } else {
            setForm(getInitialForm());
        }
        setErrors({});
    }, [initial]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setForm((prev) => {
            const updated = { ...prev, [name]: newValue };

            if (name === 'status' && (value === 'Paused' || value === 'Cancelled')) {
                updated.autoPay = false;
            }

            return updated;
        });

        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const validate = () => {
        const newErrors = {};

        const trimmedName = form.name.trim();
        if (!trimmedName) {
            newErrors.name = 'Subscription name is required';
        } else if (trimmedName.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        } else if (trimmedName.length > 50) {
            newErrors.name = 'Name must be 50 characters or less';
        }

        const costNum = parseFloat(form.cost);
        if (form.cost === '' || form.cost === null || form.cost === undefined) {
            newErrors.cost = 'Cost is required';
        } else if (isNaN(costNum)) {
            newErrors.cost = 'Cost must be a valid number';
        } else if (costNum <= 0) {
            newErrors.cost = 'Cost must be greater than 0';
        }

        if (!form.startDate) {
            newErrors.startDate = 'Start date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                ...form,
                name: form.name.trim(),
                cost: parseFloat(form.cost),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAutoPayHelperText = () => {
        if (form.status === 'Paused') {
            return 'Billing is paused and excluded from monthly/annual spend until resumed';
        }
        if (form.status === 'Cancelled') {
            return 'Subscription is ended immediately and excluded from spend';
        }
        if (form.autoPay) {
            return 'Subscription will automatically renew on the next billing date';
        }
        return 'Access remains active until the next billing date, then automatically cancels';
    };

    const isAutoPayDisabled = form.status === 'Paused' || form.status === 'Cancelled';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Subscription Name"
                id="name"
                name="name"
                placeholder="e.g. Netflix, GitHub Pro"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                required
            />

            <Input
                label="Cost (₹)"
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="499"
                value={form.cost}
                onChange={handleChange}
                error={errors.cost}
                required
            />

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="billingCycle"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                        Billing Cycle
                    </label>
                    <select
                        id="billingCycle"
                        name="billingCycle"
                        value={form.billingCycle}
                        onChange={handleChange}
                        className={SELECT_CLASSES}
                    >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>
                <div>
                    <label
                        htmlFor="category"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                        Category
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className={SELECT_CLASSES}
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Start Date"
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    error={errors.startDate}
                    required
                />
                <div>
                    <label
                        htmlFor="status"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className={SELECT_CLASSES}
                    >
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3">
                <div className="pr-4">
                    <label
                        htmlFor="autoPay"
                        className={`text-sm font-medium ${isAutoPayDisabled ? 'text-gray-400' : 'text-gray-900 cursor-pointer'}`}
                    >
                        Auto-Pay
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {getAutoPayHelperText()}
                    </p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={form.autoPay}
                    id="autoPay"
                    onClick={() => {
                        if (!isAutoPayDisabled) {
                            setForm((prev) => ({ ...prev, autoPay: !prev.autoPay }));
                        }
                    }}
                    disabled={isAutoPayDisabled}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${
                        form.autoPay ? 'bg-gray-900' : 'bg-gray-300'
                    } ${isAutoPayDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                            form.autoPay ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Saving...
                        </>
                    ) : (
                        initial ? 'Update Subscription' : 'Add Subscription'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default SubscriptionForm;
