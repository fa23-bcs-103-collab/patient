import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

const severityConfig = {
    critical: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: ShieldAlert,
        iconColor: 'text-red-600',
        pulse: true
    },
    high: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-200',
        icon: AlertTriangle,
        iconColor: 'text-orange-600',
        pulse: false
    },
    medium: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: AlertCircle,
        iconColor: 'text-yellow-600',
        pulse: false
    },
    low: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: Info,
        iconColor: 'text-blue-600',
        pulse: false
    }
};

export default function WarningBadge({ severity, count, showIcon = true, size = 'md' }) {
    const config = severityConfig[severity] || severityConfig.medium;
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold border
        ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}
        ${config.pulse ? 'animate-pulse' : ''}
      `}
        >
            {showIcon && <Icon className={`${iconSizes[size]} ${config.iconColor}`} />}
            {count !== undefined ? count : severity}
        </span>
    );
}

export function WarningCountBadge({ stats, onClick }) {
    const total = stats?.unacknowledged || 0;
    const critical = stats?.by_severity?.critical || 0;
    const high = stats?.by_severity?.high || 0;

    if (total === 0) return null;

    const severity = critical > 0 ? 'critical' : high > 0 ? 'high' : 'medium';
    const config = severityConfig[severity];
    const Icon = config.icon;

    return (
        <button
            onClick={onClick}
            className={`
        relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold
        ${config.bg} ${config.text} border ${config.border}
        hover:shadow-md transition-all cursor-pointer
        ${config.pulse ? 'animate-pulse' : ''}
      `}
        >
            <Icon className={`w-4 h-4 ${config.iconColor}`} />
            <span>{total} Warning{total !== 1 ? 's' : ''}</span>
        </button>
    );
}
