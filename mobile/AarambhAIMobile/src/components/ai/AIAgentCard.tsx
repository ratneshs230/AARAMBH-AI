import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';
import Card from '../common/Card';
import Badge from '../common/Badge';

interface AIAgentCardProps {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isAvailable?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const AIAgentCard: React.FC<AIAgentCardProps> = ({
  type,
  name,
  description,
  icon,
  color,
  isAvailable = true,
  onPress,
  style,
}) => {
  return (
    <Card
      variant="elevated"
      touchable
      onPress={onPress}
      style={[styles.container, style]}
      disabled={!isAvailable}
    >
      <View style={styles.content}>
        {/* Icon and Status */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as any} size={32} color={color} />
          </View>
          
          <View style={styles.statusContainer}>
            <Badge
              text={isAvailable ? 'Available' : 'Offline'}
              variant={isAvailable ? 'success' : 'error'}
              size="small"
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Action */}
        <View style={styles.actionContainer}>
          <View style={[styles.colorIndicator, { backgroundColor: color }]} />
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isAvailable ? COLORS.grey[400] : COLORS.grey[300]}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    opacity: 1,
  },
  content: {
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  textContainer: {
    flex: 1,
    marginBottom: 16,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
});

export default AIAgentCard;