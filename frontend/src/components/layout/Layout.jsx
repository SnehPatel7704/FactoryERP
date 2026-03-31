import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-surface-container text-on-surface antialiased overflow-hidden">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-16 h-screen flex flex-col overflow-y-auto bg-surface-container">
        <div className="p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
