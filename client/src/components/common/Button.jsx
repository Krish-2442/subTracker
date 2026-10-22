// Button is a reusable component and children is a special prop that allows you to pass components or elements as children to the Button component. The variant prop allows you to specify different styles for the button, such as primary, secondary, danger, and ghost. The className prop allows you to add additional custom classes to the button. The ...props syntax allows you to pass any other props to the button element, such as onClick, type, etc.
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    // base is common styles for all button variants.
    const base =
        'inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

    const variants = {
        primary: 'bg-gray-900 text-white hover:bg-black shadow-sm',
        secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    };

    // return statement returns a button element with the appropriate classes and props applied. The className is a combination of the base styles, the variant styles, and any additional custom classes passed in through the className prop. The children prop is rendered inside the button element, allowing you to pass in any content you want to display inside the button.
    return (
        <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
