import React from 'react';
import { View, Input, Image } from '@ray-js/ray';
import styles from './index.module.less';

interface Props {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

export const SearchBar: React.FC<Props> = ({ value, onChange, placeholder = 'חפש מצב...', style }) => {
    const SEARCH_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LIDI1NSwgMjU1LCAwLjUpIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iOCI+PC9jaXJjbGU+PGxpbmUgeDE9IjIxIiB5MT0iMjEiIHgyPSIxNi42NSIgeTI9IjE2LjY1Ij48L2xpbmU+PC9zdmc+';

    return (
        <View className={styles.container} style={style}>
            <View className={styles.searchWrapper}>
                <Image src={SEARCH_ICON} className={styles.searchIcon} />
                <Input
                    className={styles.input}
                    value={value}
                    onInput={(e) => onChange(e.value)}
                    placeholder={placeholder}
                    placeholderStyle="color: rgba(255, 255, 255, 0.4);"
                />
            </View>
        </View>
    );
};
