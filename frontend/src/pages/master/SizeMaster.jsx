import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Download, Plus, Info, Check, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { exportToCSV } from '../../utils/exportCSV';
import apiClient from '../../utils/apiClient';

const SizeMaster = () => {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ value: '' });

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/master/sizes');
      setSizes(data);
    } catch(err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSizes(); }, []);

  const [newSizeValue, setNewSizeValue] = useState('');

  const handleAddSize = async (e) => {
    e.preventDefault();
    if (!newSizeValue) return alert('Size Value is required!');
    
    try {
      await apiClient.post('/master/sizes', { value: newSizeValue });
      setNewSizeValue('');
      fetchSizes();
    } catch(err) {
      alert('Error creating size: ' + err.message);
    }
  };

  const handleEditInit = (size) => {
    setEditingId(size.id);
    setEditForm({ value: size.value });
  };

  const handleEditSubmit = async (id) => {
    try {
      await apiClient.put(`/master/sizes/${id}`, editForm);
      setEditingId(null);
      fetchSizes();
    } catch(err) {
      alert("Failed saving edits: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this size variant?")) return;
    try {
      await apiClient.delete(`/master/sizes/${id}`);
      fetchSizes();
    } catch(err) {
      alert("Error deleting record: " + err.message);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 grid grid-cols-12 gap-8 custom-scrollbar">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Size Configurations</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Dimensional Product Arrays</p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2" onClick={() => exportToCSV(sizes, 'Feather_Fine_Sizes.csv')}>
            <Download size={14} /> EXPORT CSV
          </Button>
        </div>

        {loading ? <Loader text="Calculating Spatial Dimensions..." /> : error ? (
            <div className="bg-error/10 border border-error/50 p-4 rounded text-error text-xs uppercase font-bold tracking-wider">{error}</div>
        ) : (
        <div className="bg-primary/5 rounded-lg border border-outline/30 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary/20 border-b border-primary/30">
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Dim ID</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Scale Value</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 text-right">Sanitize Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/20">
              {sizes.length === 0 && (
                <tr><td colSpan="3" className="px-6 py-8 flex justify-center text-slate-500 text-xs tracking-wider uppercase">NO RECORDS FOUND</td></tr>
              )}
              {sizes.map((size) => (
                <tr key={size.id} className="hover:bg-primary/10 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-secondary">{size.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-200">
                    {editingId === size.id ? (
                      <input 
                        className="bg-[#13181f] border border-secondary text-white text-xs px-2 py-1 w-full"
                        value={editForm.value}
                        onChange={(e) => setEditForm({...editForm, value: e.target.value})}
                      />
                    ) : size.value}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      {editingId === size.id ? (
                         <>
                           <button className="text-secondary hover:text-green-400 transition-colors" onClick={() => handleEditSubmit(size.id)}><Check size={18} /></button>
                           <button className="text-slate-500 hover:text-error transition-colors" onClick={() => setEditingId(null)}><X size={18} /></button>
                         </>
                      ) : (
                         <>
                           <button className="text-slate-500 hover:text-secondary transition-colors" onClick={() => handleEditInit(size)}><Pencil size={18} /></button>
                           <button className="text-slate-500 hover:text-error transition-colors" onClick={() => handleDelete(size.id)}><Trash2 size={18} /></button>
                         </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      <div className="col-span-12 lg:col-span-4">
        <div className="sticky top-8">
          <div className="bg-surface-container border border-primary/50 rounded-lg p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Initialize New Dimension</h3>
            <form className="space-y-6" onSubmit={handleAddSize}>
              <Input 
                label="Size Value Parameter" 
                placeholder="e.g., L, 42, 100cm" 
                value={newSizeValue}
                onChange={(e) => setNewSizeValue(e.target.value)}
              />
              <div className="pt-4">
                <button type="submit" className="w-full bg-secondary hover:bg-secondary-fixed-dim text-surface-container-lowest font-black uppercase text-xs tracking-widest py-4 rounded-sm transition-all shadow-[0_0_20px_rgba(0,200,83,0.2)] hover:scale-[1.02] active:scale-[0.98]">
                  Append Dimensional Map
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeMaster;
