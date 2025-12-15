import { useState, useEffect } from 'react';
import {
    Calendar,
    Plus,
    RefreshCw,
    Clock,
    CheckCircle,
    XCircle,
    Users,
    Filter,
    Sparkles,
    X
} from 'lucide-react';
import AppointmentCard from '../components/appointments/AppointmentCard';
import AppointmentForm from '../components/appointments/AppointmentForm';
import { appointmentApi } from '../services/api';
import ReactMarkdown from 'react-markdown';

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [aiSummary, setAiSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [appointmentsRes, statsRes] = await Promise.all([
                appointmentApi.getUpcoming(50),
                appointmentApi.getStats()
            ]);
            setAppointments(appointmentsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAppointment = async (data) => {
        setFormLoading(true);
        try {
            const response = await appointmentApi.create(data);
            setAppointments(prev => [response.data, ...prev]);
            setShowForm(false);
            // Refresh stats
            const statsRes = await appointmentApi.getStats();
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error creating appointment:', error);
            if (error.response?.data?.detail?.conflicts) {
                alert('Scheduling conflict detected. Please choose a different time.');
            } else {
                alert('Error creating appointment. Please try again.');
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleCancel = async (appointmentId) => {
        const reason = prompt('Cancellation reason (optional):');
        try {
            await appointmentApi.cancel(appointmentId, reason);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Error cancelling appointment. Please try again.');
        }
    };

    const handleComplete = async (appointmentId) => {
        const notes = prompt('Completion notes (optional):');
        try {
            await appointmentApi.complete(appointmentId, notes);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Error completing appointment:', error);
            alert('Error completing appointment. Please try again.');
        }
    };

    const handleViewSummary = async (appointmentId) => {
        setSummaryLoading(true);
        setAiSummary({ loading: true, appointmentId });
        try {
            const response = await appointmentApi.getSummary(appointmentId);
            setAiSummary(response.data);
        } catch (error) {
            console.error('Error fetching summary:', error);
            setAiSummary({ error: 'Failed to generate summary' });
        } finally {
            setSummaryLoading(false);
        }
    };

    // Filter appointments
    const filteredAppointments = statusFilter === 'all'
        ? appointments
        : appointments.filter(a => a.status === statusFilter);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                            <p className="text-gray-600">Schedule and manage patient appointments</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            New Appointment
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                            </div>
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Scheduled</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {(stats?.by_status?.scheduled || 0) + (stats?.by_status?.confirmed || 0)}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Completed</p>
                                <p className="text-3xl font-bold text-green-600">{stats?.by_status?.completed || 0}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Cancelled</p>
                                <p className="text-3xl font-bold text-red-600">{stats?.by_status?.cancelled || 0}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 mb-6">
                    <Filter className="w-5 h-5 text-gray-500" />
                    {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all
                ${statusFilter === status
                                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}
              `}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Appointments List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading appointments...</p>
                        </div>
                    </div>
                ) : filteredAppointments.length > 0 ? (
                    <div className="grid gap-6">
                        {filteredAppointments.map(appointment => (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                onCancel={handleCancel}
                                onComplete={handleComplete}
                                onViewSummary={handleViewSummary}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Appointments</h3>
                        <p className="text-gray-500 mb-6">
                            {statusFilter === 'all'
                                ? 'Start by scheduling a new appointment'
                                : `No ${statusFilter} appointments found`}
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Schedule Appointment
                        </button>
                    </div>
                )}

                {/* New Appointment Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">New Appointment</h2>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="p-6">
                                <AppointmentForm
                                    onSubmit={handleCreateAppointment}
                                    onCancel={() => setShowForm(false)}
                                    loading={formLoading}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Summary Modal */}
                {aiSummary && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl">
                                <div className="flex items-center gap-3 text-white">
                                    <Sparkles className="w-6 h-6" />
                                    <h2 className="text-xl font-bold">Pre-Appointment Briefing</h2>
                                </div>
                                <button
                                    onClick={() => setAiSummary(null)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                            <div className="p-6">
                                {summaryLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                                            <p className="text-gray-600">Generating AI briefing...</p>
                                        </div>
                                    </div>
                                ) : aiSummary.error ? (
                                    <div className="text-center py-8 text-red-600">
                                        <p>{aiSummary.error}</p>
                                    </div>
                                ) : (
                                    <div>
                                        {aiSummary.patient_name && (
                                            <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                                                <p className="text-sm text-purple-600">Patient: <strong>{aiSummary.patient_name}</strong></p>
                                                <p className="text-sm text-purple-600">Purpose: <strong>{aiSummary.purpose}</strong></p>
                                            </div>
                                        )}
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown>{aiSummary.summary}</ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
