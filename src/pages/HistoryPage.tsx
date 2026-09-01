import React, { useState } from 'react';
import { 
  History, 
  Layers, 
  MapPin, 
  Calendar, 
  Clock, 
  Download, 
  Plus, 
  ArrowUpRight, 
  CheckCircle2, 
  Search, 
  Filter,
  FileSpreadsheet,
  Activity,
  Radio
} from 'lucide-react';
import { useRFData } from '../context/RFDataContext';
import { SurveySession } from '../types/rf';
import { ActivityBadge } from '../components/common/ActivityBadge';
import { RFTimeSeriesChart } from '../components/charts/RFTimeSeriesChart';
import { generateSurveyMeasurements } from '../lib/mockData';

interface HistoryPageProps {
  onNavigateToMap: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigateToMap }) => {
  const {
    surveys,
    activeSurvey,
    setActiveSurvey,
    createNewSurvey,
    exportSurveyDataCSV,
  } = useRFData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurveyForModal, setSelectedSurveyForModal] = useState<SurveySession | null>(null);
  const [isNewSurveyModalOpen, setIsNewSurveyModalOpen] = useState(false);

  // Form states for new survey
  const [newSurveyName, setNewSurveyName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newBand, setNewBand] = useState('2.4 GHz ISM (2400-2483.5 MHz)');

  const filteredSurveys = surveys.filter(
    (s) =>
      s.survey_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.survey_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createNewSurvey(newSurveyName, newLocation, newBand);
    setIsNewSurveyModalOpen(false);
    setNewSurveyName('');
    setNewLocation('');
  };

  const handleLoadSurvey = (survey: SurveySession) => {
    setActiveSurvey(survey);
    onNavigateToMap();
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-mono text-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface/80 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-neon/10 border border-cyan-neon/40 text-cyan-neon">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-wide">
              SURVEY SESSIONS ARCHIVE
            </h1>
            <p className="text-xs text-text-secondary">
              Review, analyze, and export historical 2.4 GHz field survey captures
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewSurveyModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-cyan-neon text-black font-bold text-xs hover:shadow-neon-cyan transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Initialize New Survey</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-surface/60 border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by survey code, name, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-void/80 border border-white/15 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-cyan-neon"
          />
        </div>

        <div className="text-xs text-text-muted">
          Showing <strong className="text-cyan-neon">{filteredSurveys.length}</strong> archived survey sessions
        </div>
      </div>

      {/* Historical Surveys Table */}
      <div className="rounded-2xl bg-surface/75 border border-white/10 overflow-hidden shadow-glass backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-card border-b border-white/10 text-[10px] text-text-muted uppercase">
              <tr>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Survey Name & Area</th>
                <th className="py-3.5 px-4">Timestamp & Duration</th>
                <th className="py-3.5 px-4">Avg / Peak RF</th>
                <th className="py-3.5 px-4">Samples</th>
                <th className="py-3.5 px-4">Activity Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSurveys.map((survey) => {
                const isActive = activeSurvey.id === survey.id;
                return (
                  <tr
                    key={survey.id}
                    className={`hover:bg-white/[0.03] transition-colors ${
                      isActive ? 'bg-cyan-neon/[0.04]' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-cyan-neon text-sm">
                        {survey.survey_code}
                      </span>
                      {isActive && (
                        <span className="block text-[9px] text-emerald-400 font-bold mt-0.5">
                          ACTIVE SESSION
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">
                        {survey.survey_name}
                      </div>
                      <div className="text-text-secondary text-[11px] flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-text-muted" />
                        <span>{survey.location_name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-text-muted" />
                        <span>{survey.start_time.substring(0, 10)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-text-muted text-[10px] mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{survey.duration_minutes} mins duration</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {survey.avg_rf_power} dBm <span className="text-text-muted text-[10px]">avg</span>
                      </div>
                      <div className="text-red-400 text-[10px] font-mono">
                        Peak: {survey.peak_rf_power} dBm
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-white font-bold">
                      {survey.sample_count} pts
                    </td>

                    <td className="py-3.5 px-4">
                      <ActivityBadge level={survey.primary_activity} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedSurveyForModal(survey)}
                          title="Inspect Telemetry Breakdown"
                          className="px-2.5 py-1 rounded bg-surface border border-white/10 text-text-secondary hover:text-white hover:border-cyan-neon transition-colors text-xs"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => handleLoadSurvey(survey)}
                          title="Load into Spatial Heatmap"
                          className="px-2.5 py-1 rounded bg-cyan-neon/15 border border-cyan-neon/40 text-cyan-neon font-bold hover:bg-cyan-neon hover:text-black transition-all text-xs flex items-center gap-1"
                        >
                          <span>Load Map</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Survey Inspector Modal */}
      {selectedSurveyForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-2xl bg-surface border border-cyan-neon/40 p-6 shadow-neon-cyan font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <span className="text-xs text-cyan-neon font-bold">
                  [{selectedSurveyForModal.survey_code}] INSPECTION REPORT
                </span>
                <h3 className="font-display text-xl font-bold text-white mt-1">
                  {selectedSurveyForModal.survey_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSurveyForModal(null)}
                className="text-text-muted hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Key Survey Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-void/80 border border-white/10">
                  <span className="text-text-muted block text-[10px]">AVG RF POWER</span>
                  <span className="text-base font-bold text-cyan-neon">
                    {selectedSurveyForModal.avg_rf_power} dBm
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-void/80 border border-white/10">
                  <span className="text-text-muted block text-[10px]">PEAK POWER</span>
                  <span className="text-base font-bold text-red-400">
                    {selectedSurveyForModal.peak_rf_power} dBm
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-void/80 border border-white/10">
                  <span className="text-text-muted block text-[10px]">TOTAL SAMPLES</span>
                  <span className="text-base font-bold text-emerald-400">
                    {selectedSurveyForModal.sample_count}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-void/80 border border-white/10">
                  <span className="text-text-muted block text-[10px]">DURATION</span>
                  <span className="text-base font-bold text-amber-400">
                    {selectedSurveyForModal.duration_minutes} mins
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedSurveyForModal.notes && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                  <span className="text-text-muted block text-[10px] uppercase">Field Observation Notes:</span>
                  <p className="text-white mt-1">{selectedSurveyForModal.notes}</p>
                </div>
              )}

              {/* Mini Survey Graph Preview */}
              <div>
                <span className="text-xs text-text-muted block mb-2 uppercase">
                  Survey Spectrum Timeline Profile
                </span>
                <RFTimeSeriesChart
                  data={generateSurveyMeasurements(selectedSurveyForModal, 60)}
                  height={220}
                />
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => exportSurveyDataCSV(selectedSurveyForModal.id)}
                  className="px-3.5 py-2 rounded-lg bg-surface border border-white/15 text-xs text-white hover:border-cyan-neon flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Survey CSV</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedSurveyForModal(null)}
                    className="px-4 py-2 rounded-lg bg-surface border border-white/10 text-text-secondary hover:text-white text-xs"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleLoadSurvey(selectedSurveyForModal);
                      setSelectedSurveyForModal(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-cyan-neon text-black font-bold text-xs hover:shadow-neon-cyan"
                  >
                    Load into Spatial Heatmap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Survey Creation Modal */}
      {isNewSurveyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-cyan-neon/40 p-6 shadow-neon-cyan font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-display font-bold text-lg text-white">
                START NEW RF SURVEY
              </h3>
              <button
                onClick={() => setIsNewSurveyModalOpen(false)}
                className="text-text-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-text-secondary uppercase mb-1">
                  Survey Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Campus East Quad Survey"
                  value={newSurveyName}
                  onChange={(e) => setNewSurveyName(e.target.value)}
                  className="w-full bg-void/80 border border-white/15 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-neon"
                />
              </div>

              <div>
                <label className="block text-text-secondary uppercase mb-1">
                  Survey Area / Target Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Science Building Lab Complex"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-void/80 border border-white/15 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-neon"
                />
              </div>

              <div>
                <label className="block text-text-secondary uppercase mb-1">
                  Frequency Band
                </label>
                <input
                  type="text"
                  value={newBand}
                  onChange={(e) => setNewBand(e.target.value)}
                  className="w-full bg-void/80 border border-white/15 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-neon"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewSurveyModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface border border-white/10 text-text-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-neon text-black font-bold hover:shadow-neon-cyan"
                >
                  Begin Field Logging
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
