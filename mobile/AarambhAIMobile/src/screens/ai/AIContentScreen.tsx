import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Modal, Badge, LoadingSpinner } from '../../components/common';
import { aiService } from '../../services/ai';
import { COLORS, FONT_SIZES, DIMENSIONS, SUBJECTS, EDUCATION_LEVELS } from '../../constants';

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  prompts: string[];
}

const contentTemplates: ContentTemplate[] = [
  {
    id: 'lesson_plan',
    name: 'Lesson Plan',
    description: 'Create comprehensive lesson plans with objectives and activities',
    icon: 'book-outline',
    color: COLORS.primary[500],
    prompts: [
      'Create a lesson plan for [topic] for [grade level]',
      'Include learning objectives and assessment methods',
      'Add interactive activities and group exercises',
    ]
  },
  {
    id: 'study_notes',
    name: 'Study Notes',
    description: 'Generate detailed study notes with key concepts',
    icon: 'document-text-outline',
    color: COLORS.secondary[500],
    prompts: [
      'Create comprehensive study notes for [topic]',
      'Include key concepts, definitions, and examples',
      'Organize with headings and bullet points',
    ]
  },
  {
    id: 'practice_problems',
    name: 'Practice Problems',
    description: 'Generate practice problems with step-by-step solutions',
    icon: 'calculator-outline',
    color: COLORS.warning.main,
    prompts: [
      'Create practice problems for [topic] at [difficulty level]',
      'Include detailed solutions and explanations',
      'Vary the problem types and complexity',
    ]
  },
  {
    id: 'summary',
    name: 'Topic Summary',
    description: 'Create concise summaries of complex topics',
    icon: 'list-outline',
    color: COLORS.success.main,
    prompts: [
      'Summarize [topic] in [word count] words',
      'Focus on the most important concepts',
      'Use simple language for [grade level]',
    ]
  },
  {
    id: 'flashcards',
    name: 'Flashcards',
    description: 'Generate flashcards for key terms and concepts',
    icon: 'layers-outline',
    color: COLORS.error.main,
    prompts: [
      'Create flashcards for key terms in [topic]',
      'Include definitions and examples',
      'Format as question and answer pairs',
    ]
  },
  {
    id: 'explanation',
    name: 'Concept Explanation',
    description: 'Explain difficult concepts in simple terms',
    icon: 'bulb-outline',
    color: COLORS.primary[700],
    prompts: [
      'Explain [concept] in simple terms for [grade level]',
      'Use analogies and real-world examples',
      'Break down complex ideas step by step',
    ]
  }
];

const AIContentScreen: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  
  const [contentSettings, setContentSettings] = useState({
    subject: '',
    level: '',
    contentType: '',
    topic: '',
    customPrompt: '',
  });

  const handleTemplateSelect = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setContentSettings(prev => ({ ...prev, contentType: template.name }));
    setShowTemplateModal(false);
    setShowSettingsModal(true);
  };

  const generateContent = async () => {
    if (!contentSettings.topic.trim()) {
      Alert.alert('Error', 'Please enter a topic for content generation');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Build the prompt based on template and settings
      let prompt = contentSettings.customPrompt;
      
      if (selectedTemplate && !prompt) {
        prompt = selectedTemplate.prompts.join(' ');
        prompt = prompt
          .replace(/\[topic\]/g, contentSettings.topic)
          .replace(/\[grade level\]/g, contentSettings.level || 'appropriate grade level')
          .replace(/\[difficulty level\]/g, contentSettings.level || 'appropriate difficulty')
          .replace(/\[word count\]/g, '200-300');
      }

      const response = await aiService.createContent(prompt, {
        subject: contentSettings.subject || undefined,
        level: contentSettings.level || undefined,
        contentType: contentSettings.contentType || undefined,
      });

      if (response.success) {
        setGeneratedContent(response.data.content);
      } else {
        throw new Error('Failed to generate content');
      }
    } catch (error: any) {
      console.error('Error generating content:', error);
      Alert.alert('Error', 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearContent = () => {
    Alert.alert(
      'Clear Content',
      'Are you sure you want to clear the generated content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setGeneratedContent('');
            setSelectedTemplate(null);
            setContentSettings({
              subject: '',
              level: '',
              contentType: '',
              topic: '',
              customPrompt: '',
            });
          }
        }
      ]
    );
  };

  const renderTemplateCard = (template: ContentTemplate) => (
    <Card
      key={template.id}
      variant="elevated"
      touchable
      onPress={() => handleTemplateSelect(template)}
      style={styles.templateCard}
    >
      <View style={styles.templateHeader}>
        <View style={[styles.templateIcon, { backgroundColor: template.color + '20' }]}>
          <Ionicons name={template.icon as any} size={24} color={template.color} />
        </View>
        <Text style={styles.templateName}>{template.name}</Text>
      </View>
      <Text style={styles.templateDescription}>{template.description}</Text>
    </Card>
  );

  const renderTemplateModal = () => (
    <Modal
      visible={showTemplateModal}
      onClose={() => setShowTemplateModal(false)}
      title="Choose Content Template"
      position="center"
    >
      <ScrollView style={styles.templateGrid} showsVerticalScrollIndicator={false}>
        {contentTemplates.map(renderTemplateCard)}
        
        <Card
          variant="outlined"
          touchable
          onPress={() => {
            setSelectedTemplate(null);
            setContentSettings(prev => ({ ...prev, contentType: 'Custom' }));
            setShowTemplateModal(false);
            setShowSettingsModal(true);
          }}
          style={styles.customTemplateCard}
        >
          <View style={styles.templateHeader}>
            <View style={[styles.templateIcon, { backgroundColor: COLORS.grey[200] }]}>
              <Ionicons name="create-outline" size={24} color={COLORS.grey[600]} />
            </View>
            <Text style={styles.templateName}>Custom Content</Text>
          </View>
          <Text style={styles.templateDescription}>
            Create custom content with your own prompt
          </Text>
        </Card>
      </ScrollView>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      onClose={() => setShowSettingsModal(false)}
      title={selectedTemplate ? selectedTemplate.name : 'Custom Content'}
      position="bottom"
    >
      <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
        {/* Topic Input */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Topic *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter the topic for content generation"
            value={contentSettings.topic}
            onChangeText={(text) => setContentSettings(prev => ({ ...prev, topic: text }))}
            multiline
          />
        </View>

        {/* Subject Selection */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Subject (Optional)</Text>
          <View style={styles.optionsList}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                !contentSettings.subject && styles.optionButtonSelected
              ]}
              onPress={() => setContentSettings(prev => ({ ...prev, subject: '' }))}
            >
              <Text style={[
                styles.optionText,
                !contentSettings.subject && styles.optionTextSelected
              ]}>
                Any Subject
              </Text>
            </TouchableOpacity>
            {SUBJECTS.slice(0, 6).map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.optionButton,
                  contentSettings.subject === subject && styles.optionButtonSelected
                ]}
                onPress={() => setContentSettings(prev => ({ ...prev, subject }))}
              >
                <Text style={[
                  styles.optionText,
                  contentSettings.subject === subject && styles.optionTextSelected
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
                !contentSettings.level && styles.optionButtonSelected
              ]}
              onPress={() => setContentSettings(prev => ({ ...prev, level: '' }))}
            >
              <Text style={[
                styles.optionText,
                !contentSettings.level && styles.optionTextSelected
              ]}>
                Any Level
              </Text>
            </TouchableOpacity>
            {EDUCATION_LEVELS.slice(0, 6).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  contentSettings.level === level && styles.optionButtonSelected
                ]}
                onPress={() => setContentSettings(prev => ({ ...prev, level }))}
              >
                <Text style={[
                  styles.optionText,
                  contentSettings.level === level && styles.optionTextSelected
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Prompt for non-template content */}
        {!selectedTemplate && (
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Custom Prompt</Text>
            <TextInput
              style={[styles.textInput, { height: 100 }]}
              placeholder="Enter your custom prompt for content generation..."
              value={contentSettings.customPrompt}
              onChangeText={(text) => setContentSettings(prev => ({ ...prev, customPrompt: text }))}
              multiline
              textAlignVertical="top"
            />
          </View>
        )}

        <View style={styles.modalActions}>
          <Button
            title="Generate Content"
            onPress={() => {
              setShowSettingsModal(false);
              generateContent();
            }}
            fullWidth
            disabled={!contentSettings.topic.trim()}
          />
        </View>
      </ScrollView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Content Creator</Text>
          {selectedTemplate && (
            <Badge text={selectedTemplate.name} variant="info" size="small" />
          )}
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowTemplateModal(true)}
          >
            <Ionicons name="add-outline" size={24} color={COLORS.background.light} />
          </TouchableOpacity>
          
          {generatedContent && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={clearContent}
            >
              <Ionicons name="trash-outline" size={24} color={COLORS.background.light} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isGenerating ? (
          <LoadingSpinner
            text="Generating content..."
            style={styles.loadingContainer}
          />
        ) : generatedContent ? (
          <Card variant="elevated" style={styles.contentCard}>
            <Text style={styles.generatedContent}>{generatedContent}</Text>
            
            <View style={styles.contentActions}>
              <Button
                title="Regenerate"
                onPress={generateContent}
                variant="outline"
                size="small"
                icon="refresh-outline"
              />
              <Button
                title="Edit"
                onPress={() => setShowSettingsModal(true)}
                variant="outline"
                size="small"
                icon="create-outline"
              />
            </View>
          </Card>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color={COLORS.grey[400]}
              />
            </View>
            <Text style={styles.emptyTitle}>No Content Generated</Text>
            <Text style={styles.emptySubtitle}>
              Choose a template or create custom content to get started
            </Text>
            
            <Button
              title="Choose Template"
              onPress={() => setShowTemplateModal(true)}
              style={styles.getStartedButton}
              icon="add-outline"
            />
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {renderTemplateModal()}
      {renderSettingsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  header: {
    backgroundColor: COLORS.secondary[600],
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.background.light,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: DIMENSIONS.SCREEN_PADDING,
  },
  loadingContainer: {
    marginTop: 100,
  },
  contentCard: {
    marginBottom: 16,
  },
  generatedContent: {
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  contentActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.grey[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  getStartedButton: {
    paddingHorizontal: 32,
  },
  templateGrid: {
    maxHeight: 400,
  },
  templateCard: {
    marginBottom: 12,
  },
  customTemplateCard: {
    marginBottom: 12,
    borderStyle: 'dashed',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  templateDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  settingsContent: {
    maxHeight: 500,
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
  textInput: {
    backgroundColor: COLORS.grey[50],
    borderWidth: 1,
    borderColor: COLORS.grey[200],
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    padding: 12,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    minHeight: 50,
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
    backgroundColor: COLORS.secondary[50],
    borderColor: COLORS.secondary[600],
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.secondary[600],
    fontWeight: '600',
  },
  modalActions: {
    marginTop: 16,
  },
});

export default AIContentScreen;