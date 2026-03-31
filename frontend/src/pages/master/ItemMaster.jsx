import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Download, Plus, Info, Check, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { exportToCSV } from '../../utils/exportCSV';
import apiClient from '../../utils/apiClient';

const ItemMaster = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', code: '' });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/master/all');
      setItems(data.items || []);
    } catch(err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const [newItemName, setNewItemName] = useState('');
  const [newItemCode, setNewItemCode] = useState('');

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemCode) return alert('Name and Code are required!');
    
    try {
      await apiClient.post('/master/items', { name: newItemName, code: newItemCode, description: '' });
      setNewItemName('');
      setNewItemCode('');
      fetchItems();
    } catch(err) {
      alert('Error creating item: ' + err.message);
    }
  };

  const handleEditInit = (item) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, code: item.code });
  };

  const handleEditSubmit = async (id) => {
    try {
      await apiClient.put(`/master/items/${id}`, editForm);
      setEditingId(null);
      fetchItems();
    } catch(err) {
      alert("Failed saving edits: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inventory item?")) return;
    try {
      await apiClient.delete(`/master/items/${id}`);
      fetchItems();
    } catch(err) {
      alert("Error deleting record: " + err.message);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 grid grid-cols-12 gap-8 custom-scrollbar">
      {/* Items Management Table Section */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Item Inventory Master</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Management of core textile product identifiers</p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2" onClick={() => exportToCSV(items, 'Feather_Fine_Items.csv')}>
            <Download size={14} /> EXPORT CSV
          </Button>
        </div>

        {/* Industrial Table Card */}
        {loading ? <Loader text="Synchronizing Item Roster..." /> : error ? (
            <div className="bg-error/10 border border-error/50 p-4 rounded text-error text-xs uppercase font-bold tracking-wider">{error}</div>
        ) : (
        <div className="bg-primary/5 rounded-lg border border-outline/30 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary/20 border-b border-primary/30">
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Item ID</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Item Name</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">AlphaNum Code</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/20">
              {items.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-8 flex justify-center text-slate-500 text-xs tracking-wider uppercase">NO RECORDS FOUND</td></tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-primary/10 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-secondary">{item.id.slice(0, 8)}...</td>
                  
                  <td className="px-6 py-4 text-sm font-medium text-slate-200">
                    {editingId === item.id ? (
                      <input 
                        className="bg-[#13181f] border border-secondary text-white text-xs px-2 py-1 w-full"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                    ) : item.name}
                  </td>
                  
                  <td className="px-6 py-4 text-xs font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                    {editingId === item.id ? (
                      <input 
                        className="bg-[#13181f] border border-secondary text-white text-xs px-2 py-1 w-full"
                        value={editForm.code}
                        onChange={(e) => setEditForm({...editForm, code: e.target.value})}
                      />
                    ) : item.code}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      {editingId === item.id ? (
                         <>
                           <button className="text-secondary hover:text-green-400 transition-colors" onClick={() => handleEditSubmit(item.id)}><Check size={18} /></button>
                           <button className="text-slate-500 hover:text-error transition-colors" onClick={() => setEditingId(null)}><X size={18} /></button>
                         </>
                      ) : (
                         <>
                           <button className="text-slate-500 hover:text-secondary transition-colors" onClick={() => handleEditInit(item)}><Pencil size={18} /></button>
                           <button className="text-slate-500 hover:text-error transition-colors" onClick={() => handleDelete(item.id)}><Trash2 size={18} /></button>
                         </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-primary/30 bg-surface-container flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-500">
            <span>Showing {items.length} records</span>
          </div>
        </div>
        )}
      </div>

      {/* Add New Item Form Section */}
      <div className="col-span-12 lg:col-span-4">
        <div className="sticky top-8">
          <div className="bg-surface-container border border-primary/50 rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-6 bg-secondary"></div>
              <h3 className="text-lg font-bold text-white">Add New Item</h3>
            </div>
            <form className="space-y-6" onSubmit={handleAddItem}>
              <Input 
                label="Item Name" 
                placeholder="e.g., Brushed Denim 12oz" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <div>
                <Input 
                  label="AlphaNum Item Code" 
                  placeholder="e.g., DNM-BRS-12-IND" 
                  className="font-mono"
                  value={newItemCode}
                  onChange={(e) => setNewItemCode(e.target.value)}
                />
                <p className="text-[9px] text-slate-600 mt-2 italic">* Use standardized factory coding prefixes.</p>
              </div>
              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full bg-secondary hover:bg-secondary-fixed-dim text-surface-container-lowest font-black uppercase text-xs tracking-widest py-4 rounded-sm transition-all shadow-[0_0_20px_rgba(0,200,83,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  Register Item
                </button>
              </div>
            </form>

            <div className="mt-10 p-4 rounded bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Info className="text-secondary" size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Data Integrity Note</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ensure item codes follow the ISO-9001 textile manufacturing standard. Duplicates will be rejected by the system core.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemMaster;
