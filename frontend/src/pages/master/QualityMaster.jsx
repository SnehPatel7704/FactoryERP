import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { apiClient } from '../../utils/apiClient';

const QualityMaster = () => {
  const [qualities, setQualities] = useState([]);
  const [newGrade, setNewGrade] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQualities = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/master/qualities');
      setQualities(data || []);
    } catch(err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQualities(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newGrade) return alert("Grade string is required!");
    try {
      await apiClient.post('/master/qualities', { grade: newGrade });
      setNewGrade('');
      fetchQualities();
    } catch(err) {
      alert('Error adding quality: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Perform hard deletion on database?")) return;
    try {
      await fetch(`http://localhost:5000/api/master/qualities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchQualities();
    } catch(err) {
      alert("Error deleting record");
    }
  }

  return (
    <div className="animate-in fade-in grid grid-cols-12 gap-8 custom-scrollbar">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Quality Grade Master</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Industrial grading registry</p>
        </div>

        {loading ? <Loader text="Mapping Quality Boundaries..." /> : error ? (
            <div className="bg-error/10 border border-error/50 p-4 rounded text-error text-xs uppercase font-bold tracking-wider">{error}</div>
        ) : (
        <div className="bg-primary/5 rounded border border-outline/30 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary/20 border-b border-primary/30">
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Grade ID</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Quality Designation</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 text-right uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/20">
              {qualities.length === 0 && (
                <tr><td colSpan="3" className="px-6 py-8 flex justify-center text-slate-500 text-xs tracking-wider uppercase">NO GRADES AVAILABLE</td></tr>
              )}
              {qualities.map((q) => (
                <tr key={q.id} className="hover:bg-primary/10 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-secondary">{q.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-200">{q.grade}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(q.id)} className="p-2 bg-error/10 text-error rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/20 ml-4"><Trash2 size={16} /></button>
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
          <h3 className="text-lg font-bold text-white mb-6">Register Grade</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input label="Quality Grade Constraint" placeholder="e.g., Grade A+" value={newGrade} onChange={e => setNewGrade(e.target.value)} />
            <Button variant="primary" className="w-full mt-4" disabled={loading}>Integrate Quality Grade</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QualityMaster;
