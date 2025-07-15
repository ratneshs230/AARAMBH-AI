import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudySession } from '../../services/realtime';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { ProgressBar } from '../common/ProgressBar';

interface StudySessionCardProps {
  session: StudySession;
  onJoin: (sessionId: string) => void;
  onLeave?: (sessionId: string) => void;
  onViewDetails?: (sessionId: string) => void;
  isCurrentUserHost?: boolean;
  isCurrentUserParticipant?: boolean;
  style?: any;
}

export const StudySessionCard: React.FC<StudySessionCardProps> = ({
  session,
  onJoin,
  onLeave,
  onViewDetails,
  isCurrentUserHost = false,
  isCurrentUserParticipant = false,
  style,
}) => {
  const handleJoin = () => {
    if (session.participants.length >= session.maxParticipants) {
      Alert.alert('Session Full', 'This study session is currently full. Please try again later.');
      return;
    }
    
    onJoin(session.id);
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Session',
      'Are you sure you want to leave this study session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => onLeave?.(session.id) },
      ]
    );
  };

  const getStatusColor = (status: StudySession['status']) => {
    switch (status) {
      case 'active':
        return COLORS.success.main;
      case 'waiting':
        return COLORS.warning.main;
      case 'paused':
        return COLORS.orange;
      case 'ended':
        return COLORS.grey[500];
      default:
        return COLORS.grey[500];
    }
  };

  const getStatusText = (status: StudySession['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'waiting':
        return 'Waiting';
      case 'paused':
        return 'Paused';
      case 'ended':
        return 'Ended';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 0) {
      return 'Started';
    } else if (diffMins === 0) {
      return 'Starting now';
    } else if (diffMins < 60) {
      return `Starts in ${diffMins}m`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      return `Starts in ${diffHours}h ${remainingMins}m`;
    }
  };

  const getParticipationPercentage = () => {
    return (session.participants.length / session.maxParticipants) * 100;
  };

  const renderParticipants = () => {
    const displayCount = Math.min(session.participants.length, 3);
    const remainingCount = session.participants.length - displayCount;
    
    return (
      <View style={styles.participantsContainer}>
        <View style={styles.participantAvatars}>
          {session.participants.slice(0, displayCount).map((participant, index) => (
            <Avatar
              key={participant.id}
              source={participant.avatar}
              name={participant.name}
              size={24}
              style={[styles.participantAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
            />
          ))}
          {remainingCount > 0 && (
            <View style={[styles.participantAvatar, styles.remainingCount, { marginLeft: -8 }]}>
              <Text style={styles.remainingCountText}>+{remainingCount}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.participantCount}>
          {session.participants.length}/{session.maxParticipants} participants
        </Text>
      </View>
    );
  };

  const renderSessionActions = () => {
    if (session.status === 'ended') {
      return (
        <Button
          title="View Details"
          variant="outline"
          size="small"
          onPress={() => onViewDetails?.(session.id)}
          style={styles.actionButton}
        />
      );
    }

    if (isCurrentUserParticipant) {
      return (
        <View style={styles.actionButtons}>
          <Button
            title="Leave"
            variant="outline"
            size="small"
            onPress={handleLeave}
            style={styles.actionButton}
            icon="exit-outline"
          />
          <Button
            title="Open"
            size="small"
            onPress={() => onViewDetails?.(session.id)}
            style={styles.actionButton}
            icon="open-outline"
          />
        </View>
      );
    }

    if (session.participants.length >= session.maxParticipants) {
      return (
        <Button
          title="Full"
          variant="outline"
          size="small"
          disabled
          style={styles.actionButton}
        />
      );
    }

    return (
      <Button
        title="Join"
        size="small"
        onPress={handleJoin}
        style={styles.actionButton}
        icon="person-add-outline"
      />
    );
  };

  return (
    <Card variant="elevated" style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => onViewDetails?.(session.id)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.sessionIcon}>
              <Ionicons name="people" size={20} color={COLORS.primary[600]} />
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle} numberOfLines={1}>
                {session.title}
              </Text>
              <Text style={styles.sessionHost}>
                by {session.hostName}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <Badge
              text={getStatusText(session.status)}
              variant="outline"
              size="small"
              style={{ borderColor: getStatusColor(session.status) }}
            />
            {isCurrentUserHost && (
              <Badge
                text="Host"
                variant="primary"
                size="small"
                style={styles.hostBadge}
              />
            )}
          </View>
        </View>

        <Text style={styles.sessionDescription} numberOfLines={2}>
          {session.description}
        </Text>

        <View style={styles.sessionDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="book-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>{session.subject}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>{formatTime(session.startTime)}</Text>
          </View>
          
          {session.isPublic ? (
            <View style={styles.detailItem}>
              <Ionicons name="globe-outline" size={16} color={COLORS.success.main} />
              <Text style={[styles.detailText, { color: COLORS.success.main }]}>Public</Text>
            </View>
          ) : (
            <View style={styles.detailItem}>
              <Ionicons name="lock-closed-outline" size={16} color={COLORS.warning.main} />
              <Text style={[styles.detailText, { color: COLORS.warning.main }]}>Private</Text>
            </View>
          )}
        </View>

        {session.currentTopic && (
          <View style={styles.currentTopicContainer}>
            <Ionicons name="bookmark-outline" size={14} color={COLORS.primary[600]} />
            <Text style={styles.currentTopicText}>
              Current topic: {session.currentTopic}
            </Text>
          </View>
        )}

        {renderParticipants()}

        <View style={styles.participationProgress}>
          <ProgressBar
            progress={getParticipationPercentage()}
            style={styles.progressBar}
            color={getStatusColor(session.status)}
          />
          <Text style={styles.progressText}>
            {Math.round(getParticipationPercentage())}% full
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.footer}>
        {renderSessionActions()}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  sessionHost: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hostBadge: {
    marginLeft: 4,
  },
  sessionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  sessionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  currentTopicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DIMENSIONS.BORDER_RADIUS / 2,
    marginBottom: 12,
    gap: 4,
  },
  currentTopicText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[700],
    fontWeight: '500',
  },
  participantsContainer: {
    marginBottom: 12,
  },
  participantAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantAvatar: {
    borderWidth: 2,
    borderColor: COLORS.background.light,
  },
  remainingCount: {
    backgroundColor: COLORS.grey[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingCountText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  participantCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  participationProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});

export default StudySessionCard;