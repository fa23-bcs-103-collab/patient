import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPatient, getSummary } from "../services/api";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, User, Calendar, Heart, Pill, FileText,
  Sparkles, AlertCircle, Activity, Clock, Edit
} from "lucide-react";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState("");

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const res = await getPatient(id);
      setPatient(res.data);

      setSummaryLoading(true);
      const sumRes = await getSummary(id, "Summarize medical history and suggest treatment");
      // Handle different response structures from the API
      const summaryData = sumRes.data;
      if (typeof summaryData === 'string') {
        setSummary(summaryData);
      } else if (summaryData?.text) {
        setSummary(summaryData.text);
      } else if (summaryData?.content) {
        setSummary(summaryData.content);
      } else if (summaryData?.message?.content) {
        setSummary(summaryData.message.content);
      } else {
        setSummary(JSON.stringify(summaryData));
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
      setSummaryLoading(false);
    }
  };

  const handleCustomQuery = async () => {
    if (!customQuery.trim()) return;

    try {
      setSummaryLoading(true);
      const sumRes = await getSummary(id, customQuery);
      // Handle different response structures from the API
      const summaryData = sumRes.data;
      if (typeof summaryData === 'string') {
        setSummary(summaryData);
      } else if (summaryData?.text) {
        setSummary(summaryData.text);
      } else if (summaryData?.content) {
        setSummary(summaryData.content);
      } else if (summaryData?.message?.content) {
        setSummary(summaryData.message.content);
      } else {
        setSummary(JSON.stringify(summaryData));
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Not Found</h2>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Patient List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
                <p className="text-sm text-gray-500">Complete medical record</p>
              </div>
            </div>
            <Link
              to={`/patients/${id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Patient
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Info Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-1">{patient.name}</h2>
                <p className="text-blue-100">Patient ID: {patient._id}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Age</p>
                <p className="text-xl font-bold text-gray-900">{patient.age} years</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-xl">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Gender</p>
                <p className="text-xl font-bold text-gray-900">{patient.gender}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Status</p>
                <p className="text-xl font-bold text-green-600">Active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Medical History */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-red-100 p-3 rounded-xl">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Medical History</h3>
            </div>
            {patient.medical_history && patient.medical_history.length > 0 ? (
              <div className="space-y-3">
                {patient.medical_history.map((condition, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <p className="text-gray-800 flex-1">{condition}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No medical history recorded</p>
            )}
          </div>

          {/* Medications */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-green-100 p-3 rounded-xl">
                <Pill className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Current Medications</h3>
            </div>
            {patient.medications && patient.medications.length > 0 ? (
              <div className="space-y-4">
                {patient.medications.map((med, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-r from-green-50 to-cyan-50 rounded-xl border border-green-100">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">{med.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${med.end_date ? 'bg-gray-200 text-gray-700' : 'bg-green-200 text-green-800'
                        }`}>
                        {med.end_date ? 'Completed' : 'Ongoing'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2"><span className="font-semibold">Dosage:</span> {med.dosage}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Started: {med.start_date}</span>
                      </div>
                      {med.end_date && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Ended: {med.end_date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No medications prescribed</p>
            )}
          </div>
        </div>

        {/* AI Summary Section */}
        <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg p-8 border border-purple-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">AI-Powered Medical Insights</h3>
              <p className="text-sm text-gray-600">Generated using advanced medical analysis</p>
            </div>
          </div>

          {/* Custom Query Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ask a specific question about this patient
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="e.g., What are the treatment options for this patient's conditions?"
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleCustomQuery()}
              />
              <button
                onClick={handleCustomQuery}
                disabled={summaryLoading || !customQuery.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {summaryLoading ? 'Analyzing...' : 'Ask AI'}
              </button>
            </div>
          </div>

          {/* Summary Display */}
          {summaryLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Generating AI insights...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 border border-purple-200">
              <div className="flex items-start space-x-3 mb-4">
                <FileText className="w-5 h-5 text-purple-600 mt-1" />
                <h4 className="text-lg font-bold text-gray-900">Analysis Result</h4>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                {summary ? (
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-900 mt-4 mb-2" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2" {...props} />,
                      p: ({ node, ...props }) => <p className="text-gray-700 mb-3" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                      em: ({ node, ...props }) => <em className="italic" {...props} />,
                      code: ({ node, ...props }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />,
                      pre: ({ node, ...props }) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3" {...props} />,
                      blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-purple-500 pl-4 italic my-3" {...props} />,
                    }}
                  >
                    {summary}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-500 italic">No summary generated yet. Use the input above to ask a question.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}