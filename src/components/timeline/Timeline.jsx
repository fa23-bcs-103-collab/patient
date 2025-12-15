import { useState, useEffect } from 'react';
import {
    Clock,
    Filter,
    Sparkles,
    RefreshCw,
    ChevronDown,
    Pill,
    Heart,
    Calendar,
    AlertTriangle
} from 'lucide-react';
import TimelineEvent from './TimelineEvent';
import ReactMarkdown from 'react-markdown';

const eventTypeFilters = [
    { value: 'all', label: 'All Events', icon: Clock },
    { value: 'condition', label: 'Diagnoses', icon: Heart },
    { value: 'medication_start', label: 'Medications', icon: Pill },
    { value: 'appointment', label: 'Appointments', icon: Calendar },
    { value: 'warning', label: 'Warnings', icon: AlertTriangle },
];

export default function Timeline({
    events,
    loading,
    summary,
    summaryLoading,
    onRefresh,
    onGenerateSummary,
    title = "Medical Timeline"
}) {
    const [filteredEvents, setFilteredEvents] = useState(events);
    const [typeFilter, setTypeFilter] = useState('all');
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        if (typeFilter === 'all') {
            setFilteredEvents(events);
        } else {
            setFilteredEvents(events?.filter(e =>
                e.type === typeFilter ||
                (typeFilter === 'medication_start' && e.type === 'medication_end') ||
                (typeFilter === 'condition' && e.type === 'condition_resolved')
            ) || []);
        }
    }, [events, typeFilter]);

    // Stats
    const stats = {
        conditions: events?.filter(e => e.type === 'condition').length || 0,
        medications: events?.filter(e => e.type === 'medication_start').length || 0,
        appointments: events?.filter(e => e.type === 'appointment').length || 0,
        warnings: events?.filter(e => e.type === 'warning').length || 0,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                        <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                        <p className="text-sm text-gray-500">{events?.length || 0} events recorded</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onGenerateSummary && (
                        <button
                            onClick={() => {
                                setShowSummary(true);
                                onGenerateSummary();
                            }}
                            disabled={summaryLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            <Sparkles className={`w-4 h-4 ${summaryLoading ? 'animate-pulse' : ''}`} />
                            {summaryLoading ? 'Generating...' : 'AI Summary'}
                        </button>
                    )}
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700">Conditions</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">{stats.conditions}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                        <Pill className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Medications</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{stats.medications}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Appointments</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{stats.appointments}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-700">Warnings</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900">{stats.warnings}</p>
                </div>
            </div>

            {/* AI Summary */}
            {showSummary && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <h3 className="font-bold text-gray-900">AI Timeline Summary</h3>
                    </div>
                    {summaryLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-gray-600 text-sm">Analyzing timeline...</p>
                            </div>
                        </div>
                    ) : summary ? (
                        <div className="prose prose-sm max-w-none text-gray-700">
                            <ReactMarkdown>{summary}</ReactMarkdown>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Click "AI Summary" to generate insights.</p>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                {eventTypeFilters.map(filter => {
                    const Icon = filter.icon;
                    const isActive = typeFilter === filter.value;
                    return (
                        <button
                            key={filter.value}
                            onClick={() => setTypeFilter(filter.value)}
                            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all
                ${isActive
                                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}
              `}
                        >
                            <Icon className="w-4 h-4" />
                            {filter.label}
                        </button>
                    );
                })}
            </div>

            {/* Timeline */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading timeline...</p>
                    </div>
                </div>
            ) : filteredEvents?.length > 0 ? (
                <div className="relative">
                    {filteredEvents.map((event, index) => (
                        <TimelineEvent
                            key={`${event.type}-${index}`}
                            event={event}
                            isLast={index === filteredEvents.length - 1}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No timeline events to display</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Events will appear as medical history and medications are added
                    </p>
                </div>
            )}
        </div>
    );
}
