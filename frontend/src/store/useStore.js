import { create } from 'zustand';

const useStore = create((set) => ({
  activeOrder: null,
  setActiveOrder: (order) => set({ activeOrder: order }),
  
  selectedColor: null,
  setSelectedColor: (color) => set({ selectedColor: color }),
  
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

export default useStore;
