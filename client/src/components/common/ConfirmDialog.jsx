import { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure?',
    confirmLabel = 'Confirm',
    loading = false,
}) => {
    const titleId = useId();

    useEffect(() => {
        if (!isOpen) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !loading) onClose();
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, loading]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
        >
            <div
                className="absolute inset-0 bg-black/50"
                onClick={loading ? undefined : onClose}
            />

            <div className="relative w-full max-w-sm rounded-lg border border-gray-300 bg-white p-6 shadow-md">
                <div className="mb-3 flex items-center justify-between">
                    <h2 id={titleId} className="text-base font-semibold text-gray-900">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className="mb-6 text-sm text-gray-600 leading-relaxed">
                    {message}
                </p>

                <div className="flex justify-end gap-2.5">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
