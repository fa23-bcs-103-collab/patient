import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    ShieldAlert,
    TrendingUp,
    Users,
    RefreshCw,
    Sparkles
} from 'lucide-react';
import WarningList from '../components/warnings/WarningList';
import { warningApi, getPatients } from '../services/api';

export default function Warnings() {
    const [warnings, setWarnings] = useState([]);
    const [stats, setStats] = useState(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [warningsRes, statsRes, patientsRes] = await Promise.all([
                warningApi.getUnacknowledgedWarnings(100),
                warningApi.getWarningStats(),
                getPatients()
            ]);
            setWarnings(warningsRes.data);
            setStats(statsRes.data);
            setPatients(patientsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (warningId) => {
        try {
            await warningApi.acknowledgeWarning(warningId);
            setWarnings(prev => prev.filter(w => w.id !== warningId));
            // Refresh stats
            const statsRes = await warningApi.getWarningStats();
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error acknowledging warning:', error);
        }
    };

    const handleAnalyzePatient = async () => {
        if (!selectedPatient) return;

        setAnalyzing(true);
        try {
            const result = await warningApi.analyzePatient(selectedPatient);
            if (result.data.length > 0) {
                setWarnings(prev => [...result.data, ...prev]);
                const statsRes = await warningApi.getWarningStats();
                setStats(statsRes.data);
            }
            alert(`Analysis complete. Found ${result.data.length} new warning(s).`);
        } catch (error) {
            console.error('Error analyzing patient:', error);
            alert('Error analyzing patient. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    // Group warnings by patient
    const warningsByPatient = warnings.reduce((acc, warning) => {
        const patientId = warning.patient_id;
        if (!acc[patientId]) {
            acc[patientId] = [];
        }
        acc[patientId].push(warning);
        return acc;
    }, {});

    const getPatientName = (patientId) => {
        const patient = patients.find(p => p._id === patientId);
        return patient?.name || 'Unknown Patient';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Warnings</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {stats?.total || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-gray-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Critical</p>
                                <p className="text-3xl font-bold text-red-600 mt-1">
                                    {stats?.by_severity?.critical || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-xl">
                                <ShieldAlert className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">High Priority</p>
                                <p className="text-3xl font-bold text-orange-600 mt-1">
                                    {stats?.by_severity?.high || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Patients Affected</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">
                                    {Object.keys(warningsByPatient).length}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Analysis Section */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">AI-Powered Analysis</h3>
                                <p className="text-purple-100">Analyze a patient's data for potential clinical warnings</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={selectedPatient}
                                onChange={(e) => setSelectedPatient(e.target.value)}
                                className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 outline-none min-w-[200px]"
                            >
                                <option value="" className="text-gray-900">Select a patient...</option>
                                {patients.map(patient => (
                                    <option key={patient._id} value={patient._id} className="text-gray-900">
                                        {patient.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={handleAnalyzePatient}
                                disabled={!selectedPatient || analyzing}
                                className="flex items-center gap-2 px-6 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {analyzing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Analyze
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Warnings List */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <WarningList
                        warnings={warnings}
                        loading={loading}
                        onAcknowledge={handleAcknowledge}
                        onRefresh={fetchData}
                        title="All Unacknowledged Warnings"
                        emptyMessage="No unacknowledged warnings. Great job keeping patients safe!"
                    />
                </div>

                {/* Warnings by Patient */}
                {Object.keys(warningsByPatient).length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Warnings by Patient</h3>
                        <div className="grid gap-4">
                            {Object.entries(warningsByPatient).map(([patientId, patientWarnings]) => (
                                <div key={patientId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <Link
                                            to={`/patients/${patientId}`}
                                            className="font-semibold text-blue-600 hover:underline"
                                        >
                                            {getPatientName(patientId)}
                                        </Link>
                                        <span className="text-sm text-gray-500">
                                            {patientWarnings.length} warning{patientWarnings.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {patientWarnings.slice(0, 3).map(w => (
                                            <span
                                                key={w.id}
                                                className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${w.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                                        w.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                                            w.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-blue-100 text-blue-700'}
                        `}
                                            >
                                                {w.title}
                                            </span>
                                        ))}
                                        {patientWarnings.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                +{patientWarnings.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
