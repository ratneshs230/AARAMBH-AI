import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../constants';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SearchBar } from '../components/common/SearchBar';
import { TabView } from '../components/common/TabView';
import { OfflineIndicator } from '../components/common/OfflineIndicator';
import { useOfflineApi } from '../hooks/useOffline';

interface Assessment {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'practice' | 'mock_test' | 'quiz' | 'assignment';
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  isAttempted: boolean;
  isFavorite: boolean;
  isPremium: boolean;
  createdBy: string;
  createdAt: string;
  attempts: {
    id: string;
    score: number;
    percentage: number;
    completedAt: string;
    timeTaken: number;
  }[];
  bestScore?: number;
  averageScore?: number;
  status: 'not_started' | 'in_progress' | 'completed';
  lastAttemptedAt?: string;
}

interface AssessmentFilters {
  subject: string;
  level: string;
  type: string;
  difficulty: string;
  status: 'all' | 'completed' | 'pending';
}

const SUBJECTS = [
  'All Subjects',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'History',
  'Geography',
  'Computer Science',
];

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const TYPES = ['All Types', 'practice', 'mock_test', 'quiz', 'assignment'];
const DIFFICULTIES = ['All Difficulties', 'Easy', 'Medium', 'Hard'];

export const AssessmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const { getAssessments, getFavoriteAssessments, isLoading } = useOfflineApi();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [favoriteAssessments, setFavoriteAssessments] = useState<Assessment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState<AssessmentFilters>({
    subject: 'All Subjects',
    level: 'All Levels',
    type: 'All Types',
    difficulty: 'All Difficulties',
    status: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const [allAssessmentsResponse, favoritesResponse] = await Promise.all([
        getAssessments(),
        getFavoriteAssessments(),
      ]);

      if (allAssessmentsResponse.data) {
        setAssessments(allAssessmentsResponse.data);
      } else {
        // Mock data for development
        setAssessments(mockAssessments);
      }

      if (favoritesResponse.data) {
        setFavoriteAssessments(favoritesResponse.data);
      } else {
        // Mock favorite assessments
        setFavoriteAssessments(mockAssessments.filter(a => a.isFavorite));
      }
    } catch (error) {
      console.error('Failed to load assessments:', error);
      setAssessments(mockAssessments);
      setFavoriteAssessments(mockAssessments.filter(a => a.isFavorite));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAssessments();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAssessmentPress = (assessment: Assessment) => {
    if (assessment.status === 'in_progress') {
      Alert.alert(
        'Resume Assessment',
        'You have an assessment in progress. Do you want to resume it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Resume', 
            onPress: () => navigation.navigate('AssessmentPlayer', { 
              assessmentId: assessment.id,
              mode: 'resume'
            })
          },
          { 
            text: 'Start Over', 
            onPress: () => navigation.navigate('AssessmentPlayer', { 
              assessmentId: assessment.id,
              mode: 'new'
            })
          }
        ]
      );
    } else {
      navigation.navigate('AssessmentDetails', { assessmentId: assessment.id });
    }
  };

  const handleStartAssessment = (assessment: Assessment) => {
    navigation.navigate('AssessmentPlayer', { 
      assessmentId: assessment.id,
      mode: 'new'
    });
  };

  const toggleFavorite = async (assessmentId: string) => {
    // Toggle favorite status
    setAssessments(prev => 
      prev.map(a => 
        a.id === assessmentId 
          ? { ...a, isFavorite: !a.isFavorite }
          : a
      )
    );
  };

  const filterAssessments = (assessmentList: Assessment[]) => {
    return assessmentList.filter(assessment => {
      const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           assessment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           assessment.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = filters.subject === 'All Subjects' || 
                            assessment.subject === filters.subject;
      
      const matchesLevel = filters.level === 'All Levels' || 
                          assessment.level === filters.level;
      
      const matchesType = filters.type === 'All Types' || 
                         assessment.type === filters.type;
      
      const matchesDifficulty = filters.difficulty === 'All Difficulties' || 
                               assessment.difficulty === filters.difficulty;
      
      const matchesStatus = filters.status === 'all' ||
                           (filters.status === 'completed' && assessment.status === 'completed') ||
                           (filters.status === 'pending' && assessment.status !== 'completed');

      return matchesSearch && matchesSubject && matchesLevel && matchesType && 
             matchesDifficulty && matchesStatus;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'play-circle';
      default:
        return 'ellipse-outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return COLORS.success.main;
      case 'in_progress':
        return COLORS.warning.main;
      default:
        return COLORS.grey[400];
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return COLORS.success.main;
      case 'Medium':
        return COLORS.warning.main;
      case 'Hard':
        return COLORS.error.main;
      default:
        return COLORS.grey[400];
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const renderAssessmentCard = (assessment: Assessment) => (
    <Card key={assessment.id} variant="elevated" style={styles.assessmentCard}>
      <TouchableOpacity onPress={() => handleAssessmentPress(assessment)}>
        <View style={styles.cardHeader}>
          <View style={styles.assessmentIcon}>
            <Ionicons 
              name={
                assessment.type === 'practice' ? 'fitness-outline' :
                assessment.type === 'mock_test' ? 'school-outline' :
                assessment.type === 'quiz' ? 'help-circle-outline' :
                'document-text-outline'
              } 
              size={24} 
              color={COLORS.primary[600]} 
            />
          </View>
          
          <View style={styles.assessmentInfo}>
            <Text style={styles.assessmentTitle} numberOfLines={2}>
              {assessment.title}
            </Text>
            <Text style={styles.assessmentSubject}>{assessment.subject}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(assessment.id)}
          >
            <Ionicons
              name={assessment.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={assessment.isFavorite ? COLORS.error.main : COLORS.grey[400]}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.assessmentDescription} numberOfLines={2}>
          {assessment.description}
        </Text>

        <View style={styles.assessmentMeta}>
          <Badge 
            text={assessment.level} 
            variant="outline" 
            size="small" 
          />
          <Badge 
            text={assessment.type.replace('_', ' ')} 
            variant="primary" 
            size="small" 
          />
          <Badge 
            text={assessment.difficulty} 
            variant="outline" 
            size="small"
            style={{ borderColor: getDifficultyColor(assessment.difficulty) }}
          />
          {assessment.isPremium && (
            <Badge text="Premium" variant="warning" size="small" />
          )}
        </View>

        <View style={styles.assessmentStats}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{formatDuration(assessment.duration)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="help-circle-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{assessment.totalQuestions} questions</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="trophy-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{assessment.totalMarks} marks</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons 
              name={getStatusIcon(assessment.status)} 
              size={16} 
              color={getStatusColor(assessment.status)} 
            />
            <Text style={[styles.statText, { color: getStatusColor(assessment.status) }]}>
              {assessment.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {assessment.isAttempted && assessment.bestScore !== undefined && (
          <View style={styles.scoreSection}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Best Score:</Text>
              <Text style={styles.scoreValue}>{assessment.bestScore}%</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Attempts:</Text>
              <Text style={styles.scoreValue}>{assessment.attempts.length}</Text>
            </View>
            {assessment.lastAttemptedAt && (
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Last Attempted:</Text>
                <Text style={styles.scoreValue}>
                  {new Date(assessment.lastAttemptedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.cardActions}>
          {assessment.status === 'in_progress' ? (
            <Button
              title="Resume"
              onPress={() => handleStartAssessment(assessment)}
              style={styles.actionButton}
              icon="play"
              variant="outline"
            />
          ) : assessment.status === 'completed' ? (
            <Button
              title="Retake"
              onPress={() => handleStartAssessment(assessment)}
              style={styles.actionButton}
              icon="refresh"
              variant="outline"
            />
          ) : (
            <Button
              title="Start Assessment"
              onPress={() => handleStartAssessment(assessment)}
              style={styles.actionButton}
              icon="play"
            />
          )}
          
          <Button
            title="View Details"
            onPress={() => handleAssessmentPress(assessment)}
            style={styles.detailsButton}
            variant="outline"
            size="small"
          />
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={styles.filterChip}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={16} color={COLORS.primary[600]} />
            <Text style={styles.filterChipText}>Filters</Text>
          </TouchableOpacity>
          
          {Object.entries(filters).map(([key, value]) => {
            if (value === 'all' || value.startsWith('All ') || value === '') {
              return null;
            }
            return (
              <View key={key} style={styles.activeFilter}>
                <Text style={styles.activeFilterText}>{value}</Text>
                <TouchableOpacity
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    [key]: key === 'subject' ? 'All Subjects' : 
                           key === 'level' ? 'All Levels' : 
                           key === 'type' ? 'All Types' :
                           key === 'difficulty' ? 'All Difficulties' : 'all'
                  }))}
                >
                  <Ionicons name="close" size={16} color={COLORS.primary[600]} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  const renderAllAssessments = () => {
    const filteredAssessments = filterAssessments(assessments);
    
    return (
      <ScrollView 
        style={styles.assessmentsList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredAssessments.length > 0 ? (
          filteredAssessments.map(renderAssessmentCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.grey[400]} />
            <Text style={styles.emptyStateTitle}>No assessments found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderFavoriteAssessments = () => {
    const filteredFavorites = filterAssessments(favoriteAssessments);
    
    return (
      <ScrollView 
        style={styles.assessmentsList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredFavorites.length > 0 ? (
          filteredFavorites.map(renderAssessmentCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={COLORS.grey[400]} />
            <Text style={styles.emptyStateTitle}>No favorite assessments</Text>
            <Text style={styles.emptyStateText}>
              Add assessments to favorites by tapping the heart icon
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderMyResults = () => {
    const attemptedAssessments = assessments.filter(a => a.isAttempted);
    
    return (
      <ScrollView 
        style={styles.assessmentsList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {attemptedAssessments.length > 0 ? (
          attemptedAssessments.map(assessment => (
            <Card key={assessment.id} variant="outlined" style={styles.resultCard}>
              <TouchableOpacity onPress={() => navigation.navigate('AssessmentResults', { assessmentId: assessment.id })}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>{assessment.title}</Text>
                  <Text style={styles.resultSubject}>{assessment.subject}</Text>
                </View>
                
                <View style={styles.resultStats}>
                  <View style={styles.resultStat}>
                    <Text style={styles.resultStatLabel}>Best Score</Text>
                    <Text style={styles.resultStatValue}>{assessment.bestScore}%</Text>
                  </View>
                  <View style={styles.resultStat}>
                    <Text style={styles.resultStatLabel}>Average</Text>
                    <Text style={styles.resultStatValue}>{assessment.averageScore}%</Text>
                  </View>
                  <View style={styles.resultStat}>
                    <Text style={styles.resultStatLabel}>Attempts</Text>
                    <Text style={styles.resultStatValue}>{assessment.attempts.length}</Text>
                  </View>
                </View>
                
                <View style={styles.resultProgress}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${assessment.bestScore}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{assessment.bestScore}%</Text>
                </View>
              </TouchableOpacity>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={64} color={COLORS.grey[400]} />
            <Text style={styles.emptyStateTitle}>No results yet</Text>
            <Text style={styles.emptyStateText}>
              Complete some assessments to see your results here
            </Text>
            <Button
              title="Browse Assessments"
              onPress={() => setActiveTab(0)}
              style={styles.browseButton}
            />
          </View>
        )}
      </ScrollView>
    );
  };

  const tabs = [
    {
      key: 'all',
      title: 'All',
      icon: 'library-outline',
      component: renderAllAssessments,
    },
    {
      key: 'favorites',
      title: 'Favorites',
      icon: 'heart-outline',
      component: renderFavoriteAssessments,
    },
    {
      key: 'results',
      title: 'My Results',
      icon: 'bar-chart-outline',
      component: renderMyResults,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Assessments</Text>
          <OfflineIndicator />
        </View>
        
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search assessments..."
          style={styles.searchBar}
        />
        
        {renderFilters()}
      </View>

      <TabView
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        style={styles.tabView}
      />
    </View>
  );
};

// Mock data for development
const mockAssessments: Assessment[] = [
  {
    id: '1',
    title: 'Mathematics Class 12 - Calculus Test',
    description: 'Comprehensive test covering limits, derivatives, and integrals with application problems.',
    subject: 'Mathematics',
    level: 'Intermediate',
    type: 'mock_test',
    duration: 180,
    totalQuestions: 50,
    totalMarks: 100,
    difficulty: 'Medium',
    tags: ['Calculus', 'JEE', 'CBSE'],
    isAttempted: true,
    isFavorite: true,
    isPremium: true,
    createdBy: 'Dr. Rajesh Kumar',
    createdAt: '2024-01-10',
    attempts: [
      { id: '1', score: 85, percentage: 85, completedAt: '2024-01-15', timeTaken: 150 },
      { id: '2', score: 92, percentage: 92, completedAt: '2024-01-20', timeTaken: 145 },
    ],
    bestScore: 92,
    averageScore: 88.5,
    status: 'completed',
    lastAttemptedAt: '2024-01-20',
  },
  {
    id: '2',
    title: 'Physics - Motion and Force',
    description: 'Quick quiz on Newton\'s laws of motion and their applications in daily life.',
    subject: 'Physics',
    level: 'Beginner',
    type: 'quiz',
    duration: 30,
    totalQuestions: 15,
    totalMarks: 30,
    difficulty: 'Easy',
    tags: ['Motion', 'Force', 'Newton\'s Laws'],
    isAttempted: false,
    isFavorite: false,
    isPremium: false,
    createdBy: 'Prof. Anita Sharma',
    createdAt: '2024-01-12',
    attempts: [],
    status: 'not_started',
  },
  {
    id: '3',
    title: 'English Grammar Practice',
    description: 'Practice test for improving grammar skills including tenses, prepositions, and sentence structure.',
    subject: 'English',
    level: 'Intermediate',
    type: 'practice',
    duration: 60,
    totalQuestions: 25,
    totalMarks: 50,
    difficulty: 'Medium',
    tags: ['Grammar', 'Tenses', 'Writing'],
    isAttempted: true,
    isFavorite: true,
    isPremium: false,
    createdBy: 'Ms. Priya Verma',
    createdAt: '2024-01-08',
    attempts: [
      { id: '1', score: 42, percentage: 84, completedAt: '2024-01-14', timeTaken: 55 },
    ],
    bestScore: 84,
    averageScore: 84,
    status: 'completed',
    lastAttemptedAt: '2024-01-14',
  },
  {
    id: '4',
    title: 'Chemistry - Organic Compounds',
    description: 'Advanced assessment on organic chemistry covering nomenclature, reactions, and mechanisms.',
    subject: 'Chemistry',
    level: 'Advanced',
    type: 'assignment',
    duration: 240,
    totalQuestions: 35,
    totalMarks: 80,
    difficulty: 'Hard',
    tags: ['Organic Chemistry', 'NEET', 'JEE'],
    isAttempted: false,
    isFavorite: false,
    isPremium: true,
    createdBy: 'Dr. Meera Singh',
    createdAt: '2024-01-05',
    attempts: [],
    status: 'in_progress',
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.main,
  },
  header: {
    backgroundColor: COLORS.background.light,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    elevation: 2,
    shadowColor: COLORS.grey[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  searchBar: {
    marginBottom: 12,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[600],
    fontWeight: '500',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[600],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeFilterText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.background.light,
    fontWeight: '500',
  },
  tabView: {
    flex: 1,
  },
  assessmentsList: {
    flex: 1,
    padding: 16,
  },
  assessmentCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assessmentIcon: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primary.light,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  assessmentSubject: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  favoriteButton: {
    padding: 4,
  },
  assessmentDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  assessmentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  assessmentStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.main,
    padding: 12,
    borderRadius: DIMENSIONS.BORDER_RADIUS / 2,
    marginBottom: 12,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 2,
  },
  detailsButton: {
    flex: 1,
  },
  resultCard: {
    marginBottom: 12,
  },
  resultHeader: {
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  resultSubject: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  resultStat: {
    alignItems: 'center',
  },
  resultStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  resultStatValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  resultProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.grey[200],
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary[600],
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  browseButton: {
    minWidth: 140,
  },
});

export default AssessmentScreen;