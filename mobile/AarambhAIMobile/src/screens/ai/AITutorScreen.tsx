import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ChatMessage, ChatInput } from '../../components/ai';
import { Button, Modal, Badge } from '../../components/common';
import { aiService } from '../../services/ai';
import { COLORS, FONT_SIZES, DIMENSIONS, SUBJECTS, EDUCATION_LEVELS } from '../../constants';
import type { ChatMessage as ChatMessageType } from '../../types';

const AITutorScreen: React.FC = () => {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    subject: '',
    level: '',
    language: 'English',
  });

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: ChatMessageType = {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI tutor. I'm here to help you learn and understand any topic with personalized explanations and step-by-step guidance. What would you like to learn today?",
      timestamp: new Date(),
      metadata: { confidence: 0.95 }
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call AI tutor service
      const response = await aiService.askTutor(messageText, {
        subject: settings.subject || undefined,
        level: settings.level || undefined,
        language: settings.language || undefined,
      });

      if (response.success) {
        const aiMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response.data.content,
          timestamp: new Date(),
          metadata: {
            confidence: response.data.confidence,
            provider: response.data.provider,
            processingTime: response.data.processingTime,
          }
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
        metadata: { confidence: 0 }
      };
      setMessages(prev => [...prev, errorMessage]);
      
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            // Add welcome message back
            const welcomeMessage: ChatMessageType = {
              id: Date.now().toString(),
              type: 'ai',
              content: "Chat cleared! What would you like to learn today?",
              timestamp: new Date(),
              metadata: { confidence: 0.95 }
            };
            setMessages([welcomeMessage]);
          }
        }
      ]
    );
  };

  const renderMessage = ({ item }: { item: ChatMessageType }) => (
    <ChatMessage message={item} showAvatar={true} />
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      onClose={() => setShowSettings(false)}
      title="Tutor Settings"
      position="bottom"
    >
      <View style={styles.settingsContent}>
        {/* Subject Selection */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Subject (Optional)</Text>
          <View style={styles.optionsList}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                !settings.subject && styles.optionButtonSelected
              ]}
              onPress={() => setSettings(prev => ({ ...prev, subject: '' }))}
            >
              <Text style={[
                styles.optionText,
                !settings.subject && styles.optionTextSelected
              ]}>
                Any Subject
              </Text>
            </TouchableOpacity>
            {SUBJECTS.slice(0, 6).map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.optionButton,
                  settings.subject === subject && styles.optionButtonSelected
                ]}
                onPress={() => setSettings(prev => ({ ...prev, subject }))}
              >
                <Text style={[
                  styles.optionText,
                  settings.subject === subject && styles.optionTextSelected
                ]}>
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Level Selection */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Education Level (Optional)</Text>
          <View style={styles.optionsList}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                !settings.level && styles.optionButtonSelected
              ]}
              onPress={() => setSettings(prev => ({ ...prev, level: '' }))}
            >
              <Text style={[
                styles.optionText,
                !settings.level && styles.optionTextSelected
              ]}>
                Any Level
              </Text>
            </TouchableOpacity>
            {EDUCATION_LEVELS.slice(0, 6).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  settings.level === level && styles.optionButtonSelected
                ]}
                onPress={() => setSettings(prev => ({ ...prev, level }))}
              >
                <Text style={[
                  styles.optionText,
                  settings.level === level && styles.optionTextSelected
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Language</Text>
          <View style={styles.optionsList}>
            {['English', 'Hindi', 'Both'].map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.optionButton,
                  settings.language === language && styles.optionButtonSelected
                ]}
                onPress={() => setSettings(prev => ({ ...prev, language }))}
              >
                <Text style={[
                  styles.optionText,
                  settings.language === language && styles.optionTextSelected
                ]}>
                  {language}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title="Apply Settings"
          onPress={() => setShowSettings(false)}
          fullWidth
          style={styles.applyButton}
        />
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>AI Tutor</Text>
            {(settings.subject || settings.level) && (
              <View style={styles.badgeContainer}>
                {settings.subject && (
                  <Badge text={settings.subject} variant="info" size="small" />
                )}
                {settings.level && (
                  <Badge text={settings.level} variant="success" size="small" />
                )}
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="settings-outline" size={24} color={COLORS.background.light} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClearChat}
          >
            <Ionicons name="trash-outline" size={24} color={COLORS.background.light} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        showsVerticalScrollIndicator={false}
      />

      {/* Chat Input */}
      <ChatInput
        onSend={handleSendMessage}
        placeholder="Ask me anything about your studies..."
        disabled={isLoading}
      />

      {/* Settings Modal */}
      {renderSettingsModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  header: {
    backgroundColor: COLORS.primary[600],
    paddingHorizontal: DIMENSIONS.SCREEN_PADDING,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: COLORS.grey[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerLeft: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.background.light,
    marginRight: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesList: {
    flex: 1,
    paddingVertical: 8,
  },
  settingsContent: {
    paddingVertical: 8,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  optionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    backgroundColor: COLORS.grey[100],
    borderWidth: 1,
    borderColor: COLORS.grey[200],
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[600],
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  applyButton: {
    marginTop: 16,
  },
});

export default AITutorScreen;