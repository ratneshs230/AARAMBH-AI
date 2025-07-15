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
import { ChatMessage, ChatInput } from '../../components/ai';
import { Button, Modal, Badge } from '../../components/common';
import { aiService } from '../../services/ai';
import { COLORS, FONT_SIZES, DIMENSIONS, SUBJECTS, EDUCATION_LEVELS } from '../../constants';
import type { ChatMessage as ChatMessageType } from '../../types';

interface QuickQuestion {
  id: string;
  text: string;
  category: string;
}

const quickQuestions: QuickQuestion[] = [
  { id: '1', text: 'Explain this step by step', category: 'explanation' },
  { id: '2', text: 'How do I solve this problem?', category: 'problem' },
  { id: '3', text: 'What is the formula for this?', category: 'formula' },
  { id: '4', text: 'Can you give me an example?', category: 'example' },
  { id: '5', text: 'Why does this work?', category: 'concept' },
  { id: '6', text: 'What are the key points?', category: 'summary' },
];

const AIDoubtScreen: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const [settings, setSettings] = useState({
    subject: '',
    level: '',
  });

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: ChatMessageType = {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI Doubt Solver. I'm here to help you solve problems, clear doubts, and understand concepts instantly. You can ask me about homework, problems, or any topic you're struggling with. What would you like help with?",
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
      // Call AI doubt solver service
      const response = await aiService.solveDoubt(messageText, {
        subject: settings.subject || undefined,
        level: settings.level || undefined,
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
      console.error('Error solving doubt:', error);
      
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble solving this doubt right now. Please try rephrasing your question or try again in a moment.",
        timestamp: new Date(),
        metadata: { confidence: 0 }
      };
      setMessages(prev => [...prev, errorMessage]);
      
      Alert.alert('Error', 'Failed to solve doubt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: QuickQuestion) => {
    handleSendMessage(question.text);
    setShowQuickQuestions(false);
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
              content: "Chat cleared! What doubt would you like me to help you solve?",
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

  const renderQuickQuestionsModal = () => (
    <Modal
      visible={showQuickQuestions}
      onClose={() => setShowQuickQuestions(false)}
      title="Quick Questions"
      position="bottom"
    >
      <View style={styles.quickQuestionsContent}>
        <Text style={styles.quickQuestionsSubtitle}>
          Select a quick question or type your own:
        </Text>
        
        <View style={styles.quickQuestionsList}>
          {quickQuestions.map((question) => (
            <TouchableOpacity
              key={question.id}
              style={styles.quickQuestionButton}
              onPress={() => handleQuickQuestion(question)}
            >
              <Text style={styles.quickQuestionText}>{question.text}</Text>
              <Ionicons
                name="send-outline"
                size={16}
                color={COLORS.primary[600]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      onClose={() => setShowSettings(false)}
      title="Doubt Solver Settings"
      position="bottom"
    >
      <View style={styles.settingsContent}>
        {/* Subject Selection */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Subject (Optional)</Text>
          <Text style={styles.settingDescription}>
            Specify subject for more accurate solutions
          </Text>
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
            {SUBJECTS.slice(0, 8).map((subject) => (
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
          <Text style={styles.settingDescription}>
            Set your level for appropriate explanations
          </Text>
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
            <Text style={styles.title}>Doubt Solver</Text>
            <Badge text="Instant Help" variant="success" size="small" />
            {(settings.subject || settings.level) && (
              <View style={styles.badgeContainer}>
                {settings.subject && (
                  <Badge text={settings.subject} variant="info" size="small" />
                )}
                {settings.level && (
                  <Badge text={settings.level} variant="warning" size="small" />
                )}
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowQuickQuestions(true)}
          >
            <Ionicons name="flash-outline" size={24} color={COLORS.background.light} />
          </TouchableOpacity>
          
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

      {/* Quick Help Banner */}
      {messages.length <= 1 && (
        <View style={styles.quickHelpBanner}>
          <Ionicons name="bulb-outline" size={20} color={COLORS.warning.main} />
          <Text style={styles.quickHelpText}>
            Tip: You can upload images of problems or type your questions directly
          </Text>
        </View>
      )}

      {/* Chat Input */}
      <ChatInput
        onSend={handleSendMessage}
        placeholder="Describe your doubt or ask a question..."
        disabled={isLoading}
      />

      {/* Modals */}
      {renderQuickQuestionsModal()}
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
    backgroundColor: COLORS.success.main,
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
    gap: 8,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.background.light,
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
  quickHelpBanner: {
    backgroundColor: COLORS.warning.light,
    paddingHorizontal: DIMENSIONS.SCREEN_PADDING,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.warning.main,
  },
  quickHelpText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning.dark,
    marginLeft: 8,
    flex: 1,
  },
  quickQuestionsContent: {
    paddingVertical: 8,
  },
  quickQuestionsSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  quickQuestionsList: {
    gap: 8,
  },
  quickQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grey[50],
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    padding: 12,
  },
  quickQuestionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    flex: 1,
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
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
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
    backgroundColor: COLORS.success.light,
    borderColor: COLORS.success.main,
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.success.dark,
    fontWeight: '600',
  },
  applyButton: {
    marginTop: 16,
  },
});

export default AIDoubtScreen;