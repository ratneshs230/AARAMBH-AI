import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStudySession, useRealtimeConnection } from '../hooks/useRealtime';
import { StudySession } from '../services/realtime';
import { COLORS, FONT_SIZES, DIMENSIONS } from '../constants';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SearchBar } from '../components/common/SearchBar';
import { TabView } from '../components/common/TabView';
import { Modal } from '../components/common/Modal';
import { TextInput } from '../components/common/TextInput';
import { Switch } from 'react-native-switch';
import { StudySessionCard } from '../components/realtime/StudySessionCard';
import { OfflineIndicator } from '../components/common/OfflineIndicator';

interface CreateSessionForm {
  title: string;
  description: string;
  subject: string;
  maxParticipants: number;
  isPublic: boolean;
  startTime: string;
}

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
];

export const StudySessionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isConnected } = useRealtimeConnection();
  const { 
    currentSession, 
    availableSessions, 
    isLoading, 
    error, 
    createSession, 
    joinSession, 
    leaveSession 
  } = useStudySession();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const [createForm, setCreateForm] = useState<CreateSessionForm>({
    title: '',
    description: '',
    subject: 'Mathematics',
    maxParticipants: 10,
    isPublic: true,
    startTime: new Date().toISOString(),
  });

  useEffect(() => {
    if (!isConnected) {
      Alert.alert(
        'Connection Required',
        'You need to be connected to join study sessions. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    }
  }, [isConnected]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would fetch updated sessions from the server
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleCreateSession = async () => {
    if (!createForm.title.trim()) {
      Alert.alert('Error', 'Please enter a session title');
      return;
    }

    if (!createForm.description.trim()) {
      Alert.alert('Error', 'Please enter a session description');
      return;
    }

    try {
      const sessionId = await createSession({
        ...createForm,
        hostId: 'current_user_id', // Replace with actual user ID
        hostName: 'Current User', // Replace with actual user name
      });

      if (sessionId) {
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          description: '',
          subject: 'Mathematics',
          maxParticipants: 10,
          isPublic: true,
          startTime: new Date().toISOString(),
        });
        
        Alert.alert(
          'Success',
          'Study session created successfully!',
          [
            { text: 'OK', onPress: () => navigation.navigate('StudySessionPlayer', { sessionId }) }
          ]
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to create study session. Please try again.');
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    if (!isConnected) {
      Alert.alert('Error', 'You need to be connected to join a study session.');
      return;
    }

    try {
      const success = await joinSession(sessionId);
      if (success) {
        navigation.navigate('StudySessionPlayer', { sessionId });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to join study session. Please try again.');
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    try {
      await leaveSession();
      Alert.alert('Success', 'Left study session successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to leave study session. Please try again.');
    }
  };

  const handleViewSessionDetails = (sessionId: string) => {
    navigation.navigate('StudySessionPlayer', { sessionId });
  };

  const filterSessions = (sessions: StudySession[]) => {
    return sessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.hostName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = selectedSubject === 'All' || session.subject === selectedSubject;
      
      return matchesSearch && matchesSubject;
    });
  };

  const renderConnectionStatus = () => {
    if (!isConnected) {
      return (
        <Card variant="outlined" style={styles.connectionCard}>
          <View style={styles.connectionContent}>
            <Ionicons name="wifi-outline" size={24} color={COLORS.warning.main} />
            <View style={styles.connectionText}>
              <Text style={styles.connectionTitle}>Connection Required</Text>
              <Text style={styles.connectionSubtitle}>
                Connect to internet to join study sessions
              </Text>
            </View>
          </View>
        </Card>
      );
    }

    return null;
  };

  const renderAvailableSessions = () => {
    const filteredSessions = filterSessions(availableSessions);
    
    return (
      <ScrollView
        style={styles.sessionsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <StudySessionCard
              key={session.id}
              session={session}
              onJoin={handleJoinSession}
              onLeave={handleLeaveSession}
              onViewDetails={handleViewSessionDetails}
              isCurrentUserHost={session.hostId === 'current_user_id'}
              isCurrentUserParticipant={session.participants.some(p => p.id === 'current_user_id')}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={COLORS.grey[400]} />
            <Text style={styles.emptyStateTitle}>No study sessions found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || selectedSubject !== 'All' 
                ? 'Try adjusting your search or filters'
                : 'Be the first to create a study session!'
              }
            </Text>
            {!searchQuery && selectedSubject === 'All' && (
              <Button
                title="Create Session"
                onPress={() => setShowCreateModal(true)}
                style={styles.createButton}
                disabled={!isConnected}
              />
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderMySessions = () => {
    const mySessions = availableSessions.filter(session => 
      session.hostId === 'current_user_id' || 
      session.participants.some(p => p.id === 'current_user_id')
    );

    return (
      <ScrollView
        style={styles.sessionsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {mySessions.length > 0 ? (
          mySessions.map((session) => (
            <StudySessionCard
              key={session.id}
              session={session}
              onJoin={handleJoinSession}
              onLeave={handleLeaveSession}
              onViewDetails={handleViewSessionDetails}
              isCurrentUserHost={session.hostId === 'current_user_id'}
              isCurrentUserParticipant={session.participants.some(p => p.id === 'current_user_id')}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color={COLORS.grey[400]} />
            <Text style={styles.emptyStateTitle}>No sessions yet</Text>
            <Text style={styles.emptyStateText}>
              Create or join a study session to get started
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      title="Create Study Session"
      position="fullscreen"
    >
      <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Session Title *</Text>
          <TextInput
            value={createForm.title}
            onChangeText={(text) => setCreateForm(prev => ({ ...prev, title: text }))}
            placeholder="Enter session title"
            maxLength={100}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Description *</Text>
          <TextInput
            value={createForm.description}
            onChangeText={(text) => setCreateForm(prev => ({ ...prev, description: text }))}
            placeholder="Describe what you'll be studying"
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Subject</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.subjectChips}>
              {SUBJECTS.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.subjectChip,
                    createForm.subject === subject && styles.selectedSubjectChip
                  ]}
                  onPress={() => setCreateForm(prev => ({ ...prev, subject }))}
                >
                  <Text style={[
                    styles.subjectChipText,
                    createForm.subject === subject && styles.selectedSubjectChipText
                  ]}>
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Max Participants</Text>
          <View style={styles.participantSelector}>
            {[5, 10, 15, 20, 25].map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.participantOption,
                  createForm.maxParticipants === count && styles.selectedParticipantOption
                ]}
                onPress={() => setCreateForm(prev => ({ ...prev, maxParticipants: count }))}
              >
                <Text style={[
                  styles.participantOptionText,
                  createForm.maxParticipants === count && styles.selectedParticipantOptionText
                ]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <Text style={styles.switchLabel}>Public Session</Text>
              <Text style={styles.switchDescription}>
                Anyone can find and join this session
              </Text>
            </View>
            <Switch
              value={createForm.isPublic}
              onValueChange={(value) => setCreateForm(prev => ({ ...prev, isPublic: value }))}
              trackColor={{
                false: COLORS.grey[300],
                true: COLORS.primary[200],
              }}
              thumbColor={createForm.isPublic ? COLORS.primary[600] : COLORS.grey[500]}
            />
          </View>
        </View>

        <View style={styles.modalActions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => setShowCreateModal(false)}
            style={styles.modalButton}
          />
          <Button
            title="Create Session"
            onPress={handleCreateSession}
            style={styles.modalButton}
            loading={isLoading}
          />
        </View>
      </ScrollView>
    </Modal>
  );

  const tabs = [
    {
      key: 'available',
      title: 'Available',
      icon: 'globe-outline',
      component: renderAvailableSessions,
    },
    {
      key: 'my_sessions',
      title: 'My Sessions',
      icon: 'bookmark-outline',
      component: renderMySessions,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Study Sessions</Text>
          <View style={styles.headerActions}>
            <OfflineIndicator />
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
              disabled={!isConnected}
            >
              <Ionicons name="add" size={24} color={COLORS.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {renderConnectionStatus()}

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search sessions..."
          style={styles.searchBar}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.subjectFilters}>
            {['All', ...SUBJECTS].map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.subjectFilter,
                  selectedSubject === subject && styles.selectedSubjectFilter
                ]}
                onPress={() => setSelectedSubject(subject)}
              >
                <Text style={[
                  styles.subjectFilterText,
                  selectedSubject === subject && styles.selectedSubjectFilterText
                ]}>
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {currentSession && (
        <Card variant="elevated" style={styles.currentSessionCard}>
          <View style={styles.currentSessionHeader}>
            <Ionicons name="radio-outline" size={20} color={COLORS.success.main} />
            <Text style={styles.currentSessionTitle}>Active Session</Text>
          </View>
          <Text style={styles.currentSessionName}>{currentSession.title}</Text>
          <Button
            title="Return to Session"
            onPress={() => navigation.navigate('StudySessionPlayer', { sessionId: currentSession.id })}
            style={styles.returnButton}
            icon="arrow-forward"
          />
        </Card>
      )}

      {error && (
        <Card variant="outlined" style={styles.errorCard}>
          <View style={styles.errorContent}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error.main} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </Card>
      )}

      <TabView
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        style={styles.tabView}
      />

      {renderCreateModal()}
    </View>
  );
};

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primary.light,
  },
  searchBar: {
    marginBottom: 12,
  },
  subjectFilters: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  subjectFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.grey[100],
  },
  selectedSubjectFilter: {
    backgroundColor: COLORS.primary[600],
  },
  subjectFilterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  selectedSubjectFilterText: {
    color: COLORS.background.light,
  },
  connectionCard: {
    marginBottom: 12,
    borderColor: COLORS.warning.light,
    backgroundColor: COLORS.warning.light,
  },
  connectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connectionText: {
    flex: 1,
  },
  connectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.warning.dark,
  },
  connectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning.dark,
  },
  currentSessionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success.main,
  },
  currentSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  currentSessionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.success.main,
  },
  currentSessionName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  returnButton: {
    alignSelf: 'flex-start',
  },
  errorCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderColor: COLORS.error.light,
    backgroundColor: COLORS.error.light,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error.dark,
    flex: 1,
  },
  tabView: {
    flex: 1,
  },
  sessionsList: {
    flex: 1,
    padding: 16,
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subjectChips: {
    flexDirection: 'row',
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.grey[100],
    borderWidth: 1,
    borderColor: COLORS.grey[200],
  },
  selectedSubjectChip: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  subjectChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  selectedSubjectChipText: {
    color: COLORS.background.light,
  },
  participantSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  participantOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.grey[100],
    borderWidth: 1,
    borderColor: COLORS.grey[200],
  },
  selectedParticipantOption: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  participantOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  selectedParticipantOptionText: {
    color: COLORS.background.light,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchContent: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
});

export default StudySessionScreen;