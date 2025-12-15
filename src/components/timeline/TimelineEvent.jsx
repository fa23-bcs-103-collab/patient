import {
    Pill,
    Heart,
    Calendar,
    AlertTriangle,
    Activity,
    CheckCircle,
    Clock,
    Stethoscope
} from 'lucide-react';

const eventTypeConfig = {
    condition: {
        icon: Heart,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        label: 'Diagnosis'
    },
    condition_resolved: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        label: 'Resolved'
    },
    medication_start: {
        icon: Pill,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        label: 'Medication Started'
    },
    medication_end: {
        icon: Pill,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        label: 'Medication Ended'
    },
    appointment: {
        icon: Calendar,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
        label: 'Appointment'
    },
    warning: {
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300',
        label: 'Warning'
    },
    default: {
        icon: Activity,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        label: 'Event'
    }
};

export default function TimelineEvent({ event, isLast = false }) {
    const config = eventTypeConfig[event.type] || eventTypeConfig.default;
    const Icon = config.icon;

    return (
        <div className="relative flex gap-4">
            {/* Timeline Line */}
            {!isLast && (
                <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Icon */}
            <div className={`
        relative z-10 flex-shrink-0 w-10 h-10 rounded-full 
        ${config.bgColor} ${config.borderColor} border-2
        flex items-center justify-center
      `}>
                <Icon className={`w-5 h-5 ${config.color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                            <span className={`
                inline-block px-2 py-0.5 rounded text-xs font-semibold mb-1
                ${config.bgColor} ${config.color}
              `}>
                                {config.label}
                            </span>
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {event.date_display}
                        </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                        <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                    )}

                    {/* Metadata */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {event.metadata.severity && (
                                <span className={`
                  px-2 py-0.5 rounded text-xs font-medium
                  ${event.metadata.severity === 'severe' ? 'bg-red-100 text-red-700' :
                                        event.metadata.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'}
                `}>
                                    {event.metadata.severity}
                                </span>
                            )}
                            {event.metadata.dosage && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                    {event.metadata.dosage}
                                </span>
                            )}
                            {event.metadata.status && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                    {event.metadata.status}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
