import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createMobileStyles, getResponsiveDimensions } from '../styles/mobileLayout';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilterPress?: () => void;
  showFilter?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  style?: any;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  onFilterPress,
  showFilter = true,
  value,
  onChangeText,
  style,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value || '');
  const dims = getResponsiveDimensions();
  const mobileStyles = createMobileStyles(theme);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onChangeText?.(query);
    onSearch(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onChangeText?.('');
    onSearch('');
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingHorizontal: dims.spacing.m,
      paddingVertical: dims.spacing.s,
      marginHorizontal: dims.layout.screenPadding,
      marginVertical: dims.spacing.s,
      borderWidth: 1,
      borderColor: isFocused ? theme.colors.primary : theme.colors.outline,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    searchIcon: {
      marginRight: dims.spacing.s,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: 0,
    },
    clearButton: {
      padding: dims.spacing.xs,
      marginLeft: dims.spacing.s,
    },
    filterButton: {
      padding: dims.spacing.xs,
      marginLeft: dims.spacing.s,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
    },
    filterButtonInactive: {
      backgroundColor: theme.colors.outline,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Icon
        name="search"
        size={20}
        color={theme.colors.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={searchQuery}
        onChangeText={handleSearch}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        onSubmitEditing={() => onSearch(searchQuery)}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
          <Icon name="clear" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
      {showFilter && onFilterPress && (
        <TouchableOpacity
          style={[
            styles.filterButton,
            isFocused && styles.filterButtonInactive,
          ]}
          onPress={onFilterPress}
        >
          <Icon
            name="tune"
            size={16}
            color={isFocused ? theme.colors.textSecondary : theme.colors.onPrimary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
