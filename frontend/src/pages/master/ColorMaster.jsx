import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Download, Plus, Info, Check, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { exportToCSV } from '../../utils/exportCSV';
import apiClient from '../../utils/apiClient';

const ColorMaster = () => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', hexCode: '' });

  const fetchColors = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/master/colors');
      setColors(data);
    } catch(err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchColors(); }, []);

  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('');

  const handleAddColor = async (e) => {
    e.preventDefault();
    if (!newColorName) return alert('Color Name is required!');
    
    try {
      await apiClient.post('/master/colors', { name: newColorName, hexCode: newColorHex });
      setNewColorName(''); setNewColorHex('');
      fetchColors();
    } catch(err) {
      alert("Error creating color: " + err.message);
    }
  };

  const handleEditInit = (color) => {
    setEditingId(color.id);
    setEditForm({ name: color.name, hexCode: color.hexCode });
  };

  const handleEditSubmit = async (id) => {
    try {
      await apiClient.put(`/master/colors/${id}`, editForm);
      setEditingId(null);
      fetchColors();
    } catch(err) {
      alert('Error saving edits: ' + err.message);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this color permanently?")) return;
    try {
      await apiClient.delete(`/master/colors/${id}`);
      fetchColors();
    } catch(err) {
      alert('Error deleting: ' + err.message);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 grid grid-cols-12 gap-8 custom-scrollbar">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Color Registry</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Spectral Database</p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2" onClick={() => exportToCSV(colors, 'Feather_Fine_Colors.csv')}>
            <Download size={14} /> EXPORT CSV
          </Button>
        </div>

        {loading ? <Loader text="Querying Spectral Variants..." /> : error ? (
            <div className="bg-error/10 border border-error/50 p-4 rounded text-error text-xs uppercase font-bold tracking-wider">{error}</div>
        ) : (
        <div className="bg-primary/5 rounded-lg border border-outline/30 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary/20 border-b border-primary/30">
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Color ID</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Title</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Hex Value</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/20">
              {colors.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-8 flex justify-center text-slate-500 text-xs tracking-wider uppercase">NO RECORDS FOUND</td></tr>
              )}
              {colors.map((color) => (
                <tr key={color.id} className="hover:bg-primary/10 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-secondary">{color.id.slice(0, 8)}...</td>

                  <td className="px-6 py-4 text-sm font-medium text-slate-200">
                    {editingId === color.id ? (
                      <input 
                        className="bg-[#13181f] border border-secondary text-white text-xs px-2 py-1 w-full"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                    ) : color.name}
                  </td>

                  <td className="px-6 py-4">
                    {editingId === color.id ? (
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={editForm.hexCode || '#ffffff'}
                          onChange={(e) => setEditForm({...editForm, hexCode: e.target.value})}
                          className="w-10 h-6 p-0 border-0 bg-transparent rounded"
                        />
                        <input 
                          className="bg-[#13181f] border border-secondary text-white text-xs px-2 py-1 flex-1"
                          value={editForm.hexCode || ''}
                          onChange={(e) => setEditForm({...editForm, hexCode: e.target.value})}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md shadow-inner border border-white/10" style={{ backgroundColor: color.hexCode || '#ffffff' }}></div>
                        <span className="font-mono text-xs text-slate-500">{color.hexCode || 'N/A'}</span>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      {editingId === color.id ? (
                         <>
                           <button className="text-secondary hover:text-green-400 transition-colors" onClick={() => handleEditSubmit(color.id)}><Check size={18} /></button>
                           <button className="text-slate-500 hover:text-error transition-colors" onClick={() => setEditingId(null)}><X size={18} /></button>
                         </>
                      ) : (
                         <>
                           <button className="text-slate-500 hover:text-secondary transition-colors" onClick={() => handleEditInit(color)}><Pencil size={18} /></button>
                           <button className="text-slate-500 hover:text-error transition-colors" onClick={() => handleDelete(color.id)}><Trash2 size={18} /></button>
                         
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
            <h3 className="text-lg font-bold text-white mb-6">Register Color</h3>
            <form className="space-y-6" onSubmit={handleAddColor}>
              <Input 
                label="Dye Title" 
                placeholder="e.g., Crimson Red" 
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase">Hex Value Identifier</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={newColorHex || '#ff0000'}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-12 h-10 p-1 bg-[#13181f] border border-outline/30 rounded cursor-pointer" 
                  />
                  <input 
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="flex-1 bg-[#13181f] border border-outline/30 rounded py-2 px-3 text-sm text-slate-200 outline-none font-mono focus:border-secondary" 
                    placeholder="#HEXCODE" 
                  />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-secondary hover:bg-secondary-fixed-dim text-surface-container-lowest font-black uppercase text-xs tracking-widest py-4 rounded-sm transition-all shadow-[0_0_20px_rgba(0,200,83,0.2)] hover:scale-[1.02] active:scale-[0.98]">
                  Add Color
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorMaster;
