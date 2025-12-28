/**
 * Saved Scenes Redux Slice
 * ניהול מצבים שמורים עם LocalStorage
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
}

interface SavedScenesState {
  scenes: SavedScene[];
}

// ========== Constants ==========

const STORAGE_KEY = 'saved_custom_scenes';
const MAX_SCENES = 6;

// ========== Helpers ==========

const generateId = (): string => {
  return `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const loadFromStorage = (): SavedScene[] => {
  try {
    const data = getStorageSync({ key: STORAGE_KEY });
    if (data && typeof data === 'string') {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load saved scenes:', error);
  }
  return [];
};

const saveToStorage = (scenes: SavedScene[]): void => {
  try {
    setStorageSync({
      key: STORAGE_KEY,
      data: JSON.stringify(scenes),
    });
    console.log('💾 Saved scenes to storage:', scenes.length);
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
    // טעינה מ-LocalStorage
    loadScenes: (state) => {
      state.scenes = loadFromStorage();
    },

    // הוספת מצב חדש
    addScene: (state, action: PayloadAction<Omit<SavedScene, 'id' | 'createdAt'>>) => {
      if (state.scenes.length >= MAX_SCENES) {
        console.warn('Maximum scenes reached');
        return;
      }

      const newScene: SavedScene = {
        ...action.payload,
        id: generateId(),
        createdAt: Date.now(),
      };

      state.scenes.unshift(newScene); // הוסף בהתחלה
      saveToStorage(state.scenes);

      console.log('✅ Scene added:', newScene.name, newScene);
    },

    // עדכון מצב קיים (שם או נתונים)
    updateScene: (state, action: PayloadAction<{ id: string; updates: Partial<SavedScene> }>) => {
      const { id, updates } = action.payload;
      const index = state.scenes.findIndex(s => s.id === id);

      if (index !== -1) {
        state.scenes[index] = {
          ...state.scenes[index],
          ...updates,
        };
        saveToStorage(state.scenes);
        console.log('✅ Scene updated:', state.scenes[index].name);
      }
    },

    // מחיקת מצב
    deleteScene: (state, action: PayloadAction<string>) => {
      const index = state.scenes.findIndex(s => s.id === action.payload);
      if (index !== -1) {
        const deleted = state.scenes.splice(index, 1)[0];
        saveToStorage(state.scenes);
        console.log('🗑️ Scene deleted:', deleted.name);
      }
    },

    // שינוי סדר
    reorderScenes: (state, action: PayloadAction<SavedScene[]>) => {
      state.scenes = action.payload;
      saveToStorage(state.scenes);
    },

    // ניקוי כל המצבים
    clearAllScenes: (state) => {
      state.scenes = [];
      saveToStorage([]);
      console.log('🗑️ All scenes cleared');
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

// ========== Export ==========

export default savedScenesSlice.reducer;