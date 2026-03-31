import React from 'react';
import { Bell, Settings } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-background dark:bg-[#13181f] border-b border-primary/30 fixed w-full top-0 z-50 px-6 h-16 flex justify-between items-center">
      <div className="flex items-center gap-8">
        <span className="text-xl font-black text-slate-100 uppercase tracking-widest">
          Factory OS
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:bg-primary/20 transition-colors active:scale-95 duration-150 rounded-full">
          <Bell size={20} />
        </button>
        <button className="p-2 text-slate-400 hover:bg-primary/20 transition-colors active:scale-95 duration-150 rounded-full">
          <Settings size={20} />
        </button>
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center border border-secondary/30">
          <img 
            alt="User Profile" 
            className="rounded-full overflow-hidden w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBskGcgJhN8qWvt238eMClOCh_7rJC4xZpW3eLEnIzHdYG4r_eN3cjqGY6zkgvRbC9lcI2p_Xss5Ekg33dp-etfhlSdBHEO5rKT0K5kIUmZ3Syh9cwCu--2CE-piMSd5mhJpMx0-hVVA81LptVPROQOT57JbR-PhJ4FL7yNUIS21ERsuDxyM47V-hcbSMQGplnIFSqWGG9NWTtLmNpWr1K7AB-dWo9PmkONWWOrJNtHSB6VwItSV25MW9I7ZMJMr28CMMJuDId_SU9w" 
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
