import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loader from '../../components/ui/Loader';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { ChevronDown, Edit2, Filter, Plus } from 'lucide-react';

const ProductionList = ({ onAddNew, onEditEntry }) => {
  // Auth check - get user role from localStorage user object
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // API hooks
  const { data: allEntries, loading, error, execute: fetchAllEntries } = useApi('/inventory/production', {}, []);
  const { data: dailyStats, execute: fetchDailyStats } = useApi('/reports/daily', {}, { totalWeightKg: 0, totalMeterM: 0, totalEntries: 0 });
  const { data: masterData, loading: masterLoading, error: masterError, execute: fetchMasterData } = useApi('/master/all', {}, { items: [], colors: [], sizes: [], qualities: [] });

  // State
  const [displayEntries, setDisplayEntries] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [filterItem, setFilterItem] = useState('');
  const [filterQuality, setFilterQuality] = useState('');
  const [filterSize, setFilterSize] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchAllEntries();
    fetchDailyStats();
    fetchMasterData();
  }, [fetchAllEntries, fetchDailyStats, fetchMasterData]);

  // Apply filters whenever dependencies change
  useEffect(() => {
    if (!allEntries || allEntries.length === 0) {
      setDisplayEntries([]);
      return;
    }

    let filtered = [...allEntries];

    // Filter by date
    if (filterDate) {
      const selectedDate = new Date(filterDate);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.entryDate || entry.createdAt);
        return entryDate.toDateString() === selectedDate.toDateString();
      });
    }

    // Filter by item
    if (filterItem) {
      filtered = filtered.filter(entry => entry.itemId === filterItem);
    }

    // Filter by quality
    if (filterQuality) {
      filtered = filtered.filter(entry => entry.qualityId === filterQuality);
    }

    // Filter by size
    if (filterSize) {
      filtered = filtered.filter(entry => entry.sizeId === filterSize);
    }

    // Sort by date descending (newest first)
    filtered.sort((a, b) => new Date(b.entryDate || b.createdAt) - new Date(a.entryDate || a.createdAt));

    setDisplayEntries(filtered);
  }, [allEntries, filterDate, filterItem, filterQuality, filterSize]);

  // Clear all filters
  const handleClearFilters = () => {
    setFilterDate(new Date().toISOString().split('T')[0]);
    setFilterItem('');
    setFilterQuality('');
    setFilterSize('');
  };

  // Get filtered stats for the day
  const getTodayStats = () => {
    if (!displayEntries || displayEntries.length === 0) {
      return { entries: 0, totalWeight: 0, totalMeter: 0 };
    }
    return {
      entries: displayEntries.length,
      totalWeight: displayEntries.reduce((sum, e) => sum + (parseFloat(e.weightKg) || 0), 0),
      totalMeter: displayEntries.reduce((sum, e) => sum + (parseFloat(e.lengthMeter) || 0), 0)
    };
  };

  const stats = getTodayStats();

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen text-slate-100"><Loader text="Loading Production Records..." /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={error} retryFunction={fetchAllEntries} /></div>;

  return (
    <div className="pt-2 pb-12 w-full min-h-screen">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-500 mb-1">Production Hub</p>
            <h3 className="text-2xl font-extrabold text-white">Production Records</h3>
            <p className="text-xs text-slate-400 mt-1">{stats.entries} entries • {stats.totalWeight.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Kg • {stats.totalMeter.toLocaleString('en-IN', { maximumFractionDigits: 2 })} m</p>
          </div>
          <button
            onClick={onAddNew}
            className="bg-green-500 text-slate-900 px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all active:scale-95"
            title="Add new production entry"
          >
            <Plus size={18} />
            ADD ENTRY
          </button>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 bg-blue-900/10 border border-blue-900/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-blue-400" />
              <h4 className="font-semibold text-white text-sm">Filters</h4>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ChevronDown size={20} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 pb-4 border-b border-blue-900/30">
              {/* Date Filter */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mb-2">Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 py-2 outline-none transition-all"
                />
              </div>

              {/* Item Filter */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mb-2">Item</label>
                <select
                  value={filterItem}
                  onChange={(e) => setFilterItem(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 py-2 outline-none transition-all"
                >
                  <option value="">All Items</option>
                  {masterData.items.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* Quality Filter */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mb-2">Quality</label>
                <select
                  value={filterQuality}
                  onChange={(e) => setFilterQuality(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 py-2 outline-none transition-all"
                >
                  <option value="">All Quality</option>
                  {masterData.qualities.map(quality => (
                    <option key={quality.id} value={quality.id}>{quality.grade}</option>
                  ))}
                </select>
              </div>

              {/* Size Filter */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mb-2">Size</label>
                <select
                  value={filterSize}
                  onChange={(e) => setFilterSize(e.target.value)}
                  className="w-full bg-slate-800 border-slate-700 border rounded-lg text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 py-2 outline-none transition-all"
                >
                  <option value="">All Sizes</option>
                  {masterData.sizes.map(size => (
                    <option key={size.id} value={size.id}>{size.value}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                  title="Reset all filters to default"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Production Entries Table */}
        <div className="bg-slate-900 border border-blue-900/20 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/80 border-b border-blue-900/20">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Item</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Batch</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Quality</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Size</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Weight (Kg)</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Length (m)</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Color</th>
                  {isAdmin && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/10">
                {displayEntries && displayEntries.length > 0 ? (
                  displayEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`hover:bg-blue-900/5 transition-all ${isAdmin ? 'cursor-pointer' : ''}`}
                      onClick={() => isAdmin && onEditEntry(entry)}
                    >
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {entry.entryDate ? new Date(entry.entryDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        {entry.item?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-500">
                        {entry.batchNumber || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {entry.quality?.grade || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {entry.size?.value || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-white">
                        {(parseFloat(entry.weightKg) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-white">
                        {(parseFloat(entry.lengthMeter) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          {entry.color && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: entry.color.hexCode || '#888' }} title={`Primary: ${entry.color.name}`} />
                              <span className="text-xs text-white">{entry.color.name}</span>
                            </div>
                          )}
                          {entry.secondaryColor && (
                            <>
                              <span className="text-slate-500">,</span>
                              <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: entry.secondaryColor.hexCode || '#888' }} title={`Secondary: ${entry.secondaryColor.name}`} />
                                <span className="text-xs text-white">{entry.secondaryColor.name}</span>
                              </div>
                            </>
                          )}
                          {entry.accentColor && (
                            <>
                              <span className="text-slate-500">,</span>
                              <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: entry.accentColor.hexCode || '#888' }} title={`Accent: ${entry.accentColor.name}`} />
                                <span className="text-xs text-white">{entry.accentColor.name}</span>
                              </div>
                            </>
                          )}
                          {!entry.color && !entry.secondaryColor && !entry.accentColor && (
                            <span className="text-xs text-slate-500">-</span>
                          )}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEntry(entry);
                            }}
                            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                            title="Edit this entry (Admin only)"
                          >
                            <Edit2 size={14} />
                            {/* Edit */}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 9 : 8} className="px-6 py-12 text-center text-slate-500 text-sm">
                      No production entries found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionList;
