import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ScoredRoute } from '@/types/route';
import type { SavedRoute } from './types';

const STORAGE_KEY = 'illuminate.savedRoutes.v1';

type SavedRoutesContextValue = {
  savedRoutes: SavedRoute[];
  loaded: boolean;
  saveRoute: (route: ScoredRoute, label: string) => void;
  removeRoute: (id: string) => void;
};

const SavedRoutesContext = createContext<SavedRoutesContextValue | null>(null);

/**
 * Local-only for now (AsyncStorage, same as settings) — routes saved here live on
 * this device only. "Share with a friend" is already covered by the GPX export's
 * native share sheet; a synced/shareable saved-route list is a Phase 6 concern
 * once there's a Supabase backend to actually share through.
 */
export function SavedRoutesProvider({ children }: { children: ReactNode }) {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSavedRoutes(JSON.parse(raw));
      } catch {
        // Start empty if storage is unavailable or corrupt.
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  function saveRoute(route: ScoredRoute, label: string) {
    setSavedRoutes((prev) => {
      const entry: SavedRoute = {
        id: `saved-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
        savedAt: new Date().toISOString(),
        label,
        route,
      };
      const next = [entry, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  function removeRoute(id: string) {
    setSavedRoutes((prev) => {
      const next = prev.filter((r) => r.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  const value = useMemo(
    () => ({ savedRoutes, loaded, saveRoute, removeRoute }),
    [savedRoutes, loaded],
  );

  return <SavedRoutesContext.Provider value={value}>{children}</SavedRoutesContext.Provider>;
}

export function useSavedRoutes(): SavedRoutesContextValue {
  const ctx = useContext(SavedRoutesContext);
  if (!ctx) throw new Error('useSavedRoutes must be used within a SavedRoutesProvider');
  return ctx;
}
