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

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  questionTypes: string[];
  defaultQuestions: number;
  prompts: string[];
}

const assessmentTemplates: AssessmentTemplate[] = [
  {
    id: 'multiple_choice',
    name: 'Multiple Choice Quiz',
    description: 'Quick assessment with 4-option questions',
    icon: 'radio-button-on-outline',
    color: COLORS.primary[500],
    questionTypes: ['multiple_choice'],
    defaultQuestions: 10,
    prompts: [
      'Create [questionCount] multiple choice questions on [topic]',
      'Include 4 options (A, B, C, D) for each question',
      'Provide correct answers and explanations',
      'Make questions appropriate for [level] level',
    ]
  },
  {
    id: 'mixed_quiz',
    name: 'Mixed Question Quiz',
    description: 'Comprehensive quiz with various question types',
    icon: 'help-outline',
    color: COLORS.secondary[500],
    questionTypes: ['multiple_choice', 'short_answer', 'true_false'],
    defaultQuestions: 8,
    prompts: [
      'Create a mixed quiz with [questionCount] questions on [topic]',
      'Include multiple choice, short answer, and true/false questions',
      'Vary difficulty levels and question types',
      'Provide detailed answers and explanations',
    ]
  },
  {
    id: 'short_answer',
    name: 'Short Answer Test',
    description: 'Descriptive questions requiring brief explanations',
    icon: 'create-outline',
    color: COLORS.warning.main,
    questionTypes: ['short_answer'],
    defaultQuestions: 6,
    prompts: [
      'Create [questionCount] short answer questions on [topic]',
      'Questions should require 2-3 sentence responses',
      'Include marking rubric and sample answers',
      'Focus on understanding and application',
    ]
  },
  {
    id: 'true_false',
    name: 'True/False Quiz',
    description: 'Quick true or false questions for concept checking',
    icon: 'checkmark-circle-outline',
    color: COLORS.success.main,
    questionTypes: ['true_false'],
    defaultQuestions: 15,
    prompts: [
      'Create [questionCount] true/false questions on [topic]',
      'Include clear explanations for each answer',
      'Cover key concepts and common misconceptions',
      'Make statements clear and unambiguous',
    ]
  },
  {
    id: 'case_study',
    name: 'Case Study Assessment',
    description: 'Scenario-based questions for practical application',
    icon: 'document-outline',
    color: COLORS.error.main,
    questionTypes: ['essay'],
    defaultQuestions: 3,
    prompts: [
      'Create [questionCount] case study questions on [topic]',
      'Include realistic scenarios and problem situations',
      'Questions should test practical application',
      'Provide detailed evaluation criteria',
    ]
  },
  {
    id: 'practice_test',
    name: 'Practice Test',
    description: 'Comprehensive test simulating exam conditions',
    icon: 'school-outline',
    color: COLORS.primary[700],
    questionTypes: ['multiple_choice', 'short_answer', 'essay'],
    defaultQuestions: 20,
    prompts: [
      'Create a comprehensive practice test with [questionCount] questions on [topic]',
      'Include multiple question types with varied difficulty',
      'Structure like a real exam with time estimates',
      'Provide complete answer key and grading rubric',
    ]
  }
];

interface GeneratedAssessment {
  title: string;
  questions: any[];
  metadata: {
    template: string;
    subject: string;
    level: string;
    questionCount: number;
    estimatedTime: number;
  };
}

const AIAssessmentScreen: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<AssessmentTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssessment, setGeneratedAssessment] = useState<GeneratedAssessment | null>(null);
  
  const [assessmentSettings, setAssessmentSettings] = useState({
    subject: '',
    level: '',
    topic: '',
    questionCount: 10,
    difficulty: 'medium',
    timeLimit: 30,
    includeAnswers: true,
    customPrompt: '',
  });

  const handleTemplateSelect = (template: AssessmentTemplate) => {
    setSelectedTemplate(template);
    setAssessmentSettings(prev => ({ 
      ...prev, 
      questionCount: template.defaultQuestions,
      timeLimit: template.defaultQuestions * 2, // 2 minutes per question estimate
    }));
    setShowTemplateModal(false);
    setShowSettingsModal(true);
  };

  const generateAssessment = async () => {
    if (!assessmentSettings.topic.trim()) {
      Alert.alert('Error', 'Please enter a topic for assessment generation');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Build the prompt based on template and settings
      let prompt = assessmentSettings.customPrompt;
      
      if (selectedTemplate && !prompt) {
        prompt = selectedTemplate.prompts.join(' ');
        prompt = prompt
          .replace(/\[topic\]/g, assessmentSettings.topic)
          .replace(/\[questionCount\]/g, assessmentSettings.questionCount.toString())
          .replace(/\[level\]/g, assessmentSettings.level || 'appropriate level')
          .replace(/\[difficulty\]/g, assessmentSettings.difficulty);
        
        // Add difficulty and answer requirements
        prompt += ` Make questions ${assessmentSettings.difficulty} difficulty.`;
        if (assessmentSettings.includeAnswers) {
          prompt += ' Include detailed answers and explanations.';
        }
        if (assessmentSettings.timeLimit) {
          prompt += ` Target completion time: ${assessmentSettings.timeLimit} minutes.`;
        }
      }

      const response = await aiService.createAssessment(prompt, {
        subject: assessmentSettings.subject || undefined,
        level: assessmentSettings.level || undefined,
        assessmentType: selectedTemplate?.name || 'Custom Assessment',
      });

      if (response.success) {
        // Parse the response into a structured assessment
        const assessment: GeneratedAssessment = {
          title: `${selectedTemplate?.name || 'Custom Assessment'} - ${assessmentSettings.topic}`,
          questions: [], // Would be parsed from response.data.content
          metadata: {
            template: selectedTemplate?.name || 'Custom',
            subject: assessmentSettings.subject,
            level: assessmentSettings.level,
            questionCount: assessmentSettings.questionCount,
            estimatedTime: assessmentSettings.timeLimit,
          }
        };
        
        setGeneratedAssessment(assessment);
      } else {
        throw new Error('Failed to generate assessment');
      }
    } catch (error: any) {
      console.error('Error generating assessment:', error);
      Alert.alert('Error', 'Failed to generate assessment. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAssessment = () => {
    Alert.alert(
      'Clear Assessment',
      'Are you sure you want to clear the generated assessment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setGeneratedAssessment(null);
            setSelectedTemplate(null);
            setAssessmentSettings({
              subject: '',
              level: '',
              topic: '',
              questionCount: 10,
              difficulty: 'medium',
              timeLimit: 30,
              includeAnswers: true,
              customPrompt: '',
            });
          }
        }
      ]
    );
  };

  const renderTemplateCard = (template: AssessmentTemplate) => (
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
        <View style={styles.templateInfo}>
          <Text style={styles.templateName}>{template.name}</Text>
          <Text style={styles.templateQuestionCount}>
            {template.defaultQuestions} questions • {template.defaultQuestions * 2}min
          </Text>
        </View>
      </View>
      <Text style={styles.templateDescription}>{template.description}</Text>
      
      <View style={styles.templateTags}>
        {template.questionTypes.slice(0, 2).map((type, index) => (
          <Badge 
            key={index}
            text={type.replace('_', ' ')} 
            variant="default" 
            size="small" 
          />
        ))}
        {template.questionTypes.length > 2 && (
          <Badge 
            text={`+${template.questionTypes.length - 2} more`} 
            variant="default" 
            size="small" 
          />
        )}
      </View>
    </Card>
  );

  const renderTemplateModal = () => (
    <Modal
      visible={showTemplateModal}
      onClose={() => setShowTemplateModal(false)}
      title="Choose Assessment Type"
      position="center"
    >
      <ScrollView style={styles.templateGrid} showsVerticalScrollIndicator={false}>
        {assessmentTemplates.map(renderTemplateCard)}
        
        <Card
          variant="outlined"
          touchable
          onPress={() => {
            setSelectedTemplate(null);
            setShowTemplateModal(false);
            setShowSettingsModal(true);
          }}
          style={styles.customTemplateCard}
        >
          <View style={styles.templateHeader}>
            <View style={[styles.templateIcon, { backgroundColor: COLORS.grey[200] }]}>
              <Ionicons name="create-outline" size={24} color={COLORS.grey[600]} />
            </View>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>Custom Assessment</Text>
              <Text style={styles.templateQuestionCount}>Your own format</Text>
            </View>
          </View>
          <Text style={styles.templateDescription}>
            Create a custom assessment with your own specifications
          </Text>
        </Card>
      </ScrollView>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      onClose={() => setShowSettingsModal(false)}
      title={selectedTemplate ? selectedTemplate.name : 'Custom Assessment'}
      position="bottom"
    >
      <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
        {/* Topic Input */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Topic *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter the topic for assessment"
            value={assessmentSettings.topic}
            onChangeText={(text) => setAssessmentSettings(prev => ({ ...prev, topic: text }))}
            multiline
          />
        </View>

        {/* Question Count */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Number of Questions</Text>
          <View style={styles.numberInputContainer}>
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => setAssessmentSettings(prev => ({ 
                ...prev, 
                questionCount: Math.max(1, prev.questionCount - 1) 
              }))}
            >
              <Ionicons name="remove" size={20} color={COLORS.primary[600]} />
            </TouchableOpacity>
            
            <Text style={styles.numberValue}>{assessmentSettings.questionCount}</Text>
            
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => setAssessmentSettings(prev => ({ 
                ...prev, 
                questionCount: Math.min(50, prev.questionCount + 1) 
              }))}
            >
              <Ionicons name="add" size={20} color={COLORS.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Difficulty Level */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Difficulty Level</Text>
          <View style={styles.optionsList}>
            {['easy', 'medium', 'hard'].map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.optionButton,
                  assessmentSettings.difficulty === difficulty && styles.optionButtonSelected
                ]}
                onPress={() => setAssessmentSettings(prev => ({ ...prev, difficulty }))}
              >
                <Text style={[
                  styles.optionText,
                  assessmentSettings.difficulty === difficulty && styles.optionTextSelected
                ]}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subject Selection */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Subject (Optional)</Text>
          <View style={styles.optionsList}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                !assessmentSettings.subject && styles.optionButtonSelected
              ]}
              onPress={() => setAssessmentSettings(prev => ({ ...prev, subject: '' }))}
            >
              <Text style={[
                styles.optionText,
                !assessmentSettings.subject && styles.optionTextSelected
              ]}>
                Any Subject
              </Text>
            </TouchableOpacity>
            {SUBJECTS.slice(0, 6).map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.optionButton,
                  assessmentSettings.subject === subject && styles.optionButtonSelected
                ]}
                onPress={() => setAssessmentSettings(prev => ({ ...prev, subject }))}
              >
                <Text style={[
                  styles.optionText,
                  assessmentSettings.subject === subject && styles.optionTextSelected
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
                !assessmentSettings.level && styles.optionButtonSelected
              ]}
              onPress={() => setAssessmentSettings(prev => ({ ...prev, level: '' }))}
            >
              <Text style={[
                styles.optionText,
                !assessmentSettings.level && styles.optionTextSelected
              ]}>
                Any Level
              </Text>
            </TouchableOpacity>
            {EDUCATION_LEVELS.slice(0, 6).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  assessmentSettings.level === level && styles.optionButtonSelected
                ]}
                onPress={() => setAssessmentSettings(prev => ({ ...prev, level }))}
              >
                <Text style={[
                  styles.optionText,
                  assessmentSettings.level === level && styles.optionTextSelected
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Include Answers Toggle */}
        <View style={styles.settingSection}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setAssessmentSettings(prev => ({ 
              ...prev, 
              includeAnswers: !prev.includeAnswers 
            }))}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.settingLabel}>Include Answer Key</Text>
              <Text style={styles.toggleDescription}>
                Generate answers and explanations
              </Text>
            </View>
            <View style={[
              styles.toggle,
              assessmentSettings.includeAnswers && styles.toggleActive
            ]}>
              {assessmentSettings.includeAnswers && (
                <Ionicons name="checkmark" size={16} color={COLORS.background.light} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Custom Prompt for non-template assessments */}
        {!selectedTemplate && (
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Custom Instructions</Text>
            <TextInput
              style={[styles.textInput, { height: 100 }]}
              placeholder="Enter specific instructions for the assessment..."
              value={assessmentSettings.customPrompt}
              onChangeText={(text) => setAssessmentSettings(prev => ({ ...prev, customPrompt: text }))}
              multiline
              textAlignVertical="top"
            />
          </View>
        )}

        <View style={styles.modalActions}>
          <Button
            title="Generate Assessment"
            onPress={() => {
              setShowSettingsModal(false);
              generateAssessment();
            }}
            fullWidth
            disabled={!assessmentSettings.topic.trim()}
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
          <Text style={styles.title}>Assessment Generator</Text>
          {selectedTemplate && (
            <Badge text={selectedTemplate.name} variant="warning" size="small" />
          )}
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowTemplateModal(true)}
          >
            <Ionicons name="add-outline" size={24} color={COLORS.background.light} />
          </TouchableOpacity>
          
          {generatedAssessment && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={clearAssessment}
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
            text="Generating assessment..."
            style={styles.loadingContainer}
          />
        ) : generatedAssessment ? (
          <View>
            {/* Assessment Header */}
            <Card variant="elevated" style={styles.assessmentHeader}>
              <Text style={styles.assessmentTitle}>{generatedAssessment.title}</Text>
              
              <View style={styles.assessmentMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="help-circle-outline" size={16} color={COLORS.primary[600]} />
                  <Text style={styles.metaText}>
                    {generatedAssessment.metadata.questionCount} questions
                  </Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color={COLORS.warning.main} />
                  <Text style={styles.metaText}>
                    ~{generatedAssessment.metadata.estimatedTime} minutes
                  </Text>
                </View>
                
                {generatedAssessment.metadata.subject && (
                  <Badge 
                    text={generatedAssessment.metadata.subject} 
                    variant="info" 
                    size="small" 
                  />
                )}
              </View>
            </Card>

            {/* Assessment Content Placeholder */}
            <Card variant="elevated" style={styles.assessmentContent}>
              <Text style={styles.contentPlaceholder}>
                Assessment content would be displayed here with generated questions, 
                options, and answer key based on the selected template and settings.
              </Text>
              
              <View style={styles.assessmentActions}>
                <Button
                  title="Regenerate"
                  onPress={generateAssessment}
                  variant="outline"
                  size="small"
                  icon="refresh-outline"
                />
                <Button
                  title="Edit Settings"
                  onPress={() => setShowSettingsModal(true)}
                  variant="outline"
                  size="small"
                  icon="create-outline"
                />
                <Button
                  title="Export"
                  onPress={() => Alert.alert('Export', 'Export functionality coming soon!')}
                  size="small"
                  icon="download-outline"
                />
              </View>
            </Card>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="school-outline"
                size={64}
                color={COLORS.grey[400]}
              />
            </View>
            <Text style={styles.emptyTitle}>No Assessment Generated</Text>
            <Text style={styles.emptySubtitle}>
              Choose an assessment template to create quizzes, tests, and practice exercises
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
    backgroundColor: COLORS.warning.main,
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
    maxHeight: 500,
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
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  templateQuestionCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  templateDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  templateTags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  numberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    borderWidth: 1,
    borderColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
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
    backgroundColor: COLORS.warning.light,
    borderColor: COLORS.warning.main,
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.warning.dark,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.grey[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.success.main,
  },
  modalActions: {
    marginTop: 16,
  },
  assessmentHeader: {
    marginBottom: 16,
  },
  assessmentTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  assessmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  assessmentContent: {
    marginBottom: 16,
  },
  contentPlaceholder: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  assessmentActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
});

export default AIAssessmentScreen;