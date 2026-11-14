import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface AppState {
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  introDone: boolean;
  setIntroDone: (v: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const value = useMemo(() => ({ menuOpen, setMenuOpen, introDone, setIntroDone }), [menuOpen, introDone]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppState outside provider');
  return v;
}
