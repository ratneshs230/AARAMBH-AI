import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRealtimeMessaging, useTypingIndicator, useUserPresence } from '../../hooks/useRealtime';
import { RealtimeMessage } from '../../services/realtime';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../../constants';
import { TextInput } from '../common/TextInput';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

interface RealtimeChatProps {
  channel: string;
  title?: string;
  placeholder?: string;
  style?: any;
  onMessagePress?: (message: RealtimeMessage) => void;
  showTypingIndicator?: boolean;
  showUserPresence?: boolean;
  maxHeight?: number;
}

export const RealtimeChat: React.FC<RealtimeChatProps> = ({
  channel,
  title,
  placeholder = 'Type a message...',
  style,
  onMessagePress,
  showTypingIndicator = true,
  showUserPresence = true,
  maxHeight = 400,
}) => {
  const { messages, isLoading, error, sendMessage } = useRealtimeMessaging(channel);
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(channel);
  const { allPresence } = useUserPresence();
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');
    stopTyping();
    setIsTyping(false);

    try {
      await sendMessage({
        text: messageText,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setInputText(messageText); // Restore the message
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      startTyping();
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      stopTyping();
    }
  };

  const handleInputFocus = () => {
    if (inputText.length > 0) {
      startTyping();
      setIsTyping(true);
    }
  };

  const handleInputBlur = () => {
    stopTyping();
    setIsTyping(false);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getUserPresenceStatus = (userId: string) => {
    const presence = allPresence.find(p => p.userId === userId);
    return presence?.status || 'offline';
  };

  const renderMessage = (message: RealtimeMessage, index: number) => {
    const isOwnMessage = message.sender.id === 'current_user'; // Replace with actual user ID
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const isFirstFromSender = !previousMessage || previousMessage.sender.id !== message.sender.id;
    const showAvatar = isFirstFromSender && !isOwnMessage;

    return (
      <TouchableOpacity
        key={message.id}
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
        ]}
        onPress={() => onMessagePress?.(message)}
        activeOpacity={0.7}
      >
        <View style={styles.messageRow}>
          {showAvatar ? (
            <Avatar
              source={message.sender.avatar}
              name={message.sender.name}
              size={32}
              style={styles.messageAvatar}
            />
          ) : (
            <View style={styles.messageAvatarPlaceholder} />
          )}
          
          <View style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}>
            {isFirstFromSender && !isOwnMessage && (
              <View style={styles.messageHeader}>
                <Text style={styles.senderName}>{message.sender.name}</Text>
                {showUserPresence && (
                  <View style={styles.presenceContainer}>
                    <View style={[
                      styles.presenceIndicator,
                      { backgroundColor: getUserPresenceStatus(message.sender.id) === 'online' ? COLORS.success.main : COLORS.grey[400] }
                    ]} />
                  </View>
                )}
              </View>
            )}
            
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}>
              {message.content.text || message.content}
            </Text>
            
            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
              ]}>
                {formatMessageTime(message.timestamp)}
              </Text>
              
              {isOwnMessage && (
                <View style={styles.messageStatus}>
                  <Ionicons
                    name={message.metadata?.synced ? 'checkmark-done' : 'checkmark'}
                    size={12}
                    color={COLORS.success.main}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTypingIndicator = () => {
    if (!showTypingIndicator || typingUsers.length === 0) return null;

    const typingNames = typingUsers.map(user => user.userName);
    const typingText = typingNames.length === 1 
      ? `${typingNames[0]} is typing...`
      : `${typingNames.slice(0, -1).join(', ')} and ${typingNames[typingNames.length - 1]} are typing...`;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingIndicator}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
          <Text style={styles.typingText}>{typingText}</Text>
        </View>
      </View>
    );
  };

  const renderOnlineUsers = () => {
    if (!showUserPresence) return null;

    const onlineUsers = allPresence.filter(p => p.status === 'online');
    if (onlineUsers.length === 0) return null;

    return (
      <View style={styles.onlineUsersContainer}>
        <Text style={styles.onlineUsersTitle}>Online ({onlineUsers.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.onlineUsersList}>
            {onlineUsers.map((user) => (
              <View key={user.userId} style={styles.onlineUserItem}>
                <Avatar
                  source={user.userName} // Replace with actual avatar
                  name={user.userName}
                  size={24}
                />
                <View style={styles.onlineIndicator} />
                <Text style={styles.onlineUserName} numberOfLines={1}>
                  {user.userName}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {title && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          {showUserPresence && (
            <Badge
              text={`${allPresence.filter(p => p.status === 'online').length} online`}
              variant="success"
              size="small"
            />
          )}
        </View>
      )}

      {renderOnlineUsers()}

      <View style={[styles.chatContainer, { maxHeight }]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color={COLORS.grey[400]} />
              <Text style={styles.emptyStateText}>No messages yet</Text>
              <Text style={styles.emptyStateSubtext}>Start the conversation!</Text>
            </View>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}
          
          {renderTypingIndicator()}
        </ScrollView>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={COLORS.error.main} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            multiline
            maxLength={1000}
            style={styles.messageInput}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <Ionicons name="hourglass-outline" size={20} color={COLORS.background.light} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.background.light} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background.light,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  onlineUsersContainer: {
    backgroundColor: COLORS.background.light,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  onlineUsersTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  onlineUsersList: {
    flexDirection: 'row',
    gap: 12,
  },
  onlineUserItem: {
    alignItems: 'center',
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success.main,
    borderWidth: 1,
    borderColor: COLORS.background.light,
  },
  onlineUserName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: 4,
    maxWidth: 60,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  messageContainer: {
    marginVertical: 2,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  messageAvatar: {
    marginRight: 8,
    marginBottom: 4,
  },
  messageAvatarPlaceholder: {
    width: 40,
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  ownMessageBubble: {
    backgroundColor: COLORS.primary[600],
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.background.light,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.grey[200],
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  presenceContainer: {
    marginLeft: 8,
  },
  presenceIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  ownMessageText: {
    color: COLORS.background.light,
  },
  otherMessageText: {
    color: COLORS.text.primary,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
  },
  ownMessageTime: {
    color: COLORS.primary[200],
  },
  otherMessageTime: {
    color: COLORS.text.secondary,
  },
  messageStatus: {
    marginLeft: 4,
  },
  typingContainer: {
    paddingVertical: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grey[100],
    padding: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.grey[500],
    marginHorizontal: 1,
  },
  typingDot1: {
    animation: 'pulse 1.4s infinite ease-in-out',
  },
  typingDot2: {
    animation: 'pulse 1.4s infinite ease-in-out 0.2s',
  },
  typingDot3: {
    animation: 'pulse 1.4s infinite ease-in-out 0.4s',
  },
  typingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.error.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.error.main,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error.dark,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
  },
  messageInput: {
    flex: 1,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary[600],
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.grey[400],
  },
});

export default RealtimeChat;