import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';
import { ChatMessage as ChatMessageType } from '../../types';
import Avatar from '../common/Avatar';

interface ChatMessageProps {
  message: ChatMessageType;
  showAvatar?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  showAvatar = true,
}) => {
  const isUser = message.type === 'user';

  const getMessageBubbleStyle = (): ViewStyle => {
    return {
      ...styles.messageBubble,
      backgroundColor: isUser ? COLORS.primary[600] : COLORS.grey[100],
      marginLeft: isUser ? 50 : 0,
      marginRight: isUser ? 0 : 50,
      borderTopLeftRadius: isUser ? DIMENSIONS.BORDER_RADIUS : 4,
      borderTopRightRadius: isUser ? 4 : DIMENSIONS.BORDER_RADIUS,
    };
  };

  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {!isUser && showAvatar && (
        <Avatar
          size={36}
          name="AI"
          style={styles.avatar}
        />
      )}
      
      <View style={styles.messageContainer}>
        <View style={getMessageBubbleStyle()}>
          <Text
            style={[
              styles.messageText,
              { color: isUser ? COLORS.background.light : COLORS.text.primary }
            ]}
          >
            {message.content}
          </Text>
          
          {message.metadata?.confidence && !isUser && (
            <View style={styles.metadataContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={12}
                color={COLORS.success.main}
              />
              <Text style={styles.confidenceText}>
                {Math.round(message.metadata.confidence * 100)}% confidence
              </Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
      
      {isUser && showAvatar && (
        <Avatar
          size={36}
          name="You"
          style={styles.avatar}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: DIMENSIONS.SCREEN_PADDING,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginHorizontal: 8,
  },
  messageContainer: {
    flex: 1,
  },
  messageBubble: {
    padding: 12,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    marginVertical: 2,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[300],
  },
  confidenceText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success.main,
    marginLeft: 4,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  userTimestamp: {
    textAlign: 'right',
  },
  aiTimestamp: {
    textAlign: 'left',
  },
});

export default ChatMessage;