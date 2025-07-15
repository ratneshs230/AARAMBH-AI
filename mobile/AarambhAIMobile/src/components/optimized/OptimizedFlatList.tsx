import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, FlatListProps, RefreshControl, View, Text, StyleSheet, ViewabilityConfig } from 'react-native';
import { COLORS, FONT_SIZES } from '../../constants';
import { listUtils, useRenderPerformance } from '../../utils/performance';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  itemHeight?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactElement;
  estimatedItemSize?: number;
  windowSize?: number;
  maxToRenderPerBatch?: number;
  updateCellsBatchingPeriod?: number;
  removeClippedSubviews?: boolean;
  onViewableItemsChanged?: (info: { viewableItems: any[]; changed: any[] }) => void;
  viewabilityConfig?: ViewabilityConfig;
  enableVirtualization?: boolean;
  maintainVisibleContentPosition?: {
    minIndexForVisible: number;
    autoscrollToTopThreshold?: number;
  };
}

function OptimizedFlatList<T extends { id?: string | number }>({
  data,
  renderItem,
  itemHeight,
  onRefresh,
  refreshing = false,
  emptyMessage = 'No items found',
  emptyIcon,
  estimatedItemSize = 80,
  windowSize = 10,
  maxToRenderPerBatch = 10,
  updateCellsBatchingPeriod = 100,
  removeClippedSubviews = true,
  onViewableItemsChanged,
  viewabilityConfig,
  enableVirtualization = true,
  maintainVisibleContentPosition,
  ...props
}: OptimizedFlatListProps<T>) {
  useRenderPerformance('OptimizedFlatList');
  
  const flatListRef = useRef<FlatList<T>>(null);
  const [viewableItems, setViewableItems] = useState<any[]>([]);
  
  // Memoized key extractor
  const keyExtractor = useCallback((item: T, index: number) => {
    return item.id?.toString() || index.toString();
  }, []);

  // Memoized render item function
  const memoizedRenderItem = useCallback(({ item, index }: { item: T; index: number }) => {
    return renderItem(item, index);
  }, [renderItem]);

  // Memoized item layout calculation
  const getItemLayout = useMemo(() => {
    if (itemHeight) {
      return listUtils.getItemLayout(itemHeight);
    }
    return undefined;
  }, [itemHeight]);

  // Memoized viewability config
  const memoizedViewabilityConfig = useMemo(() => {
    return viewabilityConfig || {
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 300,
    };
  }, [viewabilityConfig]);

  // Handle viewable items changed
  const handleViewableItemsChanged = useCallback(
    (info: { viewableItems: any[]; changed: any[] }) => {
      setViewableItems(info.viewableItems);
      onViewableItemsChanged?.(info);
    },
    [onViewableItemsChanged]
  );

  // Memoized empty component
  const EmptyComponent = useMemo(() => {
    if (data.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          {emptyIcon}
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      );
    }
    return null;
  }, [data.length, emptyMessage, emptyIcon]);

  // Memoized refresh control
  const refreshControl = useMemo(() => {
    if (onRefresh) {
      return (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary[600]]}
          tintColor={COLORS.primary[600]}
        />
      );
    }
    return undefined;
  }, [onRefresh, refreshing]);

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListEmptyComponent={EmptyComponent}
      refreshControl={refreshControl}
      
      // Performance optimizations
      windowSize={windowSize}
      maxToRenderPerBatch={maxToRenderPerBatch}
      updateCellsBatchingPeriod={updateCellsBatchingPeriod}
      removeClippedSubviews={removeClippedSubviews}
      initialNumToRender={10}
      
      // Memory optimizations
      disableVirtualization={!enableVirtualization}
      legacyImplementation={false}
      
      // Scroll optimizations
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      
      // Viewability tracking
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={memoizedViewabilityConfig}
      
      // Content position maintenance
      maintainVisibleContentPosition={maintainVisibleContentPosition}
      
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

// Memoize the entire component
export default React.memo(OptimizedFlatList) as <T extends { id?: string | number }>(
  props: OptimizedFlatListProps<T>
) => React.ReactElement;