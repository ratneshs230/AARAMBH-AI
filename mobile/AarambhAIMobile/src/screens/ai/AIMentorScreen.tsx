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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage, ChatInput } from '../../components/ai';
import { Button, Modal, Badge, Card } from '../../components/common';
import { aiService } from '../../services/ai';
import { COLORS, FONT_SIZES, DIMENSIONS, SUBJECTS, EDUCATION_LEVELS } from '../../constants';
import type { ChatMessage as ChatMessageType } from '../../types';

interface CareerTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  prompts: string[];
}

const careerTopics: CareerTopic[] = [
  {
    id: 'career_exploration',
    title: 'Career Exploration',
    description: 'Discover careers based on your interests and skills',
    icon: 'telescope-outline',
    color: COLORS.primary[500],
    prompts: [
      'Help me explore careers in [field]',
      'What careers match my interests in [subject]?',
      'Tell me about job prospects in [industry]'
    ]
  },
  {
    id: 'skill_development',
    title: 'Skill Development',
    description: 'Plan your skill development roadmap',
    icon: 'trending-up-outline',
    color: COLORS.secondary[500],
    prompts: [
      'What skills do I need for [career]?',
      'How can I develop [skill]?',
      'Create a learning path for [goal]'
    ]
  },
  {
    id: 'education_planning',
    title: 'Education Planning',
    description: 'Plan your educational journey strategically',
    icon: 'school-outline',
    color: COLORS.warning.main,
    prompts: [
      'What courses should I take for [career]?',
      'Should I pursue higher education for [field]?',
      'Compare different degree options for [interest]'
    ]
  },
  {
    id: 'industry_insights',
    title: 'Industry Insights',
    description: 'Get insights about different industries',
    icon: 'business-outline',
    color: COLORS.success.main,
    prompts: [
      'Tell me about the [industry] industry',
      'What are the trends in [sector]?',
      'How is technology changing [field]?'
    ]
  },
  {
    id: 'interview_prep',
    title: 'Interview Preparation',
    description: 'Prepare for interviews and assessments',
    icon: 'people-outline',
    color: COLORS.error.main,
    prompts: [
      'Help me prepare for [role] interview',
      'What questions are asked for [position]?',
      'How to answer common interview questions?'
    ]
  },
  {
    id: 'goal_setting',
    title: 'Goal Setting',
    description: 'Set and track your career goals',
    icon: 'flag-outline',
    color: COLORS.primary[700],
    prompts: [
      'Help me set career goals for [timeframe]',
      'How to achieve [career goal]?',
      'Create a 5-year career plan'
    ]
  }
];

const AIMentorScreen: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [settings, setSettings] = useState({
    interests: [] as string[],
    careerStage: '',
    goals: '',
  });

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: ChatMessageType = {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI Career Mentor. I'm here to guide you through career exploration, skill development, education planning, and achieving your professional goals. Whether you're starting your career journey or looking to advance, I can help you make informed decisions. What would you like to discuss today?",
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
      // Call AI mentor service
      const response = await aiService.getMentorship(messageText, {
        interests: settings.interests.length > 0 ? settings.interests : undefined,
        careerStage: settings.careerStage || undefined,
        goals: settings.goals || undefined,
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
      console.error('Error getting mentorship:', error);
      
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble providing guidance right now. Please try rephrasing your question or try again in a moment.",
        timestamp: new Date(),
        metadata: { confidence: 0 }
      };
      setMessages(prev => [...prev, errorMessage]);
      
      Alert.alert('Error', 'Failed to get mentorship. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSelect = (topic: CareerTopic) => {
    const prompt = topic.prompts[0]; // Use first prompt as default
    handleSendMessage(prompt);
    setShowTopics(false);
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
              content: "Chat cleared! What career guidance would you like today?",
              timestamp: new Date(),
              metadata: { confidence: 0.95 }
            };
            setMessages([welcomeMessage]);
          }
        }
      ]
    );
  };

  const toggleInterest = (interest: string) => {
    setSettings(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const renderMessage = ({ item }: { item: ChatMessageType }) => (
    <ChatMessage message={item} showAvatar={true} />
  );

  const renderTopicCard = (topic: CareerTopic) => (
    <Card
      key={topic.id}
      variant="elevated"
      touchable
      onPress={() => handleTopicSelect(topic)}
      style={styles.topicCard}
    >
      <View style={styles.topicHeader}>
        <View style={[styles.topicIcon, { backgroundColor: topic.color + '20' }]}>
          <Ionicons name={topic.icon as any} size={24} color={topic.color} />
        </View>
        <View style={styles.topicInfo}>
          <Text style={styles.topicTitle}>{topic.title}</Text>
        </View>
      </View>
      <Text style={styles.topicDescription}>{topic.description}</Text>
    </Card>
  );

  const renderTopicsModal = () => (
    <Modal
      visible={showTopics}
      onClose={() => setShowTopics(false)}
      title="Career Topics"
      position="center"
    >
      <ScrollView style={styles.topicsGrid} showsVerticalScrollIndicator={false}>
        <Text style={styles.topicsSubtitle}>
          Select a topic to get started with career guidance:
        </Text>
        
        {careerTopics.map(renderTopicCard)}
      </ScrollView>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      onClose={() => setShowSettings(false)}
      title="Mentor Preferences"
      position="bottom"
    >
      <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
        {/* Interests Selection */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Interests (Optional)</Text>
          <Text style={styles.settingDescription}>
            Select areas you're interested in for personalized guidance
          </Text>
          <View style={styles.interestsGrid}>
            {SUBJECTS.slice(0, 8).map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.interestButton,
                  settings.interests.includes(subject) && styles.interestButtonSelected
                ]}
                onPress={() => toggleInterest(subject)}
              >
                <Text style={[
                  styles.interestText,
                  settings.interests.includes(subject) && styles.interestTextSelected
                ]}>
                  {subject}
                </Text>
                {settings.interests.includes(subject) && (
                  <Ionicons name="checkmark" size={16} color={COLORS.primary[600]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Career Stage Selection */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Career Stage (Optional)</Text>
          <Text style={styles.settingDescription}>
            Your current stage for relevant advice
          </Text>
          <View style={styles.optionsList}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                !settings.careerStage && styles.optionButtonSelected
              ]}
              onPress={() => setSettings(prev => ({ ...prev, careerStage: '' }))}
            >
              <Text style={[
                styles.optionText,
                !settings.careerStage && styles.optionTextSelected
              ]}>
                Not Specified
              </Text>
            </TouchableOpacity>
            {['Student', 'Fresh Graduate', 'Early Career', 'Mid Career', 'Career Change'].map((stage) => (
              <TouchableOpacity
                key={stage}
                style={[
                  styles.optionButton,
                  settings.careerStage === stage && styles.optionButtonSelected
                ]}
                onPress={() => setSettings(prev => ({ ...prev, careerStage: stage }))}
              >
                <Text style={[
                  styles.optionText,
                  settings.careerStage === stage && styles.optionTextSelected
                ]}>
                  {stage}
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
      </ScrollView>
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
            <Text style={styles.title}>Career Mentor</Text>
            <Badge text="AI Guidance" variant="warning" size="small" />
            {(settings.interests.length > 0 || settings.careerStage) && (
              <View style={styles.badgeContainer}>
                {settings.careerStage && (
                  <Badge text={settings.careerStage} variant="info" size="small" />
                )}
                {settings.interests.length > 0 && (
                  <Badge text={`${settings.interests.length} interests`} variant="success" size="small" />
                )}
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowTopics(true)}
          >
            <Ionicons name="compass-outline" size={24} color={COLORS.background.light} />
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

      {/* Career Guidance Banner */}
      {messages.length <= 1 && (
        <View style={styles.guidanceBanner}>
          <Ionicons name="star-outline" size={20} color={COLORS.warning.main} />
          <Text style={styles.guidanceText}>
            Ask about career paths, skills needed, education planning, or industry insights
          </Text>
        </View>
      )}

      {/* Chat Input */}
      <ChatInput
        onSend={handleSendMessage}
        placeholder="Ask about careers, skills, or professional guidance..."
        disabled={isLoading}
      />

      {/* Modals */}
      {renderTopicsModal()}
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
    backgroundColor: COLORS.primary[700],
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
  guidanceBanner: {
    backgroundColor: COLORS.warning.light,
    paddingHorizontal: DIMENSIONS.SCREEN_PADDING,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.warning.main,
  },
  guidanceText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning.dark,
    marginLeft: 8,
    flex: 1,
  },
  topicsGrid: {
    maxHeight: 500,
  },
  topicsSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  topicCard: {
    marginBottom: 12,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  topicDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  settingsContent: {
    maxHeight: 600,
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
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    backgroundColor: COLORS.grey[100],
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  interestButtonSelected: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[600],
  },
  interestText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  interestTextSelected: {
    color: COLORS.primary[600],
    fontWeight: '600',
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

export default AIMentorScreen;