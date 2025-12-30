import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@ray-js/ray';
import { useActions, useProps } from '@ray-js/panel-sdk';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { selectSavedScenes, updateScene } from '@/redux/modules/savedScenesSlice';
import styles from './index.module.less';

interface Props {
    searchQuery: string;
}

export const FixedModesLayout: React.FC<Props> = ({ searchQuery }) => {
    const scenes = useSelector(selectSavedScenes);
    const workMode = useProps(props => props.work_mode);
    const sceneData = useProps(props => props.scene_data);
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
                <Carousel items={favorites} activeMode={workMode} activeSceneId={sceneData?.sceneId} />
            </Section>

            {/* All Scenes Section */}
            <Section
                title="כל המצבים"
                isExpanded={expandedSection === 'scenes'}
                onToggle={() => toggleSection('scenes')}
                count={allScenes.length}
            >
                <Carousel items={allScenes} activeMode={workMode} activeSceneId={sceneData?.sceneId} />
            </Section>

            {/* Music Section */}
            <Section
                title="מוזיקה"
                isExpanded={expandedSection === 'music'}
                onToggle={() => toggleSection('music')}
                count={musicScenes.length}
            >
                <Carousel items={musicScenes} activeMode={workMode} activeSceneId={sceneData?.sceneId} />
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

const Carousel = ({ items, activeMode, activeSceneId }) => (
    <ScrollView scrollX className={styles.carousel} showScrollbar={false}>
        <View className={styles.carouselInner}>
            {items.map(item => (
                <ModeCard
                    key={item.id}
                    item={item}
                    isActive={
                        (item.category === 'music' && activeMode === 'music') ||
                        (item.category !== 'music' && activeMode === 'scene' && activeSceneId === item.id)
                    }
                />
            ))}
            {items.length === 0 && <Text className={styles.emptyText}>לא נמצאו תוצאות...</Text>}
        </View>
    </ScrollView>
);

const ModeCard = ({ item, isActive }) => {
    const dispatch = useDispatch();
    const dpActions = useActions();

    const handleFavorite = (e) => {
        e.stopPropagation();
        dispatch(updateScene({ id: item.id, updates: { isFavorite: !item.isFavorite } }));
    };

    const handleActivate = () => {
        if (item.category === 'music') {
            dpActions.work_mode.set('music');
        } else {
            dpActions.work_mode.set('scene');
            if (item.id.startsWith('mock-')) {
                // For mocks, we'd normally send specific scene data
                // dpActions.scene_data.set({...});
            }
        }
    };

    return (
        <View className={clsx(styles.card, isActive && styles.cardActive)} onClick={handleActivate}>
            <View className={styles.cardImageContainer}>
                {item.customImage && (
                    <Image
                        src={item.customImage}
                        className={styles.cardImage}
                        mode="aspectFill"
                    />
                )}
                <View className={styles.imageOverlay} />

                {isActive && <View className={styles.activeBadge}><Text className={styles.activeText}>פעיל</Text></View>}

                <View className={styles.cardHeader}>
                    <View className={styles.favoriteBtn} onClick={handleFavorite}>
                        <Text className={clsx(styles.starIcon, item.isFavorite && styles.starred)}>★</Text>
                    </View>
                </View>

                <View className={styles.iconOverlay}>
                    <Text className={styles.modeIcon}>{getIconForMode(item.name || '')}</Text>
                </View>
            </View>

            <View className={styles.cardInfo}>
                <Text className={styles.cardName}>{item.name}</Text>
                <Text className={styles.cardDetails}>{item.devices?.length || 1} מנורות</Text>
            </View>
        </View>
    );
};

const getIconForMode = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('ערב') || n.includes('רומנטי')) return '🌙';
    if (n.includes('קריאה') || n.includes('ריכוז')) return '📖';
    if (n.includes('מסיבה') || n.includes('ריקוד')) return '🎉';
    if (n.includes('בוקר')) return '☀️';
    if (n.includes('ארוחה')) return '🍽️';
    if (n.includes('סרט')) return '🎬';
    return '💡';
};
