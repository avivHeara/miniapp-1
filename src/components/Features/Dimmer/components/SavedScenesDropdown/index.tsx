import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Input, showModal, showToast } from '@ray-js/ray';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import {
  selectSavedScenes,
  selectCanAddScene,
  deleteScene,
  updateScene,
  SavedScene,
} from '@/redux/modules/savedScenesSlice';
import type { AppDispatch } from '@/redux';
import styles from './index.module.less';

interface Props {
  onActivateScene: (scene: SavedScene) => void;
  style?: React.CSSProperties;
}

export const SavedScenesDropdown: React.FC<Props> = ({
  onActivateScene,
  style,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const savedScenes = useSelector(selectSavedScenes);
  const canAddMore = useSelector(selectCanAddScene);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingScene, setEditingScene] = useState<SavedScene | null>(null);
  const [editName, setEditName] = useState('');
  const isEditModalContentClick = useRef(false);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
    setSelectedSceneId(null);
  }, []);

  const handleSceneClick = useCallback((scene: SavedScene) => {
    if (selectedSceneId === scene.id) {
      setSelectedSceneId(null);
    } else {
      setSelectedSceneId(scene.id);
    }
  }, [selectedSceneId]);

  const handleActivate = useCallback((scene: SavedScene) => {
    onActivateScene(scene);
    showToast({ title: `הופעל: ${scene.name}`, icon: 'success' });
    setIsOpen(false);
    setSelectedSceneId(null);
  }, [onActivateScene]);

  // ===== Edit Modal Handlers =====
  const handleEditClick = useCallback((scene: SavedScene) => {
    setEditingScene(scene);
    setEditName(scene.name);
    setShowEditModal(true);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setShowEditModal(false);
    setEditingScene(null);
    setEditName('');
  }, []);

  const handleEditOverlayClick = useCallback(() => {
    if (isEditModalContentClick.current) {
      isEditModalContentClick.current = false;
      return;
    }
    handleEditModalClose();
  }, [handleEditModalClose]);

  const handleEditModalContentClick = useCallback(() => {
    isEditModalContentClick.current = true;
  }, []);

  const handleEditInputChange = useCallback((e: any) => {
    const value = e?.detail?.value ?? e?.target?.value ?? '';
    setEditName(value);
  }, []);

  const handleSaveEdit = useCallback(() => {
    isEditModalContentClick.current = true;

    if (!editName.trim()) {
      showToast({ title: 'נא להזין שם למצב', icon: 'none' });
      return;
    }

    if (!editingScene) return;

    dispatch(updateScene({
      id: editingScene.id,
      updates: { name: editName.trim() },
    }));

    showToast({ title: 'השם עודכן בהצלחה', icon: 'success' });
    handleEditModalClose();
    setSelectedSceneId(null);
  }, [dispatch, editingScene, editName, handleEditModalClose]);

  const handleCancelEdit = useCallback(() => {
    isEditModalContentClick.current = true;
    handleEditModalClose();
  }, [handleEditModalClose]);
  // ===== End Edit Modal Handlers =====

  const handleDelete = useCallback((scene: SavedScene) => {
    showModal({
      title: 'מחיקת מצב',
      content: `האם למחוק את "${scene.name}"?`,
      confirmText: 'מחק',
      cancelText: 'ביטול',
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          dispatch(deleteScene(scene.id));
          showToast({ title: 'המצב נמחק', icon: 'success' });
          setSelectedSceneId(null);
        }
      },
    });
  }, [dispatch]);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getSceneIcon = (scene: SavedScene): string => {
    if (scene.isMultiDevice) {
      return '🏠';
    }
    const firstDevice = scene.devices[0];
    if (firstDevice?.mode === 'colour') {
      return '🎨';
    }
    return '💡';
  };

  const getSceneDetails = (scene: SavedScene): string => {
    const firstDevice = scene.devices[0];
    if (!firstDevice) return '';

    if (firstDevice.mode === 'colour') {
      return `צבע H:${firstDevice.hue}`;
    }
    return `${Math.round((firstDevice.brightness || 0) / 10)}% בהירות`;
  };

  return (
    <View style={style} className={styles.container}>
      {/* Header / Toggle Button */}
      <View
        className={clsx(styles.header, isOpen && styles.headerOpen)}
        onClick={toggleDropdown}
      >
        <View className={styles.headerContent}>
          <Text className={styles.headerIcon}>⭐</Text>
          <Text className={styles.headerTitle}>מצבים שמורים</Text>
          <Text className={styles.headerCount}>
            ({savedScenes.length}/6)
          </Text>
        </View>
        <View className={clsx(styles.arrow, isOpen && styles.arrowOpen)}>
          ▼
        </View>
      </View>

      {/* Dropdown Content */}
      {isOpen && (
        <View className={styles.dropdown}>
          {savedScenes.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📭</Text>
              <Text className={styles.emptyText}>אין מצבים שמורים</Text>
              <Text className={styles.emptyHint}>
                לחץ על 💾 בטאב "כיוונון ויצירה" לשמירת מצב
              </Text>
            </View>
          ) : (
            <ScrollView
              scrollY
              className={styles.scenesList}
              style={{ maxHeight: '400rpx' }}
            >
              {savedScenes.map((scene) => (
                <View key={scene.id} className={styles.sceneItem}>
                  {/* Scene Info Row */}
                  <View
                    className={clsx(
                      styles.sceneRow,
                      selectedSceneId === scene.id && styles.sceneRowSelected
                    )}
                    onClick={() => handleSceneClick(scene)}
                  >
                    <View className={styles.sceneInfo}>
                      <Text className={styles.sceneIcon}>
                        {getSceneIcon(scene)}
                      </Text>
                      <View className={styles.sceneDetails}>
                        <Text className={styles.sceneName}>{scene.name}</Text>
                        <Text className={styles.sceneMeta}>
                          {scene.isMultiDevice
                            ? `${scene.devices.length} מנורות`
                            : scene.devices[0]?.deviceName || 'מנורה'
                          }
                          {' • '}
                          {getSceneDetails(scene)}
                          {' • '}
                          {formatDate(scene.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View className={styles.sceneArrow}>
                      {selectedSceneId === scene.id ? '▲' : '▶'}
                    </View>
                  </View>

                  {/* Action Buttons (visible when selected) */}
                  {selectedSceneId === scene.id && (
                    <View className={styles.actionButtons}>
                      <View
                        className={clsx(styles.actionBtn, styles.activateBtn)}
                        onClick={() => handleActivate(scene)}
                      >
                        <Text className={styles.actionIcon}>▶</Text>
                        <Text className={styles.actionText}>הפעל</Text>
                      </View>
                      <View
                        className={clsx(styles.actionBtn, styles.editBtn)}
                        onClick={() => handleEditClick(scene)}
                      >
                        <Text className={styles.actionIcon}>✏️</Text>
                        <Text className={styles.actionText}>שנה שם</Text>
                      </View>
                      <View
                        className={clsx(styles.actionBtn, styles.deleteBtn)}
                        onClick={() => handleDelete(scene)}
                      >
                        <Text className={styles.actionIcon}>🗑️</Text>
                        <Text className={styles.actionText}>מחק</Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          {/* Footer hint */}
          {!canAddMore && savedScenes.length > 0 && (
            <View className={styles.limitWarning}>
              <Text className={styles.limitText}>
                ⚠️ הגעת למגבלת 6 מצבים. מחק מצב כדי להוסיף חדש.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ===== Edit Name Modal ===== */}
      {showEditModal && editingScene && (
        <View className={styles.modalOverlay} onClick={handleEditOverlayClick}>
          <View className={styles.modalContent} onClick={handleEditModalContentClick}>
            {/* Header */}
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>שינוי שם מצב</Text>
            </View>

            {/* Name Input */}
            <View className={styles.inputGroup}>
              <Text className={styles.inputLabel}>שם חדש:</Text>
              <Input
                className={styles.input}
                value={editName}
                onInput={handleEditInputChange}
                onFocus={() => { isEditModalContentClick.current = true; }}
                placeholder="הזן שם חדש..."
                maxlength={20}
              />
            </View>

            {/* Current Info */}
            <View className={styles.editInfo}>
              <Text className={styles.editInfoText}>
                {getSceneIcon(editingScene)} {editingScene.isMultiDevice ? `${editingScene.devices.length} מנורות` : editingScene.devices[0]?.deviceName}
              </Text>
              <Text className={styles.editInfoText}>
                {getSceneDetails(editingScene)}
              </Text>
            </View>

            {/* Buttons */}
            <View className={styles.modalButtons}>
              <View className={styles.cancelButton} onClick={handleCancelEdit}>
                <Text className={styles.cancelText}>ביטול</Text>
              </View>
              <View className={styles.confirmButton} onClick={handleSaveEdit}>
                <Text className={styles.confirmText}>שמור</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SavedScenesDropdown;