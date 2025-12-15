import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    RefreshCw,
    Filter,
    Search,
    LayoutGrid,
    List
} from 'lucide-react';
import WarningCard from './WarningCard';
import WarningBadge from './WarningBadge';

export default function WarningList({
    warnings,
    loading,
    onAcknowledge,
    onRefresh,
    emptyMessage = "No warnings found",
    title = "Clinical Warnings",
    showFilters = true
}) {
    const [filteredWarnings, setFilteredWarnings] = useState(warnings);
    const [severityFilter, setSeverityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'compact'

    useEffect(() => {
        let result = warnings || [];

        // Filter by severity
        if (severityFilter !== 'all') {
            result = result.filter(w => w.severity === severityFilter);
        }

        // Filter by type
        if (typeFilter !== 'all') {
            result = result.filter(w => w.warning_type === typeFilter);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(w =>
                w.title?.toLowerCase().includes(query) ||
                w.description?.toLowerCase().includes(query) ||
                w.related_medications?.some(m => m.toLowerCase().includes(query)) ||
                w.related_conditions?.some(c => c.toLowerCase().includes(query))
            );
        }

        setFilteredWarnings(result);
    }, [warnings, severityFilter, typeFilter, searchQuery]);

    // Get unique types from warnings
    const warningTypes = [...new Set(warnings?.map(w => w.warning_type) || [])];

    // Count by severity
    const severityCounts = {
        critical: warnings?.filter(w => w.severity === 'critical').length || 0,
        high: warnings?.filter(w => w.severity === 'high').length || 0,
        medium: warnings?.filter(w => w.severity === 'medium').length || 0,
        low: warnings?.filter(w => w.severity === 'low').length || 0,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                        <p className="text-sm text-gray-500">
                            {warnings?.length || 0} total warnings
                        </p>
                    </div>
                </div>

                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                )}
            </div>

            {/* Severity Summary */}
            <div className="flex flex-wrap gap-3">
                {['critical', 'high', 'medium', 'low'].map(severity => (
                    severityCounts[severity] > 0 && (
                        <button
                            key={severity}
                            onClick={() => setSeverityFilter(severityFilter === severity ? 'all' : severity)}
                            className={`transition-transform ${severityFilter === severity ? 'scale-105' : ''}`}
                        >
                            <WarningBadge
                                severity={severity}
                                count={severityCounts[severity]}
                                size="md"
                            />
                        </button>
                    )
                ))}
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search warnings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Types</option>
                        {warningTypes.map(type => (
                            <option key={type} value={type}>
                                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                        ))}
                    </select>

                    {/* Severity Filter */}
                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('compact')}
                            className={`p-2 rounded ${viewMode === 'compact' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Warning List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading warnings...</p>
                    </div>
                </div>
            ) : filteredWarnings?.length > 0 ? (
                <div className="space-y-4">
                    {filteredWarnings.map(warning => (
                        <WarningCard
                            key={warning.id}
                            warning={warning}
                            onAcknowledge={onAcknowledge}
                            compact={viewMode === 'compact'}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{emptyMessage}</p>
                </div>
            )}
        </div>
    );
}
