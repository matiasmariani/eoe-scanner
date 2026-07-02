'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, dbService } from '@/lib/db';
import { Allergy } from '@/lib/constants';
import { logError } from '@/lib/errorHandling';

export interface AllergyContextType {
  allergies: Allergy[];
  activeProfile: Profile | null;
  profiles: Profile[];
  /** False until the stored active-profile pointer has been resolved on mount. */
  isHydrated: boolean;
  adultMode: boolean;
  setAdultMode: (mode: boolean) => void;
  toggleAllergy: (allergy: Allergy) => Promise<void>;
  clearAllergies: () => Promise<void>;
  setActiveProfileId: (id: string) => Promise<void>;
  createProfile: (
    name: string,
    emoji: string,
    allergies?: Allergy[],
  ) => Promise<Profile>;
  deleteProfile: (id: string) => Promise<void>;
}

export interface Profile {
  id: string;
  name: string;
  emoji: string;
  allergies: Allergy[];
  createdAt: number;
  isAdult?: boolean;
}

const AllergyContext = createContext<AllergyContextType | undefined>(undefined);

export function AllergyProvider({ children }: { children: ReactNode }) {
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(
    null,
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [adultMode, setAdultModeState] = useState(false);

  // Live query is the single source of truth for profile data.
  const profiles = useLiveQuery(() => db.profiles.toArray(), []);

  // Derived state — no duplicated `allergies` useState to drift out of sync.
  const activeProfile = profiles?.find((p) => p.id === activeProfileId) ?? null;
  const allergies = activeProfile?.allergies ?? [];

  // Resolve the persisted active-profile pointer once on mount.
  useEffect(() => {
    const loadActiveProfile = async () => {
      try {
        const storedId = await dbService.getActiveProfileId();
        if (storedId && (await db.profiles.get(storedId))) {
          setActiveProfileIdState(storedId);
        } else {
          // No (or dangling) pointer. Clear it, and auto-select only if exactly
          // one profile exists; otherwise leave selection to the setup modal.
          if (storedId) await dbService.saveActiveProfileId('');
          const all = await db.profiles.toArray();
          if (all.length === 1 && all[0]) {
            setActiveProfileIdState(all[0].id);
            await dbService.saveActiveProfileId(all[0].id);
          }
        }
      } catch (error) {
        logError('AllergyContext-load', error);
      } finally {
        setIsHydrated(true);
      }
    };
    loadActiveProfile();
  }, []);

  // Read-modify-write against the DB (the authoritative copy) so concurrent
  // taps don't clobber each other via a stale render closure.
  const toggleAllergy = async (allergy: Allergy) => {
    if (!activeProfileId) return;
    try {
      const profile = await dbService.getProfile(activeProfileId);
      if (!profile) return;
      const isRemoving = profile.allergies.includes(allergy);
      if (isRemoving && !adultMode) {
        console.warn('Adult mode required to remove allergens');
        return;
      }
      const next = isRemoving
        ? profile.allergies.filter((a) => a !== allergy)
        : [...profile.allergies, allergy];
      await dbService.saveProfile({ ...profile, allergies: next });
    } catch (err) {
      logError('AllergyContext-toggle', err);
    }
  };

  const clearAllergies = async () => {
    if (!activeProfileId || !adultMode) return;
    try {
      const profile = await dbService.getProfile(activeProfileId);
      if (!profile) return;
      await dbService.saveProfile({ ...profile, allergies: [] });
    } catch (err) {
      logError('AllergyContext-clear', err);
    }
  };

  const setActiveProfileId = async (id: string) => {
    setActiveProfileIdState(id);
    await dbService.saveActiveProfileId(id);
  };

  const createProfile = async (
    name: string,
    emoji: string,
    initialAllergies: Allergy[] = [],
  ): Promise<Profile> => {
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name,
      emoji,
      allergies: initialAllergies,
      createdAt: Date.now(),
    };
    await dbService.saveProfile(newProfile);
    await dbService.saveActiveProfileId(newProfile.id);
    setActiveProfileIdState(newProfile.id);
    return newProfile;
  };

  const deleteProfile = async (id: string) => {
    if (!adultMode) {
      console.warn('Adult mode required to delete profiles');
      return;
    }
    await dbService.deleteProfile(id);
    if (activeProfileId !== id) return;

    // The active profile was deleted — switch to another or clear the pointer.
    const remaining = await db.profiles.toArray();
    if (remaining.length > 0 && remaining[0]) {
      await setActiveProfileId(remaining[0].id);
    } else {
      setActiveProfileIdState(null);
      await dbService.saveActiveProfileId('');
    }
  };

  const setAdultMode = (mode: boolean) => {
    setAdultModeState(mode);
  };

  return (
    <AllergyContext.Provider
      value={{
        allergies,
        activeProfile,
        profiles: profiles ?? [],
        isHydrated,
        adultMode,
        setAdultMode,
        toggleAllergy,
        clearAllergies,
        setActiveProfileId,
        createProfile,
        deleteProfile,
      }}
    >
      {children}
    </AllergyContext.Provider>
  );
}

// Custom hook for easier access
export function useAllergySettings() {
  const context = useContext(AllergyContext);
  if (context === undefined) {
    throw new Error(
      'useAllergySettings must be used within an AllergyProvider',
    );
  }
  return context;
}
