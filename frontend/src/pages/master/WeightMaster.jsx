import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Loader from '../../components/ui/Loader';
import apiClient from '../../utils/apiClient';

const WeightMaster = () => {
  const [weights, setWeights] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [newWeightType, setNewWeightType] = useState('grams');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  const fetchWeights = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/master/weights');
      setWeights(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeights(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newWeight) return alert('Weight Value is required!');

    try {
      await apiClient.post('/master/weights', { value: newWeight, type: newWeightType });
      setNewWeight('');
      fetchWeights();
    } catch (err) {
      alert('Error creating size: ' + err.message);
    }
  };


  const handleEdit = (weight) => {
    setEditingId(weight.id);
    setEditForm({ value: weight.value });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this size variant?")) return;
    try {
      await apiClient.delete(`/master/weights/${id}`);
      fetchWeights();
    } catch (err) {
      alert("Error deleting record: " + err.message);
    }
  };

  return (
    <div className="animate-in fade-in grid grid-cols-12 gap-8 custom-scrollbar">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Weight Standardization Master</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Pre-defined packing constraints</p>
        </div>

        {loading ? <Loader text="Loading Scale Constraints..." /> : error ? (
          <div className="bg-error/10 border border-error/50 p-4 rounded text-error text-xs uppercase font-bold tracking-wider">{error}</div>
        ) : (
          <div className="bg-primary/5 rounded border border-outline/30 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary/20 border-b border-primary/30">
                  <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Measurement</th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Type</th>
                  <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/20">
                {weights.length === 0 && (
                  <tr><td colSpan="3" className="px-6 py-8 flex justify-center text-slate-500 text-xs tracking-wider uppercase">NO WEIGHT CONFIGS FOUND</td></tr>
                )}
                {weights.map((w) => (
                  <tr key={w.id} className="hover:bg-primary/10 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-200">{w.value} <span className="text-[10px] font-normal text-slate-500 ml-1">{w.type}</span></td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-1 rounded tracking-wide font-bold shadow shadow-secondary/10">{w.type}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(w.id)} className="p-2 bg-error/10 text-error rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/20"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-surface-container border border-primary/50 rounded-lg p-6 sticky top-8">
          <h3 className="text-lg font-bold text-white mb-6">Register Weight Class</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input label="Measurement Output Type [Float]" placeholder="e.g. 50.5" value={newWeight} onChange={e => setNewWeight(e.target.value)} />
            <Select
              label="Weight Type"
              value={newWeightType}
              onChange={e => setNewWeightType(e.target.value)}
              options={[
                { value: 'grams', label: 'grams' },
                { value: 'kilograms', label: 'kilograms' }
              ]}
            />
            <Button variant="primary" className="w-full mt-4" disabled={loading}>Integrate Parameter</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WeightMaster;
