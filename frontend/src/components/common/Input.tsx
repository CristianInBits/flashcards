import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}


export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        const hasError = !!error;

        const baseStyles = 'w-full px-4 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2';

        const stateStyles = hasError
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-primary focus:border-primary';

        const combinedClassName = `${baseStyles} ${stateStyles} ${className}`;

        return (
            <div className="w-full">
                {/* Label */}
                {label && (
                    <label
                        htmlFor={props.id}
                        className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}

                {/* Input */}
                <input ref={ref} className={combinedClassName} {...props} />

                {/* Error message */}
                {hasError && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}

                {/* Helper text (solo si no hay error) */}
                {!hasError && helperText && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';