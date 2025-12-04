/**
 * Card Component
 * Reusable card container
 */

const Card = ({
    children,
    title,
    subtitle,
    headerAction,
    footer,
    padding = 'md',
    shadow = 'md',
    rounded = 'lg',
    border = true,
    hover = false,
    className = '',
    bodyClassName = '',
}) => {
    // Padding styles
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    // Shadow styles
    const shadows = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
    };

    // Rounded styles
    const roundedStyles = {
        none: 'rounded-none',
        sm: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
    };

    const cardClasses = `
        bg-white
        ${shadows[shadow]}
        ${roundedStyles[rounded]}
        ${border ? 'border border-gray-200' : ''}
        ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''}
        ${className}
    `.trim().replace(/\s+/g, ' ');

    const hasHeader = title || subtitle || headerAction;

    return (
        <div className={cardClasses}>
            {/* Card Header */}
            {hasHeader && (
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            {title && (
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {title}
                                </h3>
                            )}
                            {subtitle && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        {headerAction && (
                            <div className="flex-shrink-0">
                                {headerAction}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Card Body */}
            <div className={`${hasHeader ? '' : paddings[padding]} ${bodyClassName}`}>
                {hasHeader ? (
                    <div className={paddings[padding]}>
                        {children}
                    </div>
                ) : (
                    children
                )}
            </div>

            {/* Card Footer */}
            {footer && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    {footer}
                </div>
            )}
        </div>
    );
};

// Stats Card variant
export const StatsCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType = 'neutral', // positive, negative, neutral
    subtitle,
    color = 'primary',
    className = '',
}) => {
    const colors = {
        primary: 'bg-primary-100 text-primary-600',
        success: 'bg-green-100 text-green-600',
        danger: 'bg-red-100 text-red-600',
        warning: 'bg-yellow-100 text-yellow-600',
        info: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    const changeColors = {
        positive: 'text-green-600',
        negative: 'text-red-600',
        neutral: 'text-gray-500',
    };

    return (
        <Card className={className} padding="md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
                    {(change !== undefined || subtitle) && (
                        <p className={`mt-1 text-sm ${changeColors[changeType]}`}>
                            {change !== undefined && (
                                <span>
                                    {changeType === 'positive' && '+'}
                                    {change}
                                </span>
                            )}
                            {subtitle && <span> {subtitle}</span>}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded-xl ${colors[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>
        </Card>
    );
};

export default Card;
