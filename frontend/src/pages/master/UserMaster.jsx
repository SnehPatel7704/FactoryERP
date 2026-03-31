import React, { useState, useEffect } from 'react';
import { Network, Plus, Trash2, KeyRound } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { apiClient } from '../../utils/apiClient';

const UserMaster = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'operator' });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get('/master/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) return;
    try {
      setSubmitLoading(true);
      const res = await fetch('http://localhost:5000/api/master/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setNewUser({ email: '', password: '', role: 'operator' });
        await fetchUsers();
      } else {
        alert("Failed to create credential block.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently destroy user credential access node?")) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/master/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) return <Loader text="Querying Identity Ledger..." />;

  return (
    <div className="animate-in fade-in space-y-6 custom-scrollbar">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Network className="text-secondary" /> Users
          </h2>
          {/* <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Identity Node Management Array</p> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-surface-container border border-primary/10 rounded-xl shadow p-6 h-fit relative">
          <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Register User Identity</h3>
          {submitLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-container/90 backdrop-blur-sm rounded-xl">
              <Loader text="Encrypting..." />
            </div>
          )}
          <form onSubmit={handleAdd} className="space-y-4">
            <Input
              label="Email"
              placeholder="e.g. operator@factory.com"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
            <div className="flex flex-col gap-1.5 pt-2">
              <label className="text-[10px] font-semibold text-slate-400 tracking-[0.05em] uppercase">Privilege Vector Classification</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full bg-[#13181f] border border-outline/30 rounded py-2 px-3 text-sm text-slate-200 focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all"
              >
                <option value="operator">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full flex justify-center items-center gap-2">
                <Plus size={16} /> Add User
              </Button>
            </div>
          </form>
        </div>

        <div className="md:col-span-2 bg-surface-container border border-primary/10 rounded-xl shadow overflow-hidden relative">
          {loading && users.length > 0 && <div className="absolute top-0 left-0 w-full h-1 bg-secondary animate-pulse" />}
          <div className="px-6 py-4 bg-primary-container/20 border-b border-primary/20">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Active Users List</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-on-surface-variant border-b border-primary/10">
                <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Email</th>
                <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Role</th>
                <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-sm text-secondary">{user.email}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-300 uppercase tracking-wider">{user.role}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-slate-500 hover:text-error transition-colors p-1"
                      title="Revoke Node Access"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-500 text-sm">No identity nodes detected in sector.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMaster;
