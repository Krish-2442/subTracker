const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const base =
        'inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

    const variants = {
        primary: 'bg-gray-900 text-white hover:bg-black shadow-sm',
        secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    };

    return (
        <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
