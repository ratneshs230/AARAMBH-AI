import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../constants';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TabView } from '../components/common/TabView';
import { OfflineIndicator } from '../components/common/OfflineIndicator';
import { useOfflineApi } from '../hooks/useOffline';

const { width } = Dimensions.get('window');

interface CourseDetails {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    bio: string;
    rating: number;
    students: number;
    avatar?: string;
  };
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
  whatYouWillLearn: string[];
  requirements: string[];
  syllabus: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      duration: string;
      type: 'video' | 'text' | 'quiz' | 'assignment';
      isCompleted: boolean;
      isLocked: boolean;
    }[];
    duration: string;
    isCompleted: boolean;
  }[];
  reviews: {
    id: string;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export const CourseDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params as { courseId: string };
  const { getCourseDetails, enrollInCourse, isLoading } = useOfflineApi();

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      const response = await getCourseDetails(courseId);
      if (response.data) {
        setCourse(response.data);
      } else {
        // Mock data for development
        setCourse(mockCourseDetails);
      }
    } catch (error) {
      console.error('Failed to load course details:', error);
      setCourse(mockCourseDetails);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;

    try {
      if (course.isPremium) {
        // Navigate to payment screen
        navigation.navigate('CoursePayment', { 
          courseId: course.id,
          price: course.price,
          title: course.title 
        });
      } else {
        const response = await enrollInCourse(course.id);
        if (response.success) {
          setCourse(prev => prev ? { ...prev, isEnrolled: true } : null);
          Alert.alert('Success', 'You have successfully enrolled in this course!');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to enroll in course. Please try again.');
    }
  };

  const handleStartLearning = () => {
    if (!course) return;
    navigation.navigate('LessonPlayer', { 
      courseId: course.id,
      lessonId: getNextLessonId()
    });
  };

  const getNextLessonId = (): string => {
    if (!course) return '';
    
    for (const section of course.syllabus) {
      for (const lesson of section.lessons) {
        if (!lesson.isCompleted && !lesson.isLocked) {
          return lesson.id;
        }
      }
    }
    return course.syllabus[0]?.lessons[0]?.id || '';
  };

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const renderOverview = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About this course</Text>
        <Text style={styles.description}>{course?.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What you'll learn</Text>
        {course?.whatYouWillLearn.map((item, index) => (
          <View key={index} style={styles.learningItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success.main} />
            <Text style={styles.learningText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requirements</Text>
        {course?.requirements.map((requirement, index) => (
          <View key={index} style={styles.requirementItem}>
            <Ionicons name="ellipse-outline" size={8} color={COLORS.text.secondary} />
            <Text style={styles.requirementText}>{requirement}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructor</Text>
        <View style={styles.instructorCard}>
          <View style={styles.instructorAvatar}>
            <Ionicons name="person" size={32} color={COLORS.primary[600]} />
          </View>
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>{course?.instructor.name}</Text>
            <Text style={styles.instructorBio}>{course?.instructor.bio}</Text>
            <View style={styles.instructorStats}>
              <View style={styles.instructorStat}>
                <Ionicons name="star" size={16} color={COLORS.warning.main} />
                <Text style={styles.instructorStatText}>
                  {course?.instructor.rating.toFixed(1)} rating
                </Text>
              </View>
              <View style={styles.instructorStat}>
                <Ionicons name="people-outline" size={16} color={COLORS.text.secondary} />
                <Text style={styles.instructorStatText}>
                  {course?.instructor.students.toLocaleString()} students
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderSyllabus = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.syllabusHeader}>
        <Text style={styles.syllabusTitle}>Course Content</Text>
        <Text style={styles.syllabusSubtitle}>
          {course?.syllabus.length} sections • {course?.totalLessons} lessons • {course?.duration}
        </Text>
      </View>

      {course?.syllabus.map((section) => (
        <Card key={section.id} variant="outlined" style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSectionExpansion(section.id)}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name={expandedSections.has(section.id) ? 'chevron-down' : 'chevron-forward'}
                size={20}
                color={COLORS.text.secondary}
              />
              <Text style={styles.sectionName}>{section.title}</Text>
              {section.isCompleted && (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success.main} />
              )}
            </View>
            <Text style={styles.sectionMeta}>
              {section.lessons.length} lessons • {section.duration}
            </Text>
          </TouchableOpacity>

          {expandedSections.has(section.id) && (
            <View style={styles.lessonsList}>
              {section.lessons.map((lesson) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={[styles.lessonItem, lesson.isLocked && styles.lessonLocked]}
                  onPress={() => {
                    if (!lesson.isLocked && course?.isEnrolled) {
                      navigation.navigate('LessonPlayer', {
                        courseId: course.id,
                        lessonId: lesson.id
                      });
                    }
                  }}
                  disabled={lesson.isLocked || !course?.isEnrolled}
                >
                  <View style={styles.lessonContent}>
                    <View style={styles.lessonIcon}>
                      {lesson.isCompleted ? (
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.success.main} />
                      ) : lesson.isLocked ? (
                        <Ionicons name="lock-closed" size={20} color={COLORS.grey[400]} />
                      ) : (
                        <Ionicons
                          name={
                            lesson.type === 'video' ? 'play-circle-outline' :
                            lesson.type === 'quiz' ? 'help-circle-outline' :
                            lesson.type === 'assignment' ? 'document-outline' :
                            'reader-outline'
                          }
                          size={20}
                          color={lesson.isLocked ? COLORS.grey[400] : COLORS.primary[600]}
                        />
                      )}
                    </View>
                    <View style={styles.lessonDetails}>
                      <Text 
                        style={[
                          styles.lessonTitle, 
                          lesson.isLocked && styles.lessonTitleLocked
                        ]}
                      >
                        {lesson.title}
                      </Text>
                      <View style={styles.lessonMeta}>
                        <Badge
                          text={lesson.type}
                          variant="outline"
                          size="small"
                        />
                        <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                      </View>
                    </View>
                  </View>
                  {!lesson.isLocked && course?.isEnrolled && (
                    <Ionicons name="chevron-forward" size={16} color={COLORS.text.secondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>
      ))}
    </ScrollView>
  );

  const renderReviews = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.reviewsHeader}>
        <Text style={styles.reviewsTitle}>Student Reviews</Text>
        <View style={styles.reviewsRating}>
          <View style={styles.ratingDisplay}>
            <Text style={styles.ratingNumber}>{course?.rating.toFixed(1)}</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={16}
                  color={star <= Math.floor(course?.rating || 0) ? COLORS.warning.main : COLORS.grey[300]}
                />
              ))}
            </View>
            <Text style={styles.reviewCount}>
              ({course?.reviews.length} reviews)
            </Text>
          </View>
        </View>
      </View>

      {course?.reviews.map((review) => (
        <Card key={review.id} variant="outlined" style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewerInfo}>
              <View style={styles.reviewerAvatar}>
                <Ionicons name="person" size={20} color={COLORS.primary[600]} />
              </View>
              <View>
                <Text style={styles.reviewerName}>{review.user}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
            </View>
            <View style={styles.reviewRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={14}
                  color={star <= review.rating ? COLORS.warning.main : COLORS.grey[300]}
                />
              ))}
            </View>
          </View>
          <Text style={styles.reviewComment}>{review.comment}</Text>
        </Card>
      ))}
    </ScrollView>
  );

  if (!course) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const tabs = [
    { key: 'overview', title: 'Overview', component: renderOverview },
    { key: 'syllabus', title: 'Syllabus', component: renderSyllabus },
    { key: 'reviews', title: 'Reviews', component: renderReviews },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Course Header */}
        <View style={styles.courseHeader}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            <OfflineIndicator />
          </View>

          <View style={styles.courseThumbnail}>
            <Ionicons name="book" size={48} color={COLORS.primary[600]} />
          </View>

          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseInstructor}>by {course.instructor.name}</Text>

          <View style={styles.courseMeta}>
            <Badge text={course.level} variant="primary" size="small" />
            <Badge text={course.category} variant="outline" size="small" />
            {course.isPremium && <Badge text="Premium" variant="warning" size="small" />}
          </View>

          <View style={styles.courseStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color={COLORS.warning.main} />
              <Text style={styles.statText}>{course.rating.toFixed(1)}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color={COLORS.text.secondary} />
              <Text style={styles.statText}>{course.enrolledStudents.toLocaleString()}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
              <Text style={styles.statText}>{course.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={16} color={COLORS.text.secondary} />
              <Text style={styles.statText}>{course.totalLessons} lessons</Text>
            </View>
          </View>

          {course.isEnrolled && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  Your Progress: {course.completedLessons}/{course.totalLessons}
                </Text>
                <Text style={styles.progressPercentage}>{course.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${course.progress}%` }]} />
              </View>
            </View>
          )}
        </View>

        {/* Tab Content */}
        <TabView
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          style={styles.tabView}
        />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        {course.isEnrolled ? (
          <Button
            title="Continue Learning"
            onPress={handleStartLearning}
            style={styles.actionButton}
            icon="play"
            loading={isLoading}
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
              onPress={handleEnroll}
              style={styles.enrollButton}
              loading={isLoading}
            />
          </View>
        )}
      </View>
    </View>
  );
};

// Mock data for development
const mockCourseDetails: CourseDetails = {
  id: '1',
  title: 'Complete Mathematics for Class 12',
  description: 'Comprehensive mathematics course covering calculus, algebra, trigonometry, and more for Class 12 students. This course is designed to help students excel in their board exams and competitive entrance tests like JEE and NEET.',
  instructor: {
    name: 'Dr. Rajesh Kumar',
    bio: 'Mathematics Professor with 15+ years of teaching experience. Specialized in calculus and algebra.',
    rating: 4.8,
    students: 25000,
  },
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
  whatYouWillLearn: [
    'Master calculus concepts including limits, derivatives, and integrals',
    'Understand complex algebraic operations and problem-solving techniques',
    'Apply trigonometric functions and identities to solve real-world problems',
    'Prepare effectively for board exams and competitive tests',
    'Develop strong mathematical reasoning and analytical skills',
  ],
  requirements: [
    'Basic knowledge of Class 11 mathematics',
    'Understanding of fundamental algebraic concepts',
    'Access to calculator and notebook for practice',
    'Commitment to regular practice and homework',
  ],
  syllabus: [
    {
      id: '1',
      title: 'Relations and Functions',
      duration: '8 hours',
      isCompleted: true,
      lessons: [
        {
          id: '1-1',
          title: 'Introduction to Relations',
          duration: '45 min',
          type: 'video',
          isCompleted: true,
          isLocked: false,
        },
        {
          id: '1-2',
          title: 'Types of Functions',
          duration: '50 min',
          type: 'video',
          isCompleted: true,
          isLocked: false,
        },
        {
          id: '1-3',
          title: 'Practice Quiz',
          duration: '30 min',
          type: 'quiz',
          isCompleted: false,
          isLocked: false,
        },
      ],
    },
    {
      id: '2',
      title: 'Inverse Trigonometric Functions',
      duration: '6 hours',
      isCompleted: false,
      lessons: [
        {
          id: '2-1',
          title: 'Introduction to Inverse Functions',
          duration: '40 min',
          type: 'video',
          isCompleted: false,
          isLocked: false,
        },
        {
          id: '2-2',
          title: 'Properties and Graphs',
          duration: '55 min',
          type: 'video',
          isCompleted: false,
          isLocked: true,
        },
      ],
    },
  ],
  reviews: [
    {
      id: '1',
      user: 'Priya Sharma',
      rating: 5,
      comment: 'Excellent course! Dr. Kumar explains concepts very clearly and the practice problems are really helpful.',
      date: '2 days ago',
    },
    {
      id: '2',
      user: 'Arjun Patel',
      rating: 4,
      comment: 'Good content but could use more solved examples. Overall very satisfied with the course.',
      date: '1 week ago',
    },
  ],
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.main,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  courseHeader: {
    backgroundColor: COLORS.background.light,
    padding: 20,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  courseThumbnail: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary.light,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  courseInstructor: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    height: 8,
    backgroundColor: COLORS.grey[200],
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary[600],
    borderRadius: 4,
  },
  tabView: {
    flex: 1,
    marginTop: 16,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  learningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  learningText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
    paddingLeft: 4,
  },
  requirementText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  instructorCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.main,
    padding: 16,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
  },
  instructorAvatar: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary.light,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  instructorBio: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  instructorStats: {
    flexDirection: 'row',
    gap: 16,
  },
  instructorStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  instructorStatText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  syllabusHeader: {
    marginBottom: 16,
  },
  syllabusTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  syllabusSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  sectionCard: {
    marginBottom: 8,
  },
  sectionHeader: {
    padding: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  sectionName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    flex: 1,
  },
  sectionMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: 28,
  },
  lessonsList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 4,
    backgroundColor: COLORS.background.main,
    borderRadius: DIMENSIONS.BORDER_RADIUS / 2,
  },
  lessonLocked: {
    opacity: 0.6,
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonIcon: {
    marginRight: 12,
  },
  lessonDetails: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  lessonTitleLocked: {
    color: COLORS.text.secondary,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonDuration: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  reviewsHeader: {
    marginBottom: 20,
  },
  reviewsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  reviewsRating: {
    alignItems: 'flex-start',
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  reviewCard: {
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.primary.light,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  reviewDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  bottomAction: {
    padding: 16,
    backgroundColor: COLORS.background.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
  },
  actionButton: {
    width: '100%',
  },
  enrollSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  priceSection: {
    flex: 1,
  },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.success.main,
  },
  freePrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary[600],
  },
  enrollButton: {
    flex: 2,
  },
});

export default CourseDetailsScreen;