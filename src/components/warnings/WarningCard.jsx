import { useState } from 'react';
import {
    AlertTriangle,
    AlertCircle,
    Info,
    ShieldAlert,
    Pill,
    Activity,
    Check,
    Clock,
    User,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';

const severityConfig = {
    critical: {
        bg: 'bg-gradient-to-r from-red-50 to-red-100',
        border: 'border-l-4 border-l-red-500 border-red-200',
        icon: ShieldAlert,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        title: 'text-red-900'
    },
    high: {
        bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
        border: 'border-l-4 border-l-orange-500 border-orange-200',
        icon: AlertTriangle,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        title: 'text-orange-900'
    },
    medium: {
        bg: 'bg-gradient-to-r from-yellow-50 to-amber-100',
        border: 'border-l-4 border-l-yellow-500 border-yellow-200',
        icon: AlertCircle,
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        title: 'text-yellow-900'
    },
    low: {
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
        border: 'border-l-4 border-l-blue-500 border-blue-200',
        icon: Info,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        title: 'text-blue-900'
    }
};

const warningTypeLabels = {
    drug_interaction: 'Drug Interaction',
    allergy: 'Allergy Alert',
    contraindication: 'Contraindication',
    abnormal_pattern: 'Abnormal Pattern',
    dosage_alert: 'Dosage Alert',
    duplicate_therapy: 'Duplicate Therapy'
};

export default function WarningCard({
    warning,
    onAcknowledge,
    showPatientInfo = false,
    compact = false
}) {
    const [expanded, setExpanded] = useState(!compact);
    const [acknowledging, setAcknowledging] = useState(false);

    const config = severityConfig[warning.severity] || severityConfig.medium;
    const Icon = config.icon;

    const handleAcknowledge = async () => {
        if (acknowledging) return;
        setAcknowledging(true);
        try {
            await onAcknowledge?.(warning.id);
        } finally {
            setAcknowledging(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy h:mm a');
        } catch {
            return dateString;
        }
    };

    return (
        <div
            className={`
        rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow
        ${config.bg} ${config.border} border
      `}
        >
            {/* Header */}
            <div
                className={`p-4 ${compact ? 'cursor-pointer' : ''}`}
                onClick={() => compact && setExpanded(!expanded)}
            >
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${config.iconBg} flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${config.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h4 className={`font-bold ${config.title}`}>{warning.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`
                    px-2 py-0.5 rounded text-xs font-semibold uppercase
                    ${config.iconBg} ${config.iconColor}
                  `}>
                                        {warning.severity}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {warningTypeLabels[warning.warning_type] || warning.warning_type}
                                    </span>
                                </div>
                            </div>

                            {compact && (
                                <button className="p-1 hover:bg-white/50 rounded-lg transition-colors">
                                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                            )}
                        </div>

                        {/* Expanded Content */}
                        {expanded && (
                            <div className="mt-4 space-y-3">
                                <p className="text-gray-700">{warning.description}</p>

                                {/* Related Items */}
                                <div className="flex flex-wrap gap-4">
                                    {warning.related_medications?.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Pill className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">
                                                {warning.related_medications.join(', ')}
                                            </span>
                                        </div>
                                    )}
                                    {warning.related_conditions?.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">
                                                {warning.related_conditions.join(', ')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Recommendation */}
                                {warning.recommendation && (
                                    <div className="p-3 bg-white/60 rounded-lg border border-white">
                                        <p className="text-sm font-medium text-gray-900">Recommendation:</p>
                                        <p className="text-sm text-gray-700 mt-1">{warning.recommendation}</p>
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className="flex items-center justify-between pt-3 border-t border-white/50">
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(warning.created_at)}
                                        </div>
                                        {warning.is_acknowledged && warning.acknowledged_by && (
                                            <div className="flex items-center gap-1 text-green-600">
                                                <Check className="w-3 h-3" />
                                                Acknowledged
                                            </div>
                                        )}
                                    </div>

                                    {/* Acknowledge Button */}
                                    {!warning.is_acknowledged && onAcknowledge && (
                                        <button
                                            onClick={handleAcknowledge}
                                            disabled={acknowledging}
                                            className="
                        flex items-center gap-2 px-4 py-2 
                        bg-white text-gray-700 font-medium rounded-lg
                        hover:bg-gray-50 border border-gray-200
                        transition-colors disabled:opacity-50
                      "
                                        >
                                            {acknowledging ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                                    Acknowledging...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Acknowledge
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
