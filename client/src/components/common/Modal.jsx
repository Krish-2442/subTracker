// Modal is a reusable component that renders a modal dialog with a title, content, and close button. It accepts props for isOpen (to control visibility), onClose (callback for closing the modal), title (modal title), and children (content of the modal). It also handles keyboard accessibility by closing the modal when the Escape key is pressed.
// isOpen: A boolean prop that determines whether the modal is visible or not. When true, the modal is displayed; when false, it is hidden.
import { useEffect, useId } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    const titleId = useId();

    useEffect(() => {
        if (!isOpen) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

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
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg rounded-lg border border-gray-300 bg-white p-6 shadow-md">
                <div className="mb-4 flex items-center justify-between border-b pb-3">
                    <h2 id={titleId} className="text-base font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
