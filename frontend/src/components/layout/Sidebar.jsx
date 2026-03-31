import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, Archive, CreditCard, BarChart, HelpCircle, LogOut, ChevronDown, ChevronRight } from 'lucide-react';

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({ 'Master Data': true, 'Operations': true });

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const navGroups = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    {
      label: 'Master', icon: Database, path: '/master',
      children: [
        // { label: 'Management', path: '/master' },
        { label: 'Users', path: '/master/users' },
        { label: 'Items Registry', path: '/master/items' },
        { label: 'Colors Master', path: '/master/colors' },
        { label: 'Sizes Master', path: '/master/sizes' },
        { label: 'Qualities Master', path: '/master/qualities' },
        { label: 'Weight Configs', path: '/master/weights' },
        { label: 'Meter Configs', path: '/master/meters' },
      ]
    },
    {
      label: 'Inventory', icon: Archive,
      children: [
        { label: 'Production Entry', path: '/inventory/production' },
        { label: 'Production Return', path: '/returns/production' },
      ]
    },
    {
      label: 'Sales', icon: CreditCard,
      children: [
        { label: 'Sales Orders', path: '/sales/new' },
        { label: 'Pre-Dispatch Staging', path: '/sales/staging' },
        { label: 'Generate Challan', path: '/sales/dispatch' },
        { label: 'Dispatch Return', path: '/returns/dispatch' },
      ]
    },
    {
      label: 'Reports', icon: BarChart,
      children: [
        { label: 'System Analytics', path: '/reports/analytics' },
        { label: 'Annual Performance', path: '/reports/annual-performance' },
        { label: 'Daily Production', path: '/reports/daily-production-sales' },
        { label: 'Monthly Wastage', path: '/reports/monthly-wastage' },
        { label: 'Item-Wise Detailed', path: '/reports/detailed-production' },
      ]
    }
  ];

  const renderLink = (item, isChild = false) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) =>
        `px-4 py-2 flex items-center gap-3 transition-colors duration-200 text-sm ${isActive
          ? 'bg-primary/20 text-secondary border-l-2 border-secondary font-bold'
          : 'text-slate-500 hover:text-slate-300 hover:bg-primary/5 border-l-2 border-transparent'
        } ${isChild ? 'pl-12' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          {!isChild && <item.icon size={18} className={isActive ? 'text-secondary' : 'text-slate-500'} />}
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col pt-20 pb-6 bg-[#0f141a] dark:bg-[#0f141a] w-64 z-40 border-r border-primary/30 overflow-y-auto custom-scrollbar">
      <div className="px-6 mb-8 shrink-0">
        <h2 className="text-lg font-bold text-slate-200">Factory OS</h2>
        <p className="text-[10px] uppercase tracking-[0.1em] text-secondary font-semibold">Operational Command</p>
      </div>
      <nav className="flex-1 space-y-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-2">
            {group.children ? (
              <>
                <button
                  onClick={() => toggleMenu(group.label)}
                  className="w-full px-4 py-2 flex items-center justify-between text-sm text-slate-400 hover:text-slate-200 hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <group.icon size={18} />
                    <span className="font-semibold uppercase tracking-wider text-[11px]">{group.label}</span>
                  </div>
                  {openMenus[group.label] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {openMenus[group.label] && (
                  <div className="mt-1 flex flex-col space-y-1">
                    {group.children.map(child => renderLink(child, true))}
                  </div>
                )}
              </>
            ) : (
              renderLink(group)
            )}
          </div>
        ))}
      </nav>
      <div className="mt-auto space-y-1">
        <a className="text-slate-500 hover:text-slate-200 px-4 py-3 flex items-center gap-3 ml-1 hover:bg-primary/10 transition-all duration-200 ease-in-out" href="#">
          <HelpCircle size={20} />
          <span className="text-[14px] font-medium">Support</span>
        </a>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="w-full text-slate-500 hover:text-slate-200 px-4 py-3 flex items-center gap-3 ml-1 hover:bg-primary/10 transition-all text-error/80"
        >
          <LogOut size={20} />
          <span className="text-[14px] font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
