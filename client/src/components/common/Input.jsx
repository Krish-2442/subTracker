// Input is a reusable component that renders a labeled input field with optional error message. It accepts props for label, id, error message, className for custom styling, and any other input attributes.
const Input = ({ label, id, error, className = '', ...props }) => {
    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={id}
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                    {label}
                </label>
            )}
            <input
                id={id}
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
};

export default Input;
