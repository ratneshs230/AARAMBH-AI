/**
 * Learning Progress Service
 * Handles continue learning functionality, progress tracking, and learning session management
 */

export interface LearningSession {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  sectionId?: string;
  title: string;
  description: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'interactive' | 'curiosity';
  platform: 'course' | 'curiosity' | 'ai_tutor' | 'practice';
  progress: number; // 0-100
  timeSpent: number; // in minutes
  lastAccessed: Date;
  isCompleted: boolean;
  completedAt?: Date;
  bookmarks: LearningBookmark[];
  notes: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  score?: number; // for quizzes/assessments
  nextSuggestion?: NextLearningItem;
}

export interface LearningBookmark {
  id: string;
  timestamp: number; // for videos, position for text
  title: string;
  note?: string;
  createdAt: Date;
}

export interface NextLearningItem {
  id: string;
  title: string;
  type: string;
  platform: string;
  reason: string;
  estimatedDuration: number;
  difficulty: string;
}

export interface ContinueLearningItem {
  session: LearningSession;
  priority: number; // 1-5, 1 being highest priority
  reasonToContinue: string;
  timeUntilStale: number; // hours until this becomes less relevant
  quickActions: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  type: 'resume' | 'review' | 'practice' | 'next' | 'help';
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date;
  weeklyGoal: number; // in minutes
  weeklyProgress: number; // in minutes
  dailyGoal: number; // in minutes
  todayProgress: number; // in minutes
}

export class LearningProgressService {
  private readonly STORAGE_KEYS = {
    SESSIONS: 'learning_sessions',
    STREAK: 'study_streak',
    PREFERENCES: 'learning_preferences',
    BOOKMARKS: 'learning_bookmarks',
  };

  // Get all learning sessions for a user
  getUserSessions(userId: string): LearningSession[] {
    try {
      const sessions = localStorage.getItem(this.STORAGE_KEYS.SESSIONS);
      let allSessions: LearningSession[] = [];
      
      if (sessions) {
        allSessions = JSON.parse(sessions);
      } else {
        // Create some sample sessions for demonstration
        allSessions = this.createSampleSessions(userId);
        localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(allSessions));
      }
      
      return allSessions
        .filter(session => session.userId === userId)
        .map(session => ({
          ...session,
          lastAccessed: new Date(session.lastAccessed),
          completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
          bookmarks: session.bookmarks.map(bookmark => ({
            ...bookmark,
            createdAt: new Date(bookmark.createdAt)
          }))
        }));
    } catch (error) {
      console.error('Error retrieving user sessions:', error);
      return [];
    }
  }

  // Create sample sessions for demonstration
  private createSampleSessions(userId: string): LearningSession[] {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    
    return [
      {
        id: 'session_math_001',
        userId,
        courseId: '1',
        lessonId: 'calc-8',
        title: 'Differential Equations - Advanced Topics',
        description: 'Advanced Mathematics - Differential Equations',
        type: 'video',
        platform: 'course',
        progress: 65,
        timeSpent: 35,
        lastAccessed: yesterday,
        isCompleted: false,
        bookmarks: [],
        notes: 'Need to review the integration by parts section',
        difficulty: 'advanced',
        estimatedDuration: 45,
        nextSuggestion: {
          id: 'calc-9',
          title: 'Partial Differential Equations',
          type: 'video',
          platform: 'course',
          reason: 'Continue with the next topic in sequence',
          estimatedDuration: 40,
          difficulty: 'advanced'
        }
      },
      {
        id: 'session_physics_001',
        userId,
        courseId: '2',
        lessonId: 'phys-7',
        title: 'Newton\'s Laws - Problem Solving',
        description: 'Physics Fundamentals - Newton\'s Laws of Motion',
        type: 'assignment',
        platform: 'course',
        progress: 80,
        timeSpent: 25,
        lastAccessed: twoDaysAgo,
        isCompleted: false,
        bookmarks: [],
        notes: 'Working through problem set 7',
        difficulty: 'intermediate',
        estimatedDuration: 30,
        nextSuggestion: {
          id: 'phys-8',
          title: 'Momentum and Collisions',
          type: 'video',
          platform: 'course',
          reason: 'Next chapter in physics sequence',
          estimatedDuration: 35,
          difficulty: 'intermediate'
        }
      },
      {
        id: 'session_ai_tutor_001',
        userId,
        courseId: 'ai_tutor',
        lessonId: 'quantum_mechanics',
        title: 'AI Tutor: Quantum Mechanics Basics',
        description: 'Getting help understanding quantum mechanics principles',
        type: 'interactive',
        platform: 'ai_tutor',
        progress: 45,
        timeSpent: 15,
        lastAccessed: now,
        isCompleted: false,
        bookmarks: [],
        notes: 'Asked about wave-particle duality',
        difficulty: 'intermediate',
        estimatedDuration: 20
      },
      {
        id: 'session_practice_001',
        userId,
        courseId: 'chemistry',
        lessonId: 'organic_reactions_quiz',
        title: 'Organic Chemistry Practice Quiz',
        description: 'Practice quiz on organic reaction mechanisms',
        type: 'quiz',
        platform: 'practice',
        progress: 90,
        timeSpent: 18,
        lastAccessed: yesterday,
        isCompleted: false,
        bookmarks: [],
        notes: 'Almost finished, just need to complete the last section',
        difficulty: 'intermediate',
        estimatedDuration: 20,
        score: 85
      }
    ];
  }

  // Save or update a learning session
  saveSession(session: LearningSession): boolean {
    try {
      const sessions = this.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = { ...session, lastAccessed: new Date() };
      } else {
        sessions.push({ ...session, lastAccessed: new Date() });
      }
      
      localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      
      // Update study streak
      this.updateStudyStreak(session.userId, session.timeSpent);
      
      return true;
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  }

  // Get continue learning items sorted by priority
  getContinueLearningItems(userId: string, limit: number = 5): ContinueLearningItem[] {
    const sessions = this.getUserSessions(userId);
    const now = new Date();
    
    const continueLearningItems: ContinueLearningItem[] = sessions
      .filter(session => !session.isCompleted && session.progress > 0)
      .map(session => {
        const hoursSinceAccess = (now.getTime() - session.lastAccessed.getTime()) / (1000 * 60 * 60);
        const priority = this.calculatePriority(session, hoursSinceAccess);
        const reasonToContinue = this.generateContinueReason(session, hoursSinceAccess);
        const timeUntilStale = Math.max(0, 72 - hoursSinceAccess); // 3 days until stale
        
        return {
          session,
          priority,
          reasonToContinue,
          timeUntilStale,
          quickActions: this.generateQuickActions(session)
        };
      })
      .sort((a, b) => a.priority - b.priority) // Lower number = higher priority
      .slice(0, limit);

    return continueLearningItems;
  }

  // Calculate priority for continue learning (1 = highest priority)
  private calculatePriority(session: LearningSession, hoursSinceAccess: number): number {
    let priority = 3; // base priority
    
    // Recently accessed items get higher priority
    if (hoursSinceAccess < 2) priority -= 2;
    else if (hoursSinceAccess < 6) priority -= 1;
    else if (hoursSinceAccess > 48) priority += 1;
    
    // High progress items get priority
    if (session.progress > 80) priority -= 1;
    else if (session.progress > 50) priority -= 0.5;
    
    // Type-based priority
    if (session.type === 'video' && session.progress > 10) priority -= 0.5;
    if (session.type === 'quiz' && session.progress > 0) priority -= 1;
    
    // Platform priority
    if (session.platform === 'course') priority -= 0.5;
    
    return Math.max(1, Math.min(5, priority));
  }

  // Generate reason to continue learning
  private generateContinueReason(session: LearningSession, hoursSinceAccess: number): string {
    if (session.progress > 80) {
      return "You're almost done! Just a few more minutes to complete.";
    }
    
    if (hoursSinceAccess < 2) {
      return "You were just studying this. Keep the momentum going!";
    }
    
    if (session.type === 'video' && session.progress > 20) {
      return `Continue from ${Math.round(session.progress)}% where you left off.`;
    }
    
    if (session.type === 'quiz') {
      return "Complete this quiz to test your understanding.";
    }
    
    if (hoursSinceAccess > 24) {
      return "Let's refresh your memory and continue learning.";
    }
    
    return "Continue your learning journey from where you left off.";
  }

  // Generate quick actions for a session
  private generateQuickActions(session: LearningSession): QuickAction[] {
    const actions: QuickAction[] = [];
    
    // Resume action
    actions.push({
      id: 'resume',
      label: session.progress > 0 ? 'Resume' : 'Start',
      icon: 'PlayArrow',
      action: () => this.resumeSession(session.id),
      type: 'resume'
    });
    
    // Review action for completed or high-progress items
    if (session.progress > 50 || session.isCompleted) {
      actions.push({
        id: 'review',
        label: 'Review',
        icon: 'Refresh',
        action: () => this.reviewSession(session.id),
        type: 'review'
      });
    }
    
    // Practice action for quiz-type content
    if (session.type === 'quiz' || session.platform === 'practice') {
      actions.push({
        id: 'practice',
        label: 'Practice',
        icon: 'Quiz',
        action: () => this.practiceSession(session.id),
        type: 'practice'
      });
    }
    
    // Next lesson action
    if (session.nextSuggestion) {
      actions.push({
        id: 'next',
        label: 'Next Lesson',
        icon: 'SkipNext',
        action: () => this.goToNext(session.id),
        type: 'next'
      });
    }
    
    // Help action
    actions.push({
      id: 'help',
      label: 'Get Help',
      icon: 'Help',
      action: () => this.getHelp(session.id),
      type: 'help'
    });
    
    return actions.slice(0, 3); // Limit to 3 actions
  }

  // Create a new learning session
  createSession(
    userId: string,
    courseId: string,
    lessonId: string,
    title: string,
    description: string,
    type: LearningSession['type'],
    platform: LearningSession['platform'],
    difficulty: LearningSession['difficulty'] = 'intermediate',
    estimatedDuration: number = 30
  ): LearningSession {
    const session: LearningSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      courseId,
      lessonId,
      title,
      description,
      type,
      platform,
      progress: 0,
      timeSpent: 0,
      lastAccessed: new Date(),
      isCompleted: false,
      bookmarks: [],
      notes: '',
      difficulty,
      estimatedDuration,
    };
    
    this.saveSession(session);
    return session;
  }

  // Update session progress
  updateProgress(
    sessionId: string,
    progress: number,
    timeSpent: number,
    notes?: string
  ): boolean {
    try {
      const sessions = this.getAllSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) return false;
      
      const session = sessions[sessionIndex];
      session.progress = Math.min(100, Math.max(0, progress));
      session.timeSpent += timeSpent;
      session.lastAccessed = new Date();
      
      if (notes) {
        session.notes = notes;
      }
      
      // Mark as completed if progress reaches 100%
      if (session.progress >= 100 && !session.isCompleted) {
        session.isCompleted = true;
        session.completedAt = new Date();
        session.actualDuration = session.timeSpent;
      }
      
      localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      
      // Update study streak
      this.updateStudyStreak(session.userId, timeSpent);
      
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  }

  // Add bookmark to session
  addBookmark(
    sessionId: string,
    timestamp: number,
    title: string,
    note?: string
  ): boolean {
    try {
      const sessions = this.getAllSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) return false;
      
      const bookmark: LearningBookmark = {
        id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        title,
        note,
        createdAt: new Date()
      };
      
      sessions[sessionIndex].bookmarks.push(bookmark);
      localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return false;
    }
  }

  // Get study streak information
  getStudyStreak(userId: string): StudyStreak {
    try {
      const streakData = localStorage.getItem(`${this.STORAGE_KEYS.STREAK}_${userId}`);
      if (!streakData) {
        return this.initializeStreak(userId);
      }
      
      const streak: StudyStreak = JSON.parse(streakData);
      return {
        ...streak,
        lastStudyDate: new Date(streak.lastStudyDate)
      };
    } catch (error) {
      console.error('Error retrieving study streak:', error);
      return this.initializeStreak(userId);
    }
  }

  // Initialize study streak for new user
  private initializeStreak(userId: string): StudyStreak {
    const streak: StudyStreak = {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: new Date(),
      weeklyGoal: 600, // 10 hours per week
      weeklyProgress: 0,
      dailyGoal: 60, // 1 hour per day
      todayProgress: 0
    };
    
    localStorage.setItem(`${this.STORAGE_KEYS.STREAK}_${userId}`, JSON.stringify(streak));
    return streak;
  }

  // Update study streak
  private updateStudyStreak(userId: string, timeSpent: number): void {
    try {
      const streak = this.getStudyStreak(userId);
      const today = new Date();
      const lastStudy = new Date(streak.lastStudyDate);
      const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
      
      // Update today's progress
      if (this.isSameDay(today, lastStudy)) {
        streak.todayProgress += timeSpent;
      } else {
        streak.todayProgress = timeSpent;
      }
      
      // Update streak
      if (daysDiff === 0) {
        // Same day, no change to streak count
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        streak.currentStreak += 1;
        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      } else if (daysDiff > 1) {
        // Streak broken, reset to 1
        streak.currentStreak = 1;
      }
      
      // Update weekly progress
      const weekStart = this.getWeekStart(today);
      const lastWeekStart = this.getWeekStart(lastStudy);
      if (weekStart.getTime() !== lastWeekStart.getTime()) {
        // New week, reset weekly progress
        streak.weeklyProgress = timeSpent;
      } else {
        streak.weeklyProgress += timeSpent;
      }
      
      streak.lastStudyDate = today;
      
      localStorage.setItem(`${this.STORAGE_KEYS.STREAK}_${userId}`, JSON.stringify(streak));
    } catch (error) {
      console.error('Error updating study streak:', error);
    }
  }

  // Helper methods for date calculations
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  // Action handlers
  private resumeSession(sessionId: string): void {
    // This will be implemented to navigate to the appropriate page
    console.log('Resuming session:', sessionId);
  }

  private reviewSession(sessionId: string): void {
    console.log('Reviewing session:', sessionId);
  }

  private practiceSession(sessionId: string): void {
    console.log('Practice session:', sessionId);
  }

  private goToNext(sessionId: string): void {
    console.log('Going to next lesson:', sessionId);
  }

  private getHelp(sessionId: string): void {
    console.log('Getting help for session:', sessionId);
  }

  // Helper method to get all sessions
  private getAllSessions(): LearningSession[] {
    try {
      const sessions = localStorage.getItem(this.STORAGE_KEYS.SESSIONS);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error retrieving all sessions:', error);
      return [];
    }
  }

  // Clean up old sessions (older than 30 days)
  cleanupOldSessions(): number {
    try {
      const sessions = this.getAllSessions();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const activeSessions = sessions.filter(session => 
        new Date(session.lastAccessed) > thirtyDaysAgo || !session.isCompleted
      );
      
      const removed = sessions.length - activeSessions.length;
      localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(activeSessions));
      
      return removed;
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      return 0;
    }
  }

  // Get learning insights
  getLearningInsights(userId: string): {
    totalTimeStudied: number;
    averageSessionTime: number;
    preferredLearningTime: string;
    strongestSubjects: string[];
    recommendedFocus: string[];
    completionRate: number;
  } {
    const sessions = this.getUserSessions(userId);
    const totalTimeStudied = sessions.reduce((sum, session) => sum + session.timeSpent, 0);
    const completedSessions = sessions.filter(s => s.isCompleted);
    const completionRate = sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0;
    
    return {
      totalTimeStudied,
      averageSessionTime: sessions.length > 0 ? totalTimeStudied / sessions.length : 0,
      preferredLearningTime: this.getPreferredLearningTime(sessions),
      strongestSubjects: this.getStrongestSubjects(sessions),
      recommendedFocus: this.getRecommendedFocus(sessions),
      completionRate
    };
  }

  private getPreferredLearningTime(sessions: LearningSession[]): string {
    // Analyze the time of day when most learning happens
    const hourCounts = new Array(24).fill(0);
    sessions.forEach(session => {
      const hour = new Date(session.lastAccessed).getHours();
      hourCounts[hour] += session.timeSpent;
    });
    
    const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
    
    if (maxHour >= 6 && maxHour < 12) return 'Morning';
    if (maxHour >= 12 && maxHour < 18) return 'Afternoon';
    if (maxHour >= 18 && maxHour < 22) return 'Evening';
    return 'Night';
  }

  private getStrongestSubjects(sessions: LearningSession[]): string[] {
    const subjectPerformance: Record<string, { total: number; completed: number }> = {};
    
    sessions.forEach(session => {
      const subject = session.courseId; // Assuming courseId represents subject
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = { total: 0, completed: 0 };
      }
      subjectPerformance[subject].total++;
      if (session.isCompleted) {
        subjectPerformance[subject].completed++;
      }
    });
    
    return Object.entries(subjectPerformance)
      .map(([subject, perf]) => ({
        subject,
        rate: perf.total > 0 ? perf.completed / perf.total : 0
      }))
      .filter(item => item.rate > 0.7)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 3)
      .map(item => item.subject);
  }

  private getRecommendedFocus(sessions: LearningSession[]): string[] {
    const lowProgressSessions = sessions
      .filter(session => !session.isCompleted && session.progress < 50)
      .sort((a, b) => a.progress - b.progress)
      .slice(0, 3);
    
    return lowProgressSessions.map(session => session.title);
  }
}

export const learningProgressService = new LearningProgressService();
export default learningProgressService;