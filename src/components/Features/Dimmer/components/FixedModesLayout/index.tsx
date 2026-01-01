import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@ray-js/ray';
import { useActions, useProps } from '@ray-js/panel-sdk';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { showModal as showRayModal, showToast, showActionSheet } from '@ray-js/ray';
import { selectSavedScenes, updateScene, deleteScene, setActiveScene, selectActiveSceneId, setEditingScene } from '@/redux/modules/savedScenesSlice';
import styles from './index.module.less';

interface Props {
    searchQuery: string;
    onRelease: (code: string, value: any) => void;
    onReleaseWhite: (cmd: any) => void;
    onModeChange?: (mode: string) => void;
}

export const FixedModesLayout: React.FC<Props> = ({ searchQuery, onRelease, onReleaseWhite, onModeChange }) => {
    const scenes = useSelector(selectSavedScenes);
    const activeSceneId = useSelector(selectActiveSceneId);
    const workMode = useProps(props => props.work_mode);
    const [expandedSection, setExpandedSection] = useState<'favorites' | 'scenes' | 'music'>('favorites');

    const filteredScenes = useMemo(() => {
        if (!searchQuery) return scenes;
        const q = searchQuery.toLowerCase();
        return scenes.filter(s => s.name?.toLowerCase().includes(q));
    }, [scenes, searchQuery]);

    const toggleSection = (section: 'favorites' | 'scenes' | 'music') => {
        setExpandedSection(expandedSection === section ? section : section);
    };

    const favorites = filteredScenes.filter(s => s.isFavorite);
    const allScenes = filteredScenes.filter(s => s.category !== 'music');
    const musicScenes = filteredScenes.filter(s => s.category === 'music');

    return (
        <View className={styles.container}>
            {/* Favorites Section */}
            <Section
                title="מועדפים"
                isExpanded={expandedSection === 'favorites'}
                onToggle={() => toggleSection('favorites')}
                count={favorites.length}
            >
                <Carousel items={favorites} activeSceneId={activeSceneId} onRelease={onRelease} onReleaseWhite={onReleaseWhite} onModeChange={onModeChange} />
            </Section>

            {/* All Scenes Section */}
            <Section
                title="כל המצבים"
                isExpanded={expandedSection === 'scenes'}
                onToggle={() => toggleSection('scenes')}
                count={allScenes.length}
            >
                <Carousel items={allScenes} activeSceneId={activeSceneId} onRelease={onRelease} onReleaseWhite={onReleaseWhite} onModeChange={onModeChange} />
            </Section>

            {/* Music Section */}
            <Section
                title="מוזיקה"
                isExpanded={expandedSection === 'music'}
                onToggle={() => toggleSection('music')}
                count={musicScenes.length}
            >
                <Carousel items={musicScenes} activeSceneId={activeSceneId} onRelease={onRelease} onReleaseWhite={onReleaseWhite} onModeChange={onModeChange} />
            </Section>
        </View>
    );
};

const Section = ({ title, isExpanded, onToggle, count, children }) => (
    <View className={clsx(styles.section, isExpanded && styles.expanded)}>
        <View className={styles.sectionHeader} onClick={onToggle}>
            <View className={styles.headerRight}>
                <Text className={styles.sectionTitle}>{title}</Text>
                {count > 0 && <Text className={styles.badge}>{count}</Text>}
            </View>
            <Text className={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
        </View>
        <View className={styles.sectionContent}>
            {children}
        </View>
    </View>
);

const Carousel = ({ items, activeSceneId, onRelease, onReleaseWhite, onModeChange }) => (
    <ScrollView scrollX className={styles.carousel} showScrollbar={false}>
        <View className={styles.carouselInner}>
            {items.map(item => (
                <ModeCard
                    key={item.id}
                    item={item}
                    isActive={activeSceneId === item.id}
                    onRelease={onRelease}
                    onReleaseWhite={onReleaseWhite}
                    onModeChange={onModeChange}
                />
            ))}
            {items.length === 0 && <Text className={styles.emptyText}>לא נמצאו תוצאות...</Text>}
        </View>
    </ScrollView>
);

const ModeCard = ({ item, isActive, onRelease, onReleaseWhite, onModeChange }) => {
    const dispatch = useDispatch();
    const dpActions = useActions();

    const handleFavorite = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        console.log('⭐ handleFavorite click detected for:', item.id, 'Current status:', item.isFavorite);
        dispatch(updateScene({ id: item.id, updates: { isFavorite: !item.isFavorite } }));
    };

    const handleLongPress = () => {
        const itemList = ['הפעל מצב', 'ערוך מצב'];
        if (!item.id.startsWith('mock-')) {
            itemList.push('מחק מצב');
        }

        showActionSheet({
            itemList,
            success: (res) => {
                const action = itemList[res.tapIndex];
                if (action === 'הפעל מצב') {
                    handleActivate();
                } else if (action === 'ערוך מצב') {
                    handleEdit();
                } else if (action === 'מחק מצב') {
                    handleDelete();
                }
            }
        });
    };

    const handleEdit = () => {
        console.log('✏️ Opening SceneEditor for Rename:', item.id);
        dispatch(setEditingScene(item.id));
        // המעבר לטאב הכיוונון אינו חובה כאן כי ה-SceneEditor הוא Overlay על הכל
        showToast({ title: 'מצב עריכה', icon: 'none' });
    };

    const handleTune = () => {
        console.log('🔧 Entering Edit Mode for:', item.id);

        // 1. הגדרת המצב כנמצא בעריכה
        dispatch(setEditingScene(item.id));

        // 2. הפעלת המצב (שליחת פקודות למנורה)
        handleActivate();

        // 3. מעבר לטאב הכיוונון (Adjustment) לפי סוג המצב
        if (item.devices && item.devices.length > 0) {
            const devMode = item.devices[0].mode || 'white';
            onModeChange?.(devMode);
        } else {
            onModeChange?.('white');
        }

        showToast({ title: 'מצב עריכה פעיל', icon: 'success' });
    };

    const handleDelete = () => {
        showRayModal({
            title: 'מחיקת מצב',
            content: `האם אתה בטוח שברצונך למחוק את "${item.name}"?`,
            cancelText: 'ביטול',
            confirmText: 'מחק',
            confirmColor: '#ff4d4f',
            success: (res) => {
                if (res.confirm) {
                    dispatch(deleteScene(item.id));
                    showToast({ title: 'המצב נמחק', icon: 'success' });
                }
            }
        });
    };

    const handleActivate = () => {
        console.log('🔮 [NEW VERSION] handleActivate triggering for:', item.id);
        // עדכון UI
        dispatch(setActiveScene(item.id));

        // שינוי מצב עבודה דרך onRelease הבטוח
        if (item.category === 'music') {
            onRelease?.('work_mode', 'music');
        } else {
            onRelease?.('work_mode', 'scene');
        }

        // שליחת נתוני המנורה
        if (item.devices && item.devices.length > 0) {
            const dev = item.devices[0];
            console.log('🔮 Sending data via onRelease:', dev);
            if (dev.mode === 'white') {
                onReleaseWhite?.({
                    bright_value: dev.brightness,
                    temp_value: dev.temperature
                });
            } else if (dev.mode === 'colour') {
                onRelease?.('colour_data', {
                    hue: dev.hue,
                    saturation: dev.saturation,
                    value: dev.value
                });
            }
        }
        showToast({ title: `הופעל: ${item.name}`, icon: 'success' });
    };

    return (
        <View
            className={clsx(styles.card, isActive && styles.cardActive)}
            onClick={handleActivate}
            onLongPress={handleLongPress}
        >
            <View className={styles.cardInner}>
                <Image
                    src={item.customImage || '/images/scene/generic.png'}
                    className={styles.cardImage}
                    mode="aspectFill"
                />
                <View className={styles.imageOverlay} />

                {/* באדג' פעיל */}
                {isActive && (
                    <View className={styles.activeBadge}>
                        <Text className={styles.activeText}>פעיל</Text>
                    </View>
                )}

                <View className={styles.cardHeader}>
                    {/* כפתור מועדפים - נשאר גלוי למגע מהיר */}
                    <View className={styles.favoriteBtn} onClick={handleFavorite}>
                        <Text className={clsx(styles.starIcon, item.isFavorite && styles.starred)}>★</Text>
                    </View>
                </View>

                {/* מידע על הכרטיס */}
                <View className={styles.cardContent}>
                    <View className={styles.cardTexts}>
                        <Text className={styles.cardName}>{item.name}</Text>
                        <Text className={styles.cardDetails}>{item.devices?.length || 1} מנורות</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

// getIconPath הוסר כבקשת המשתמש למראה נקי
