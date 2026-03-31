import React, { useState } from 'react';
import { User, Shield, Key } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ManagementMaster = () => {
  return (
    <div className="animate-in fade-in space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">System Management Workspace</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Configure user roles and parameters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-surface-container border border-primary/20 rounded p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-secondary" />
            <h3 className="text-lg font-bold text-white">Administrators</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded">
              <div>
                <p className="text-sm font-bold text-white">Rajesh K.</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
              <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded">
              <div>
                <p className="text-sm font-bold text-white">Sneh P.</p>
                <p className="text-xs text-slate-500">Developer</p>
              </div>
              <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">ACTIVE</span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">Invite User</Button>
        </div>

        <div className="bg-surface-container border border-primary/20 rounded p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-secondary" />
            <h3 className="text-lg font-bold text-white">Security & Backup</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">System backups are executed nightly via Postgres pg_dump running over a cron task on Port 5000.</p>
          <div className="space-y-4">
            <Button variant="primary" className="w-full text-xs py-2">Trigger Manual Backup</Button>
            <Button variant="outline" className="w-full text-xs py-2 border-error text-error hover:bg-error/10">Purge Audit Logs</Button>
          </div>
        </div>

        <div className="bg-surface-container border border-primary/20 rounded p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Key className="text-secondary" />
            <h3 className="text-lg font-bold text-white">System Config</h3>
          </div>
          <form className="space-y-4">
            <Input label="Session Timeout (mins)" type="number" defaultValue="120" />
            <Input label="Company Name" defaultValue="Feather Fine ERP" />
            <Button variant="secondary" className="w-full">Save Config</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagementMaster;
