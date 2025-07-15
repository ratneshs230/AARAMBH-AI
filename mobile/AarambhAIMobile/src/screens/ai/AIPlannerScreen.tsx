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
import { COLORS, FONT_SIZES, DIMENSIONS, SUBJECTS } from '../../constants';

interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  duration: string;
  features: string[];
}

const planTemplates: PlanTemplate[] = [
  {
    id: 'daily_schedule',
    name: 'Daily Study Schedule',
    description: 'Organize your daily study routine with time blocks',
    icon: 'today-outline',
    color: COLORS.primary[500],
    duration: '1 day',
    features: ['Time blocking', 'Subject rotation', 'Break planning', 'Task prioritization']
  },
  {
    id: 'weekly_plan',
    name: 'Weekly Study Plan',
    description: 'Comprehensive weekly study plan with goals',
    icon: 'calendar-outline',
    color: COLORS.secondary[500],
    duration: '7 days',
    features: ['Weekly goals', 'Progress tracking', 'Review sessions', 'Flexibility']
  },
  {
    id: 'exam_preparation',
    name: 'Exam Preparation',
    description: 'Focused exam preparation with countdown timeline',
    icon: 'school-outline',
    color: COLORS.warning.main,
    duration: 'Custom',
    features: ['Exam countdown', 'Revision schedule', 'Mock tests', 'Stress management']
  },
  {
    id: 'monthly_planner',
    name: 'Monthly Planner',
    description: 'Long-term study goals with milestone tracking',
    icon: 'calendar-number-outline',
    color: COLORS.success.main,
    duration: '30 days',
    features: ['Monthly goals', 'Milestone tracking', 'Habit building', 'Progress review']
  },
  {
    id: 'subject_intensive',
    name: 'Subject Intensive',
    description: 'Deep focus plan for specific subject mastery',
    icon: 'library-outline',
    color: COLORS.error.main,
    duration: 'Flexible',
    features: ['Subject focus', 'Skill building', 'Practice sessions', 'Assessment']
  },
  {
    id: 'balanced_routine',
    name: 'Balanced Routine',
    description: 'Holistic plan balancing studies with other activities',
    icon: 'fitness-outline',
    color: COLORS.primary[700],
    duration: 'Ongoing',
    features: ['Work-life balance', 'Extracurriculars', 'Rest periods', 'Health focus']
  }
];

interface GeneratedPlan {
  title: string;
  schedule: any[];
  metadata: {
    template: string;
    duration: string;
    subjects: string[];
    totalHours: number;
    startDate: string;
  };
}

const AIPlannerScreen: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  
  const [planSettings, setPlanSettings] = useState({
    subjects: [] as string[],
    duration: '1 week',
    dailyHours: 4,
    examDate: '',
    goals: '',
    preferences: {
      studyTime: 'morning',
      breakDuration: 15,
      sessionLength: 60,
      weekends: true,
    },
    customPrompt: '',
  });

  const handleTemplateSelect = (template: PlanTemplate) => {
    setSelectedTemplate(template);
    setPlanSettings(prev => ({
      ...prev,
      duration: template.duration === 'Custom' ? prev.duration : template.duration,
    }));
    setShowTemplateModal(false);
    setShowSettingsModal(true);
  };

  const generatePlan = async () => {
    if (planSettings.subjects.length === 0) {
      Alert.alert('Error', 'Please select at least one subject');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Build the prompt based on template and settings
      let prompt = planSettings.customPrompt;
      
      if (selectedTemplate && !prompt) {
        prompt = `Create a ${selectedTemplate.name.toLowerCase()} for the following subjects: ${planSettings.subjects.join(', ')}. `;
        prompt += `Duration: ${planSettings.duration}. `;
        prompt += `Daily study time: ${planSettings.dailyHours} hours. `;
        prompt += `Preferred study time: ${planSettings.preferences.studyTime}. `;
        prompt += `Study session length: ${planSettings.preferences.sessionLength} minutes with ${planSettings.preferences.breakDuration}-minute breaks. `;
        
        if (planSettings.examDate) {
          prompt += `Important exam date: ${planSettings.examDate}. `;
        }
        
        if (planSettings.goals) {
          prompt += `Goals: ${planSettings.goals}. `;
        }
        
        if (!planSettings.preferences.weekends) {
          prompt += 'Exclude weekends from the study schedule. ';
        }
        
        // Add template-specific instructions
        switch (selectedTemplate.id) {
          case 'daily_schedule':
            prompt += 'Create a detailed hourly schedule with specific time slots for each subject and activity.';
            break;
          case 'weekly_plan':
            prompt += 'Organize by days of the week with daily goals and weekly objectives.';
            break;
          case 'exam_preparation':
            prompt += 'Focus on revision strategies, mock tests, and countdown milestones.';
            break;
          case 'monthly_planner':
            prompt += 'Break down into weekly phases with monthly milestones and progress checkpoints.';
            break;
          case 'subject_intensive':
            prompt += 'Create an intensive study plan focusing on mastering the selected subjects with practice and assessment.';
            break;
          case 'balanced_routine':
            prompt += 'Include time for rest, extracurricular activities, and maintaining work-life balance.';
            break;
        }
      }

      const response = await aiService.createStudyPlan(prompt, {
        subjects: planSettings.subjects,
        duration: planSettings.duration,
        examDate: planSettings.examDate || undefined,
      });

      if (response.success) {
        // Parse the response into a structured plan
        const plan: GeneratedPlan = {
          title: `${selectedTemplate?.name || 'Custom Plan'} - ${planSettings.subjects.join(', ')}`,
          schedule: [], // Would be parsed from response.data.content
          metadata: {
            template: selectedTemplate?.name || 'Custom',
            duration: planSettings.duration,
            subjects: planSettings.subjects,
            totalHours: planSettings.dailyHours * 7, // Weekly estimate
            startDate: new Date().toISOString().split('T')[0],
          }
        };
        
        setGeneratedPlan(plan);
      } else {
        throw new Error('Failed to generate study plan');
      }
    } catch (error: any) {
      console.error('Error generating study plan:', error);
      Alert.alert('Error', 'Failed to generate study plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearPlan = () => {
    Alert.alert(
      'Clear Plan',
      'Are you sure you want to clear the generated study plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setGeneratedPlan(null);
            setSelectedTemplate(null);
            setPlanSettings({
              subjects: [],
              duration: '1 week',
              dailyHours: 4,
              examDate: '',
              goals: '',
              preferences: {
                studyTime: 'morning',
                breakDuration: 15,
                sessionLength: 60,
                weekends: true,
              },
              customPrompt: '',
            });
          }
        }
      ]
    );
  };

  const toggleSubject = (subject: string) => {
    setPlanSettings(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const renderTemplateCard = (template: PlanTemplate) => (
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
          <Text style={styles.templateDuration}>Duration: {template.duration}</Text>
        </View>
      </View>
      <Text style={styles.templateDescription}>{template.description}</Text>
      
      <View style={styles.templateFeatures}>
        {template.features.slice(0, 3).map((feature, index) => (
          <Badge 
            key={index}
            text={feature} 
            variant="default" 
            size="small" 
          />
        ))}
        {template.features.length > 3 && (
          <Badge 
            text={`+${template.features.length - 3} more`} 
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
      title="Choose Study Plan Type"
      position="center"
    >
      <ScrollView style={styles.templateGrid} showsVerticalScrollIndicator={false}>
        {planTemplates.map(renderTemplateCard)}
        
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
              <Text style={styles.templateName}>Custom Plan</Text>
              <Text style={styles.templateDuration}>Your specifications</Text>
            </View>
          </View>
          <Text style={styles.templateDescription}>
            Create a custom study plan with your own requirements
          </Text>
        </Card>
      </ScrollView>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettingsModal}
      onClose={() => setShowSettingsModal(false)}
      title={selectedTemplate ? selectedTemplate.name : 'Custom Plan'}
      position="bottom"
    >
      <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
        {/* Subject Selection */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Subjects *</Text>
          <Text style={styles.settingDescription}>Select subjects to include in your study plan</Text>
          <View style={styles.subjectGrid}>
            {SUBJECTS.map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.subjectButton,
                  planSettings.subjects.includes(subject) && styles.subjectButtonSelected
                ]}
                onPress={() => toggleSubject(subject)}
              >
                <Text style={[
                  styles.subjectText,
                  planSettings.subjects.includes(subject) && styles.subjectTextSelected
                ]}>
                  {subject}
                </Text>
                {planSettings.subjects.includes(subject) && (
                  <Ionicons name="checkmark" size={16} color={COLORS.primary[600]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Duration */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Plan Duration</Text>
          <View style={styles.optionsList}>
            {['1 day', '1 week', '2 weeks', '1 month', '3 months'].map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.optionButton,
                  planSettings.duration === duration && styles.optionButtonSelected
                ]}
                onPress={() => setPlanSettings(prev => ({ ...prev, duration }))}
              >
                <Text style={[
                  styles.optionText,
                  planSettings.duration === duration && styles.optionTextSelected
                ]}>
                  {duration}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Study Hours */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Daily Study Hours</Text>
          <View style={styles.numberInputContainer}>
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => setPlanSettings(prev => ({ 
                ...prev, 
                dailyHours: Math.max(1, prev.dailyHours - 1) 
              }))}
            >
              <Ionicons name="remove" size={20} color={COLORS.primary[600]} />
            </TouchableOpacity>
            
            <Text style={styles.numberValue}>{planSettings.dailyHours} hours</Text>
            
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => setPlanSettings(prev => ({ 
                ...prev, 
                dailyHours: Math.min(12, prev.dailyHours + 1) 
              }))}
            >
              <Ionicons name="add" size={20} color={COLORS.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Study Time Preference */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Preferred Study Time</Text>
          <View style={styles.optionsList}>
            {['morning', 'afternoon', 'evening', 'flexible'].map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.optionButton,
                  planSettings.preferences.studyTime === time && styles.optionButtonSelected
                ]}
                onPress={() => setPlanSettings(prev => ({ 
                  ...prev, 
                  preferences: { ...prev.preferences, studyTime: time } 
                }))}
              >
                <Text style={[
                  styles.optionText,
                  planSettings.preferences.studyTime === time && styles.optionTextSelected
                ]}>
                  {time.charAt(0).toUpperCase() + time.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Exam Date (Optional) */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Exam Date (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD (e.g., 2024-06-15)"
            value={planSettings.examDate}
            onChangeText={(text) => setPlanSettings(prev => ({ ...prev, examDate: text }))}
          />
        </View>

        {/* Goals */}
        <View style={styles.settingSection}>
          <Text style={styles.settingLabel}>Study Goals (Optional)</Text>
          <TextInput
            style={[styles.textInput, { height: 80 }]}
            placeholder="Describe your study goals and objectives..."
            value={planSettings.goals}
            onChangeText={(text) => setPlanSettings(prev => ({ ...prev, goals: text }))}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Include Weekends Toggle */}
        <View style={styles.settingSection}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setPlanSettings(prev => ({ 
              ...prev, 
              preferences: { 
                ...prev.preferences, 
                weekends: !prev.preferences.weekends 
              } 
            }))}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.settingLabel}>Include Weekends</Text>
              <Text style={styles.toggleDescription}>
                Add study sessions on weekends
              </Text>
            </View>
            <View style={[
              styles.toggle,
              planSettings.preferences.weekends && styles.toggleActive
            ]}>
              {planSettings.preferences.weekends && (
                <Ionicons name="checkmark" size={16} color={COLORS.background.light} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Custom Prompt for non-template plans */}
        {!selectedTemplate && (
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Custom Instructions</Text>
            <TextInput
              style={[styles.textInput, { height: 100 }]}
              placeholder="Enter specific instructions for your study plan..."
              value={planSettings.customPrompt}
              onChangeText={(text) => setPlanSettings(prev => ({ ...prev, customPrompt: text }))}
              multiline
              textAlignVertical="top"
            />
          </View>
        )}

        <View style={styles.modalActions}>
          <Button
            title="Generate Plan"
            onPress={() => {
              setShowSettingsModal(false);
              generatePlan();
            }}
            fullWidth
            disabled={planSettings.subjects.length === 0}
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
          <Text style={styles.title}>Study Planner</Text>
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
          
          {generatedPlan && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={clearPlan}
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
            text="Creating your study plan..."
            style={styles.loadingContainer}
          />
        ) : generatedPlan ? (
          <View>
            {/* Plan Header */}
            <Card variant="elevated" style={styles.planHeader}>
              <Text style={styles.planTitle}>{generatedPlan.title}</Text>
              
              <View style={styles.planMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.primary[600]} />
                  <Text style={styles.metaText}>{generatedPlan.metadata.duration}</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color={COLORS.warning.main} />
                  <Text style={styles.metaText}>
                    {generatedPlan.metadata.totalHours}h total
                  </Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Ionicons name="library-outline" size={16} color={COLORS.success.main} />
                  <Text style={styles.metaText}>
                    {generatedPlan.metadata.subjects.length} subjects
                  </Text>
                </View>
              </View>

              <View style={styles.subjectBadges}>
                {generatedPlan.metadata.subjects.map((subject, index) => (
                  <Badge 
                    key={index}
                    text={subject} 
                    variant="info" 
                    size="small" 
                  />
                ))}
              </View>
            </Card>

            {/* Plan Content Placeholder */}
            <Card variant="elevated" style={styles.planContent}>
              <Text style={styles.contentPlaceholder}>
                Your personalized study plan would be displayed here with detailed schedules, 
                time blocks, goals, and milestones based on your selected template and preferences.
              </Text>
              
              <View style={styles.planActions}>
                <Button
                  title="Regenerate"
                  onPress={generatePlan}
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
                name="calendar-outline"
                size={64}
                color={COLORS.grey[400]}
              />
            </View>
            <Text style={styles.emptyTitle}>No Study Plan Created</Text>
            <Text style={styles.emptySubtitle}>
              Create a personalized study plan to organize your learning schedule and achieve your goals
            </Text>
            
            <Button
              title="Create Plan"
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
  templateDuration: {
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
  templateFeatures: {
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
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
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
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectButton: {
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
  subjectButtonSelected: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[600],
  },
  subjectText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  subjectTextSelected: {
    color: COLORS.primary[600],
    fontWeight: '600',
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
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginHorizontal: 20,
    minWidth: 80,
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
  planHeader: {
    marginBottom: 16,
  },
  planTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 12,
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
  subjectBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  planContent: {
    marginBottom: 16,
  },
  contentPlaceholder: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  planActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
});

export default AIPlannerScreen;