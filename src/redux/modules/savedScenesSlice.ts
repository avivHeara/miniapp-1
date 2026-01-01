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
  // Dimming settings
  fadeTime?: number;      // 0-10000ms
  delayTime?: number;     // 0-10000ms
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
  activeSceneId: string | null;
  editingSceneId: string | null; // ID של המצב שנמצא כרגע בעריכה
}

// ========== Constants ==========

const STORAGE_KEY = 'saved_custom_scenes';
const MAX_SCENES = 12; // הגדלנו לטובת הדוגמאות

const DEFAULT_SCENES: SavedScene[] = [
  {
    id: 'mock-1',
    name: 'ערב רומנטי',
    createdAt: 1704067200000,
    isMultiDevice: false,
    category: 'scene',
    isFavorite: true,
    customImage: '/images/scene/romantic.png',
    devices: [{ deviceId: 'Device2', deviceName: 'מנורה 2', mode: 'colour', hue: 300, saturation: 800, value: 500 }]
  },
  {
    id: 'mock-2',
    name: 'קריאה וריכוז',
    createdAt: 1704067200001,
    isMultiDevice: false,
    category: 'scene',
    isFavorite: false,
    customImage: '/images/scene/reading.png',
    devices: [{ deviceId: 'Device2', deviceName: 'מנורה 2', mode: 'white', brightness: 1000, temperature: 0 }]
  },
  {
    id: 'mock-3',
    name: 'מסיבת ריקודים',
    createdAt: 1704067200002,
    isMultiDevice: false,
    category: 'music',
    isFavorite: true,
    customImage: '/images/scene/party.png',
    devices: [{ deviceId: 'Device2', deviceName: 'מנורה 2', mode: 'colour', hue: 120, saturation: 1000, value: 1000 }]
  },
  {
    id: 'mock-4',
    name: 'בוקר טוב',
    createdAt: 1704067200003,
    isMultiDevice: false,
    category: 'scene',
    isFavorite: false,
    customImage: '/images/scene/morning.png',
    devices: [{ deviceId: 'Device2', deviceName: 'מנורה 2', mode: 'white', brightness: 800, temperature: 500 }]
  },
  {
    id: 'mock-5',
    name: 'לילה טוב',
    createdAt: 1704067200004,
    isMultiDevice: false,
    category: 'scene',
    isFavorite: false,
    customImage: '/images/scene/night.png',
    devices: [{ deviceId: 'Device2', deviceName: 'מנורה 2', mode: 'white', brightness: 10, temperature: 1000 }]
  },
  {
    id: 'mock-6',
    name: 'ארוחת ערב',
    createdAt: 1704067200005,
    isMultiDevice: false,
    category: 'scene',
    isFavorite: true,
    customImage: '/images/scene/dinner.png',
    devices: [{ deviceId: 'Device2', deviceName: 'מנורה 2', mode: 'white', brightness: 600, temperature: 800 }]
  },
  {
    id: 'mock-7',
    name: 'מנוחה ופנאי',
    createdAt: 1704067200006,
    isMultiDevice: false,
    category: 'scene',
    isFavorite: false,
    customImage: '/images/scene/leisure.png',
    devices: [{ deviceId: 'Device2', deviceName: 'מנורה 2', mode: 'white', brightness: 400, temperature: 300 }]
  },
  {
    id: 'mock-8',
    name: 'סרט',
    createdAt: 1704067200007,
    isMultiDevice: false,
    category: 'scene',
    isFavorite: false,
    customImage: '/images/scene/movie.png',
    devices: [{ deviceId: 'Device2', deviceName: 'מנורה 2', mode: 'colour', hue: 240, saturation: 900, value: 200 }]
  },
  {
    id: 'mock-10',
    name: 'מצב משחק',
    createdAt: 1704067200008,
    isMultiDevice: false,
    category: 'music',
    isFavorite: false,
    customImage: '/images/scene/party.png',
    devices: [{ deviceId: 'Device2', deviceName: 'מנורה 2', mode: 'colour', hue: 280, saturation: 1000, value: 800 }]
  },
  {
    id: 'mock-11',
    name: 'סרט מוזיקלי',
    createdAt: 1704067200009,
    isMultiDevice: false,
    category: 'music',
    isFavorite: false,
    customImage: '/images/scene/movie.png',
    devices: [{ deviceId: 'Device2', deviceName: 'מנורה 2', mode: 'colour', hue: 180, saturation: 800, value: 400 }]
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

    // רענון נתיבי תמונות למצבי mock קיימים
    const updatedStored = stored.map(s => {
      // אם אין תמונה, שים את הגנרית כברירת מחדל
      if (!s.customImage) {
        s.customImage = '/images/scene/generic.png';
      }

      // עבור מצבי מערכת - וודא שהנתיב מעודכן למבנה התיקיות החדש
      if (s.id.startsWith('mock-')) {
        const defaultScene = DEFAULT_SCENES.find(ds => ds.id === s.id);
        if (defaultScene) {
          return { ...s, customImage: defaultScene.customImage };
        }
      }
      return s;
    });

    // מיזוג של מה ששמור עם הדפולטים (אם לא קיימים)
    const storedIds = new Set(updatedStored.map(s => s.id));
    return [...updatedStored, ...DEFAULT_SCENES.filter(s => !storedIds.has(s.id))];

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
  activeSceneId: null,
  editingSceneId: null,
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
      console.log('🔄 Redux: updateScene for ID:', id, 'Updates:', updates);
      const index = state.scenes.findIndex(s => s.id === id);
      if (index !== -1) {
        state.scenes[index] = { ...state.scenes[index], ...updates };
        saveToStorage(state.scenes);
        console.log('✅ Redux: Scene updated and saved.');
      } else {
        console.warn('❌ Redux: Scene ID not found for update:', id);
      }
    },
    deleteScene: (state, action: PayloadAction<string>) => {
      console.log('🗑️ Redux: deleteScene for ID:', action.payload);
      const index = state.scenes.findIndex(s => s.id === action.payload);
      if (index !== -1) {
        state.scenes.splice(index, 1);
        saveToStorage(state.scenes);
        console.log('✅ Redux: Scene deleted and saved.');
      } else {
        console.warn('❌ Redux: Scene ID not found for delete:', action.payload);
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
    setActiveScene: (state, action: PayloadAction<string | null>) => {
      state.activeSceneId = action.payload;
    },
    setEditingScene: (state, action: PayloadAction<string | null>) => {
      state.editingSceneId = action.payload;
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
  setActiveScene,
  setEditingScene,
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

export const selectActiveSceneId = (state: RootState): string | null =>
  state.savedScenes?.activeSceneId ?? null;

export const selectEditingSceneId = (state: RootState): string | null =>
  state.savedScenes?.editingSceneId ?? null;

export default savedScenesSlice.reducer;