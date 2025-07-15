import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, DIMENSIONS as STYLE_DIMENSIONS } from '../../constants';

const { width, height } = Dimensions.get('window');

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  position?: 'center' | 'bottom' | 'top';
  style?: ViewStyle;
  overlayStyle?: ViewStyle;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  animationType = 'fade',
  position = 'center',
  style,
  overlayStyle,
}) => {
  const getModalContentStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: COLORS.background.light,
      borderRadius: STYLE_DIMENSIONS.BORDER_RADIUS_LARGE,
      padding: STYLE_DIMENSIONS.SCREEN_PADDING,
      maxHeight: height * 0.8,
    };

    switch (position) {
      case 'bottom':
        return {
          ...baseStyle,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          maxHeight: height * 0.7,
        };
      case 'top':
        return {
          ...baseStyle,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          maxHeight: height * 0.7,
        };
      default:
        return {
          ...baseStyle,
          width: width * 0.9,
          alignSelf: 'center',
        };
    }
  };

  const getContainerStyle = (): ViewStyle => {
    switch (position) {
      case 'bottom':
      case 'top':
        return styles.containerEdge;
      default:
        return styles.containerCenter;
    }
  };

  const renderHeader = () => {
    if (!title && !showCloseButton) return null;

    return (
      <View style={styles.header}>
        {title && <Text style={styles.title}>{title}</Text>}
        {showCloseButton && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close"
              size={24}
              color={COLORS.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, overlayStyle]}>
          <TouchableWithoutFeedback>
            <View style={getContainerStyle()}>
              <View style={[getModalContentStyle(), style]}>
                {renderHeader()}
                <View style={styles.content}>
                  {children}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: STYLE_DIMENSIONS.SCREEN_PADDING,
  },
  containerEdge: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
});

export default Modal;