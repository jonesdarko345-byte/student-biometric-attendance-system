import { Course, TimetableSlot, SemesterConfig } from '../types';

export const OFFLINE_CACHE_KEYS = {
  TIMETABLE_SNAPSHOT: 'uenr_offline_timetable_snapshot_v1',
  LAST_CACHED_AT: 'uenr_timetable_last_cached_at'
};

export interface OfflineTimetableSnapshot {
  version: number;
  cachedAt: string; // ISO String
  timetable: TimetableSlot[];
  courses: Course[];
  semester?: SemesterConfig;
}

/**
 * Saves the current timetable and course catalog to persistent local storage.
 * This guarantees students can view their complete timetable even with zero or poor network connection.
 */
export function saveTimetableToOfflineStorage(
  timetable: TimetableSlot[],
  courses: Course[],
  semester?: SemesterConfig
): boolean {
  try {
    const snapshot: OfflineTimetableSnapshot = {
      version: 1,
      cachedAt: new Date().toISOString(),
      timetable,
      courses,
      semester
    };

    localStorage.setItem(OFFLINE_CACHE_KEYS.TIMETABLE_SNAPSHOT, JSON.stringify(snapshot));
    localStorage.setItem(OFFLINE_CACHE_KEYS.LAST_CACHED_AT, snapshot.cachedAt);
    return true;
  } catch (err) {
    console.warn('[OfflineCache] Failed to save timetable snapshot to localStorage:', err);
    return false;
  }
}

/**
 * Retrieves the cached timetable snapshot from local storage.
 */
export function loadTimetableFromOfflineStorage(): OfflineTimetableSnapshot | null {
  try {
    const raw = localStorage.getItem(OFFLINE_CACHE_KEYS.TIMETABLE_SNAPSHOT);
    if (!raw) return null;
    const parsed: OfflineTimetableSnapshot = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.timetable) && Array.isArray(parsed.courses)) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('[OfflineCache] Error reading timetable snapshot from localStorage:', err);
    return null;
  }
}

/**
 * Returns a human-friendly format of when the timetable was last saved offline.
 */
export function getOfflineCacheStatus(): {
  isCached: boolean;
  cachedAtText: string;
  cachedDate: Date | null;
  totalSlots: number;
  totalCourses: number;
} {
  const snapshot = loadTimetableFromOfflineStorage();
  if (!snapshot) {
    return {
      isCached: false,
      cachedAtText: 'Not cached yet',
      cachedDate: null,
      totalSlots: 0,
      totalCourses: 0
    };
  }

  const date = new Date(snapshot.cachedAt);
  const isToday = new Date().toDateString() === date.toDateString();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const cachedAtText = isToday
    ? `Today at ${timeStr}`
    : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;

  return {
    isCached: true,
    cachedAtText,
    cachedDate: date,
    totalSlots: snapshot.timetable.length,
    totalCourses: snapshot.courses.length
  };
}

/**
 * Detects whether the user is currently offline or experiencing a slow/poor connection.
 */
export function getNetworkStatus(): {
  isOnline: boolean;
  isPoorConnection: boolean;
  qualityDescription: string;
} {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isOnline) {
    return {
      isOnline: false,
      isPoorConnection: true,
      qualityDescription: 'Disconnected (Offline)'
    };
  }

  // Check Network Information API if available in browser
  const nav = navigator as unknown as {
    connection?: {
      effectiveType?: string;
      saveData?: boolean;
      rtt?: number;
    };
  };

  if (nav.connection) {
    const effType = nav.connection.effectiveType || '4g';
    const isSlow = effType === '2g' || effType === 'slow-2g' || Boolean(nav.connection.saveData);

    return {
      isOnline: true,
      isPoorConnection: isSlow,
      qualityDescription: isSlow ? `Poor (${effType.toUpperCase()})` : 'Connected'
    };
  }

  return {
    isOnline: true,
    isPoorConnection: false,
    qualityDescription: 'Connected'
  };
}
