import { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    User,
    FileText,
    MapPin,
    X,
    Loader2
} from 'lucide-react';
import { getPatients } from '../../services/api';

const appointmentTypes = [
    { value: 'checkup', label: 'Check-up' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'procedure', label: 'Procedure' },
    { value: 'lab_work', label: 'Lab Work' },
    { value: 'other', label: 'Other' },
];

const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
];

export default function AppointmentForm({
    onSubmit,
    onCancel,
    initialData = null,
    loading = false,
    preselectedPatientId = null
}) {
    const [patients, setPatients] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [formData, setFormData] = useState({
        patient_id: preselectedPatientId || '',
        date_time: '',
        duration_minutes: 30,
        appointment_type: 'checkup',
        purpose: '',
        notes: '',
        location: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                patient_id: initialData.patient_id || '',
                date_time: initialData.date_time?.slice(0, 16) || '', // Format for datetime-local
                duration_minutes: initialData.duration_minutes || 30,
                appointment_type: initialData.appointment_type || 'checkup',
                purpose: initialData.purpose || '',
                notes: initialData.notes || '',
                location: initialData.location || ''
            });
        }
    }, [initialData]);

    const fetchPatients = async () => {
        try {
            const response = await getPatients();
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoadingPatients(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when field is modified
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.patient_id) {
            newErrors.patient_id = 'Please select a patient';
        }
        if (!formData.date_time) {
            newErrors.date_time = 'Please select a date and time';
        }
        if (!formData.purpose.trim()) {
            newErrors.purpose = 'Please enter a purpose';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        // Convert datetime-local to ISO format
        const submitData = {
            ...formData,
            date_time: new Date(formData.date_time).toISOString(),
            duration_minutes: parseInt(formData.duration_minutes)
        };

        onSubmit(submitData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-1" />
                    Patient *
                </label>
                {loadingPatients ? (
                    <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading patients...
                    </div>
                ) : (
                    <select
                        name="patient_id"
                        value={formData.patient_id}
                        onChange={handleChange}
                        disabled={!!preselectedPatientId}
                        className={`
              w-full px-4 py-3 bg-gray-50 border rounded-xl
              focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
              ${errors.patient_id ? 'border-red-300' : 'border-gray-200'}
              ${preselectedPatientId ? 'cursor-not-allowed' : ''}
            `}
                    >
                        <option value="">Select a patient...</option>
                        {patients.map(patient => (
                            <option key={patient._id} value={patient._id}>
                                {patient.name} ({patient.age} years, {patient.gender})
                            </option>
                        ))}
                    </select>
                )}
                {errors.patient_id && (
                    <p className="text-sm text-red-600 mt-1">{errors.patient_id}</p>
                )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        Date & Time *
                    </label>
                    <input
                        type="datetime-local"
                        name="date_time"
                        value={formData.date_time}
                        onChange={handleChange}
                        min={new Date().toISOString().slice(0, 16)}
                        className={`
              w-full px-4 py-3 bg-gray-50 border rounded-xl
              focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
              ${errors.date_time ? 'border-red-300' : 'border-gray-200'}
            `}
                    />
                    {errors.date_time && (
                        <p className="text-sm text-red-600 mt-1">{errors.date_time}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Clock className="inline w-4 h-4 mr-1" />
                        Duration
                    </label>
                    <select
                        name="duration_minutes"
                        value={formData.duration_minutes}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        {durationOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Type & Purpose */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Appointment Type
                    </label>
                    <select
                        name="appointment_type"
                        value={formData.appointment_type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        {appointmentTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        Location
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Room 101, Building A"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Purpose */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Purpose *
                </label>
                <input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    placeholder="e.g., Annual physical examination"
                    className={`
            w-full px-4 py-3 bg-gray-50 border rounded-xl
            focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
            ${errors.purpose ? 'border-red-300' : 'border-gray-200'}
          `}
                />
                {errors.purpose && (
                    <p className="text-sm text-red-600 mt-1">{errors.purpose}</p>
                )}
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="inline w-4 h-4 mr-1" />
                    Notes
                </label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any additional notes or instructions..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Calendar className="w-4 h-4" />
                            {initialData ? 'Update Appointment' : 'Schedule Appointment'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
