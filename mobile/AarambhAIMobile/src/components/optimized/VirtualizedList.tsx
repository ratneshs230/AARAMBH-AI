import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { 
  VirtualizedList as RNVirtualizedList, 
  VirtualizedListProps, 
  View, 
  Text, 
  StyleSheet,
  RefreshControl,
  ViewabilityConfig,
  ListRenderItem,
} from 'react-native';
import { COLORS, FONT_SIZES } from '../../constants';
import { useRenderPerformance } from '../../utils/performance';

interface VirtualizedListConfig<T> extends Omit<VirtualizedListProps<T>, 'renderItem' | 'getItem' | 'getItemCount'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  itemHeight: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactElement;
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
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  loadingFooter?: React.ReactElement;
  isLoading?: boolean;
  debug?: boolean;
}

function VirtualizedList<T extends { id?: string | number }>({
  data,
  renderItem,
  itemHeight,
  onRefresh,
  refreshing = false,
  emptyMessage = 'No items found',
  emptyIcon,
  windowSize = 10,
  maxToRenderPerBatch = 10,
  updateCellsBatchingPeriod = 50,
  removeClippedSubviews = true,
  onViewableItemsChanged,
  viewabilityConfig,
  enableVirtualization = true,
  maintainVisibleContentPosition,
  onEndReached,
  onEndReachedThreshold = 0.5,
  loadingFooter,
  isLoading = false,
  debug = false,
  ...props
}: VirtualizedListConfig<T>) {
  useRenderPerformance('VirtualizedList');
  
  const listRef = useRef<RNVirtualizedList<T>>(null);
  const [viewableItems, setViewableItems] = useState<any[]>([]);
  const [renderCount, setRenderCount] = useState(0);

  // Get item at index
  const getItem = useCallback((data: T[], index: number) => {
    return data[index];
  }, []);

  // Get item count
  const getItemCount = useCallback((data: T[]) => {
    return data.length;
  }, []);

  // Get item layout for virtualization
  const getItemLayout = useCallback((data: T[], index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }), [itemHeight]);

  // Memoized key extractor
  const keyExtractor = useCallback((item: T, index: number) => {
    return item.id?.toString() || index.toString();
  }, []);

  // Memoized render item function with performance tracking
  const memoizedRenderItem: ListRenderItem<T> = useCallback(({ item, index }) => {
    if (debug) {
      setRenderCount(prev => prev + 1);
    }
    
    return renderItem(item, index);
  }, [renderItem, debug]);

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

  // Handle end reached with throttling
  const handleEndReached = useCallback(() => {
    if (onEndReached && !isLoading) {
      onEndReached();
    }
  }, [onEndReached, isLoading]);

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

  // Memoized footer component
  const FooterComponent = useMemo(() => {
    if (isLoading && loadingFooter) {
      return loadingFooter;
    }
    return null;
  }, [isLoading, loadingFooter]);

  // Debug info
  const debugInfo = useMemo(() => {
    if (debug) {
      return (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Items: {data.length} | Renders: {renderCount} | Visible: {viewableItems.length}
          </Text>
        </View>
      );
    }
    return null;
  }, [debug, data.length, renderCount, viewableItems.length]);

  // Scroll to index method
  const scrollToIndex = useCallback((index: number, animated = true) => {
    listRef.current?.scrollToIndex({ index, animated });
  }, []);

  // Scroll to offset method
  const scrollToOffset = useCallback((offset: number, animated = true) => {
    listRef.current?.scrollToOffset({ offset, animated });
  }, []);

  // Exposed methods for parent components
  React.useImperativeHandle(props.ref, () => ({
    scrollToIndex,
    scrollToOffset,
    getViewableItems: () => viewableItems,
    getRenderCount: () => renderCount,
  }));

  // Reset render count when data changes
  useEffect(() => {
    if (debug) {
      setRenderCount(0);
    }
  }, [data, debug]);

  return (
    <View style={styles.container}>
      {debugInfo}
      <RNVirtualizedList
        ref={listRef}
        data={data}
        renderItem={memoizedRenderItem}
        keyExtractor={keyExtractor}
        getItem={getItem}
        getItemCount={getItemCount}
        getItemLayout={getItemLayout}
        ListEmptyComponent={EmptyComponent}
        ListFooterComponent={FooterComponent}
        refreshControl={refreshControl}
        
        // Performance optimizations
        windowSize={windowSize}
        maxToRenderPerBatch={maxToRenderPerBatch}
        updateCellsBatchingPeriod={updateCellsBatchingPeriod}
        removeClippedSubviews={removeClippedSubviews}
        initialNumToRender={10}
        
        // Memory optimizations
        disableVirtualization={!enableVirtualization}
        
        // Scroll optimizations
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        
        // Viewability tracking
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={memoizedViewabilityConfig}
        
        // Content position maintenance
        maintainVisibleContentPosition={maintainVisibleContentPosition}
        
        // Infinite scroll
        onEndReached={handleEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  debugContainer: {
    backgroundColor: COLORS.warning.light,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warning.main,
  },
  debugText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning.dark,
    fontWeight: '500',
  },
});

// Memoize the entire component
export default React.memo(VirtualizedList) as <T extends { id?: string | number }>(
  props: VirtualizedListConfig<T>
) => React.ReactElement;