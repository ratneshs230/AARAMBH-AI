import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
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

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  subjects: string[];
  thumbnail: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  rating: number;
  enrolledStudents: number;
  price: number;
  isPremium: boolean;
  isEnrolled: boolean;
  lastAccessed?: string;
  estimatedCompletion: string;
  tags: string[];
  syllabus: {
    id: string;
    title: string;
    lessons: number;
    duration: string;
    isCompleted: boolean;
  }[];
}

interface CourseFilters {
  category: string;
  level: string;
  subject: string;
  price: 'all' | 'free' | 'premium';
  enrolled: 'all' | 'enrolled' | 'available';
}

const CATEGORIES = [
  'All Categories',
  'Mathematics',
  'Science',
  'Languages',
  'Social Studies',
  'Computer Science',
  'Arts',
  'Competitive Exams',
];

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

export const CourseScreen: React.FC = () => {
  const navigation = useNavigation();
  const { getCourses, getEnrolledCourses, isLoading } = useOfflineApi();

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState<CourseFilters>({
    category: 'All Categories',
    level: 'All Levels',
    subject: '',
    price: 'all',
    enrolled: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const [allCoursesResponse, enrolledResponse] = await Promise.all([
        getCourses(),
        getEnrolledCourses(),
      ]);

      if (allCoursesResponse.data) {
        setCourses(allCoursesResponse.data);
      } else {
        // Mock data for development
        setCourses(mockCourses);
      }

      if (enrolledResponse.data) {
        setEnrolledCourses(enrolledResponse.data);
      } else {
        // Mock enrolled courses
        setEnrolledCourses(mockCourses.filter(c => c.isEnrolled));
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      setCourses(mockCourses);
      setEnrolledCourses(mockCourses.filter(c => c.isEnrolled));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCoursePress = (course: Course) => {
    navigation.navigate('CourseDetails', { courseId: course.id });
  };

  const handleEnrollPress = (course: Course) => {
    navigation.navigate('CourseEnrollment', { courseId: course.id });
  };

  const filterCourses = (courseList: Course[]) => {
    return courseList.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filters.category === 'All Categories' || 
                             course.category === filters.category;
      
      const matchesLevel = filters.level === 'All Levels' || 
                          course.level === filters.level;
      
      const matchesPrice = filters.price === 'all' ||
                          (filters.price === 'free' && !course.isPremium) ||
                          (filters.price === 'premium' && course.isPremium);
      
      const matchesEnrolled = filters.enrolled === 'all' ||
                             (filters.enrolled === 'enrolled' && course.isEnrolled) ||
                             (filters.enrolled === 'available' && !course.isEnrolled);

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesEnrolled;
    });
  };

  const renderCourseCard = (course: Course) => (
    <Card key={course.id} variant="elevated" style={styles.courseCard}>
      <TouchableOpacity onPress={() => handleCoursePress(course)}>
        <View style={styles.courseHeader}>
          <View style={styles.courseThumbnail}>
            <Ionicons name="book-outline" size={32} color={COLORS.primary[600]} />
          </View>
          
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle} numberOfLines={2}>
              {course.title}
            </Text>
            <Text style={styles.courseInstructor}>by {course.instructor}</Text>
            
            <View style={styles.courseMeta}>
              <Badge 
                text={course.level} 
                variant={course.level === 'Beginner' ? 'success' : 
                        course.level === 'Intermediate' ? 'warning' : 'error'} 
                size="small" 
              />
              <Badge 
                text={course.category} 
                variant="primary" 
                size="small" 
              />
              {course.isPremium && (
                <Badge text="Premium" variant="warning" size="small" />
              )}
            </View>
          </View>
        </View>

        <Text style={styles.courseDescription} numberOfLines={2}>
          {course.description}
        </Text>

        <View style={styles.courseStats}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{course.duration}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="book-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{course.totalLessons} lessons</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color={COLORS.warning.main} />
            <Text style={styles.statText}>{course.rating.toFixed(1)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{course.enrolledStudents}</Text>
          </View>
        </View>

        {course.isEnrolled && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Progress: {course.completedLessons}/{course.totalLessons} lessons
              </Text>
              <Text style={styles.progressPercentage}>{course.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${course.progress}%` }]} 
              />
            </View>
          </View>
        )}

        <View style={styles.courseActions}>
          {course.isEnrolled ? (
            <Button
              title="Continue Learning"
              onPress={() => handleCoursePress(course)}
              style={styles.actionButton}
              icon="play-outline"
            />
          ) : (
            <View style={styles.enrollSection}>
              <View style={styles.priceSection}>
                {course.isPremium ? (
                  <Text style={styles.price}>₹{course.price}</Text>
                ) : (
                  <Text style={styles.freePrice}>Free</Text>
                )}
              </View>
              <Button
                title="Enroll Now"
                onPress={() => handleEnrollPress(course)}
                style={styles.enrollButton}
                variant={course.isPremium ? 'primary' : 'outline'}
              />
            </View>
          )}
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
            if (value === 'all' || value === 'All Categories' || value === 'All Levels' || value === '') {
              return null;
            }
            return (
              <View key={key} style={styles.activeFilter}>
                <Text style={styles.activeFilterText}>{value}</Text>
                <TouchableOpacity
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    [key]: key === 'category' ? 'All Categories' : 
                           key === 'level' ? 'All Levels' : 
                           key === 'subject' ? '' : 'all'
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

  const renderAllCourses = () => {
    const filteredCourses = filterCourses(courses);
    
    return (
      <ScrollView 
        style={styles.coursesList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredCourses.length > 0 ? (
          filteredCourses.map(renderCourseCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={COLORS.grey[400]} />
            <Text style={styles.emptyStateTitle}>No courses found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderEnrolledCourses = () => {
    const filteredCourses = filterCourses(enrolledCourses);
    
    return (
      <ScrollView 
        style={styles.coursesList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredCourses.length > 0 ? (
          filteredCourses.map(renderCourseCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={64} color={COLORS.grey[400]} />
            <Text style={styles.emptyStateTitle}>No enrolled courses</Text>
            <Text style={styles.emptyStateText}>
              Browse our catalog and enroll in courses to start learning
            </Text>
            <Button
              title="Browse Courses"
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
      title: 'All Courses',
      icon: 'library-outline',
      component: renderAllCourses,
    },
    {
      key: 'enrolled',
      title: 'My Courses',
      icon: 'bookmark-outline',
      component: renderEnrolledCourses,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Courses</Text>
          <OfflineIndicator />
        </View>
        
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search courses..."
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
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete Mathematics for Class 12',
    description: 'Comprehensive mathematics course covering calculus, algebra, trigonometry, and more for Class 12 students.',
    instructor: 'Dr. Rajesh Kumar',
    duration: '120 hours',
    level: 'Intermediate',
    category: 'Mathematics',
    subjects: ['Calculus', 'Algebra', 'Trigonometry'],
    thumbnail: '',
    progress: 65,
    totalLessons: 150,
    completedLessons: 98,
    rating: 4.8,
    enrolledStudents: 15420,
    price: 2999,
    isPremium: true,
    isEnrolled: true,
    lastAccessed: '2024-01-15',
    estimatedCompletion: '3 months',
    tags: ['CBSE', 'JEE', 'NEET'],
    syllabus: [
      { id: '1', title: 'Relations and Functions', lessons: 12, duration: '8 hours', isCompleted: true },
      { id: '2', title: 'Inverse Trigonometric Functions', lessons: 8, duration: '6 hours', isCompleted: true },
      { id: '3', title: 'Matrices', lessons: 15, duration: '10 hours', isCompleted: false },
    ],
  },
  {
    id: '2',
    title: 'Physics Fundamentals',
    description: 'Basic physics concepts for beginners including mechanics, thermodynamics, and electromagnetism.',
    instructor: 'Prof. Anita Sharma',
    duration: '80 hours',
    level: 'Beginner',
    category: 'Science',
    subjects: ['Mechanics', 'Thermodynamics', 'Electromagnetism'],
    thumbnail: '',
    progress: 0,
    totalLessons: 100,
    completedLessons: 0,
    rating: 4.6,
    enrolledStudents: 8750,
    price: 0,
    isPremium: false,
    isEnrolled: false,
    estimatedCompletion: '2 months',
    tags: ['NCERT', 'Foundation'],
    syllabus: [
      { id: '1', title: 'Motion in a Straight Line', lessons: 10, duration: '6 hours', isCompleted: false },
      { id: '2', title: 'Motion in a Plane', lessons: 12, duration: '8 hours', isCompleted: false },
      { id: '3', title: 'Laws of Motion', lessons: 15, duration: '10 hours', isCompleted: false },
    ],
  },
  {
    id: '3',
    title: 'English Grammar Mastery',
    description: 'Improve your English grammar skills with comprehensive lessons and practice exercises.',
    instructor: 'Ms. Priya Verma',
    duration: '60 hours',
    level: 'Intermediate',
    category: 'Languages',
    subjects: ['Grammar', 'Vocabulary', 'Writing'],
    thumbnail: '',
    progress: 30,
    totalLessons: 80,
    completedLessons: 24,
    rating: 4.7,
    enrolledStudents: 12340,
    price: 1999,
    isPremium: true,
    isEnrolled: true,
    lastAccessed: '2024-01-14',
    estimatedCompletion: '6 weeks',
    tags: ['Communication', 'Writing Skills'],
    syllabus: [
      { id: '1', title: 'Parts of Speech', lessons: 20, duration: '15 hours', isCompleted: true },
      { id: '2', title: 'Tenses', lessons: 25, duration: '18 hours', isCompleted: false },
      { id: '3', title: 'Sentence Structure', lessons: 15, duration: '12 hours', isCompleted: false },
    ],
  },
  {
    id: '4',
    title: 'Computer Science Basics',
    description: 'Introduction to programming, algorithms, and computer science fundamentals.',
    instructor: 'Mr. Amit Gupta',
    duration: '100 hours',
    level: 'Beginner',
    category: 'Computer Science',
    subjects: ['Programming', 'Algorithms', 'Data Structures'],
    thumbnail: '',
    progress: 0,
    totalLessons: 120,
    completedLessons: 0,
    rating: 4.9,
    enrolledStudents: 25680,
    price: 0,
    isPremium: false,
    isEnrolled: false,
    estimatedCompletion: '4 months',
    tags: ['Python', 'Programming', 'Logic'],
    syllabus: [
      { id: '1', title: 'Introduction to Programming', lessons: 15, duration: '10 hours', isCompleted: false },
      { id: '2', title: 'Variables and Data Types', lessons: 12, duration: '8 hours', isCompleted: false },
      { id: '3', title: 'Control Structures', lessons: 18, duration: '12 hours', isCompleted: false },
    ],
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
  coursesList: {
    flex: 1,
    padding: 16,
  },
  courseCard: {
    marginBottom: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  courseThumbnail: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary.light,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  courseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  courseDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  courseStats: {
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
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  progressPercentage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.grey[200],
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary[600],
    borderRadius: 3,
  },
  courseActions: {
    marginTop: 12,
  },
  actionButton: {
    width: '100%',
  },
  enrollSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceSection: {
    flex: 1,
  },
  price: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.success.main,
  },
  freePrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  enrollButton: {
    flex: 1,
    marginLeft: 12,
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

export default CourseScreen;