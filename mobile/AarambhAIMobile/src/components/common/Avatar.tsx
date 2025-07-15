import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '../../constants';

interface AvatarProps {
  size?: number;
  source?: string;
  name?: string;
  onPress?: () => void;
  style?: ViewStyle;
  showBadge?: boolean;
  badgeColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  size = 50,
  source,
  name,
  onPress,
  style,
  showBadge = false,
  badgeColor = COLORS.success.main,
}) => {
  const getInitials = (fullName?: string): string => {
    if (!fullName) return '?';
    
    const words = fullName.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...style,
  };

  const renderContent = () => {
    if (source) {
      return (
        <Image
          source={{ uri: source }}
          style={styles.image}
          resizeMode="cover"
        />
      );
    }

    return (
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {getInitials(name)}
      </Text>
    );
  };

  const renderBadge = () => {
    if (!showBadge) return null;

    return (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: badgeColor,
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: (size * 0.3) / 2,
            right: -2,
            bottom: -2,
          },
        ]}
      />
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={containerStyle}>
          {renderContent()}
          {renderBadge()}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {renderContent()}
      {renderBadge()}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: '600',
    color: COLORS.primary[700],
  },
  badge: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.background.light,
  },
});

export default Avatar;