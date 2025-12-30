/**
 * Saved Scenes Redux Slice
 * ניהול מצבים שמורים עם LocalStorage ומצבי ברירת מחדל
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getStorageSync, setStorageSync } from '@ray-js/ray';

// ========== Types ==========

export interface SavedDeviceState {
  deviceId: string;
  deviceName: string;
  mode: 'white' | 'colour';
  // White mode
  brightness?: number;    // 0-1000
  temperature?: number;   // 0-1000
  // Colour mode
  hue?: number;           // 0-360
  saturation?: number;    // 0-1000
  value?: number;         // 0-1000
}

export interface SavedScene {
  id: string;
  name: string;
  createdAt: number;
  isMultiDevice: boolean;
  devices: SavedDeviceState[];
  isFavorite?: boolean;    // האם מופיע במועדפים
  customImage?: string;   // נתיב לתמונה מקומית או URL
  category?: 'scene' | 'music'; // קטגוריה
}

interface SavedScenesState {
  scenes: SavedScene[];
}

// ========== Constants ==========

const STORAGE_KEY = 'saved_custom_scenes';
const MAX_SCENES = 12; // הגדלנו לטובת הדוגמאות

const DEFAULT_SCENES: SavedScene[] = [
  {
    id: 'mock-1',
    name: 'ערב רומנטי',
    createdAt: Date.now(),
    isMultiDevice: true,
    category: 'scene',
    isFavorite: true,
    customImage: '/romantic.png',
    devices: []
  },
  {
    id: 'mock-2',
    name: 'קריאה וריכוז',
    createdAt: Date.now(),
    isMultiDevice: false,
    category: 'scene',
    isFavorite: false,
    customImage: '/reading.png',
    devices: []
  },
  {
    id: 'mock-3',
    name: 'מסיבת ריקודים',
    createdAt: Date.now(),
    isMultiDevice: true,
    category: 'music',
    isFavorite: true,
    customImage: '/party.png',
    devices: []
  },
  {
    id: 'mock-4',
    name: 'מנוחה בצהריים',
    createdAt: Date.now(),
    isMultiDevice: false,
    category: 'scene',
    isFavorite: false,
    customImage: '/leisure.png',
    devices: []
  }
];

// ========== Helpers ==========

const generateId = (): string => {
  return `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const loadFromStorage = (): SavedScene[] => {
  try {
    const data = getStorageSync({ key: STORAGE_KEY });
    let stored: SavedScene[] = [];
    if (data && typeof data === 'string') {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        stored = parsed;
      }
    }

    // מיזוג של מה ששמור עם הדפולטים (אם לא קיימים)
    const storedIds = new Set(stored.map(s => s.id));
    return [...stored, ...DEFAULT_SCENES.filter(s => !storedIds.has(s.id))];

  } catch (error) {
    console.error('Failed to load saved scenes:', error);
    return DEFAULT_SCENES;
  }
};

const saveToStorage = (scenes: SavedScene[]): void => {
  try {
    setStorageSync({
      key: STORAGE_KEY,
      data: JSON.stringify(scenes),
    });
  } catch (error) {
    console.error('Failed to save scenes:', error);
  }
};

// ========== Initial State ==========

const initialState: SavedScenesState = {
  scenes: loadFromStorage(),
};

// ========== Slice ==========

const savedScenesSlice = createSlice({
  name: 'savedScenes',
  initialState,
  reducers: {
    loadScenes: (state) => {
      state.scenes = loadFromStorage();
    },
    addScene: (state, action: PayloadAction<Omit<SavedScene, 'id' | 'createdAt'>>) => {
      if (state.scenes.length >= MAX_SCENES) return;
      const newScene: SavedScene = {
        ...action.payload,
        id: generateId(),
        createdAt: Date.now(),
      };
      state.scenes.unshift(newScene);
      saveToStorage(state.scenes);
    },
    updateScene: (state, action: PayloadAction<{ id: string; updates: Partial<SavedScene> }>) => {
      const { id, updates } = action.payload;
      const index = state.scenes.findIndex(s => s.id === id);
      if (index !== -1) {
        state.scenes[index] = { ...state.scenes[index], ...updates };
        saveToStorage(state.scenes);
      }
    },
    deleteScene: (state, action: PayloadAction<string>) => {
      const index = state.scenes.findIndex(s => s.id === action.payload);
      if (index !== -1) {
        state.scenes.splice(index, 1);
        saveToStorage(state.scenes);
      }
    },
    reorderScenes: (state, action: PayloadAction<SavedScene[]>) => {
      state.scenes = action.payload;
      saveToStorage(state.scenes);
    },
    clearAllScenes: (state) => {
      state.scenes = [];
      saveToStorage([]);
    },
  },
});

// ========== Actions ==========
export const {
  loadScenes,
  addScene,
  updateScene,
  deleteScene,
  reorderScenes,
  clearAllScenes,
} = savedScenesSlice.actions;

// ========== Selectors ==========
type RootState = {
  savedScenes?: SavedScenesState;
  [key: string]: any;
};

export const selectSavedScenes = (state: RootState): SavedScene[] =>
  state.savedScenes?.scenes ?? [];

export const selectCanAddScene = (state: RootState): boolean =>
  (state.savedScenes?.scenes?.length ?? 0) < MAX_SCENES;

export const selectScenesCount = (state: RootState): number =>
  state.savedScenes?.scenes?.length ?? 0;

export const selectSceneById = (state: RootState, id: string): SavedScene | undefined =>
  state.savedScenes?.scenes?.find(s => s.id === id);

export default savedScenesSlice.reducer;