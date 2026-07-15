import { create } from 'zustand';

interface PlatformState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  activeMatchId: string | null;
  activeTab: string;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCommandPalette: (open: boolean) => void;
  setActiveMatch: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const useStore = create<PlatformState>((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  activeMatchId: null,
  activeTab: 'dashboard',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCommandPalette: (open) => set({ commandPaletteOpen: open }),
  setActiveMatch: (id) => set({ activeMatchId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
