import { Link } from 'react-router-dom';
import {
    Calendar,
    Clock,
    User,
    MapPin,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    MoreVertical,
    Sparkles
} from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';

const statusConfig = {
    scheduled: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: Calendar,
        label: 'Scheduled'
    },
    confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircle,
        label: 'Confirmed'
    },
    in_progress: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: Clock,
        label: 'In Progress'
    },
    completed: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: CheckCircle,
        label: 'Completed'
    },
    cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: XCircle,
        label: 'Cancelled'
    },
    no_show: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        icon: AlertCircle,
        label: 'No Show'
    }
};

const typeConfig = {
    checkup: { label: 'Check-up', color: 'blue' },
    follow_up: { label: 'Follow-up', color: 'purple' },
    consultation: { label: 'Consultation', color: 'indigo' },
    emergency: { label: 'Emergency', color: 'red' },
    procedure: { label: 'Procedure', color: 'orange' },
    lab_work: { label: 'Lab Work', color: 'teal' },
    other: { label: 'Other', color: 'gray' }
};

export default function AppointmentCard({
    appointment,
    onCancel,
    onComplete,
    onViewSummary,
    showPatientInfo = true,
    compact = false
}) {
    const status = statusConfig[appointment.status] || statusConfig.scheduled;
    const type = typeConfig[appointment.appointment_type] || typeConfig.other;
    const StatusIcon = status.icon;

    const formatDateTime = (dateTimeStr) => {
        try {
            const date = parseISO(dateTimeStr);
            return {
                date: format(date, 'MMM d, yyyy'),
                time: format(date, 'h:mm a'),
                isUpcoming: isAfter(date, new Date())
            };
        } catch {
            return { date: 'Invalid date', time: '', isUpcoming: false };
        }
    };

    const { date, time, isUpcoming } = formatDateTime(appointment.date_time);
    const canModify = ['scheduled', 'confirmed'].includes(appointment.status);

    if (compact) {
        return (
            <div className={`
        flex items-center justify-between p-4 rounded-xl border
        ${isUpcoming ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}
      `}>
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${status.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${status.text}`} />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{appointment.purpose}</p>
                        <p className="text-sm text-gray-500">{date} at {time}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                    {status.label}
                </span>
            </div>
        );
    }

    return (
        <div className={`
      bg-white rounded-2xl shadow-sm border overflow-hidden
      hover:shadow-md transition-shadow
      ${isUpcoming ? 'border-blue-200' : 'border-gray-200'}
    `}>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${isUpcoming ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${status.bg}`}>
                            <StatusIcon className={`w-5 h-5 ${status.text}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{appointment.purpose}</h3>
                            <span className={`
                inline-block px-2 py-0.5 rounded text-xs font-medium
                bg-${type.color}-100 text-${type.color}-700
              `}>
                                {type.label}
                            </span>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.text}`}>
                        {status.label}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Date & Time */}
                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-500">Date & Time</p>
                            <p className="font-semibold text-gray-900">{date}</p>
                            <p className="text-sm text-gray-600">{time} ({appointment.duration_minutes} min)</p>
                        </div>
                    </div>

                    {/* Patient */}
                    {showPatientInfo && appointment.patient_name && (
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Patient</p>
                                <Link
                                    to={`/patients/${appointment.patient_id}`}
                                    className="font-semibold text-blue-600 hover:underline"
                                >
                                    {appointment.patient_name}
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    {appointment.location && (
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="font-semibold text-gray-900">{appointment.location}</p>
                            </div>
                        </div>
                    )}

                    {/* Doctor */}
                    {appointment.doctor_name && (
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Doctor</p>
                                <p className="font-semibold text-gray-900">{appointment.doctor_name}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notes */}
                {appointment.notes && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="text-gray-700">{appointment.notes}</p>
                        </div>
                    </div>
                )}

                {/* Cancelled Reason */}
                {appointment.status === 'cancelled' && appointment.cancelled_reason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-sm text-red-600">
                            <strong>Cancellation Reason:</strong> {appointment.cancelled_reason}
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            {(canModify || onViewSummary) && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    {onViewSummary && (
                        <button
                            onClick={() => onViewSummary(appointment.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-md transition-all"
                        >
                            <Sparkles className="w-4 h-4" />
                            AI Briefing
                        </button>
                    )}
                    {canModify && onComplete && (
                        <button
                            onClick={() => onComplete(appointment.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Complete
                        </button>
                    )}
                    {canModify && onCancel && (
                        <button
                            onClick={() => onCancel(appointment.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 font-medium rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <XCircle className="w-4 h-4" />
                            Cancel
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
