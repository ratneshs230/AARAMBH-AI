import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, DIMENSIONS, AI_AGENTS } from '../../constants';

const AIHomeScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleAgentPress = (agentType: string) => {
    const routeMap: Record<string, string> = {
      'tutor': 'AITutor',
      'content_creator': 'AIContent',
      'assessment': 'AIAssessment',
      'doubt_solver': 'AIDoubt',
      'study_planner': 'AIPlanner',
      'mentor': 'AIMentor',
      'analytics': 'AIAnalytics',
    };

    const route = routeMap[agentType];
    if (route) {
      navigation.navigate(route as never);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI Assistants</Text>
      <Text style={styles.subtitle}>Choose your AI learning companion</Text>
      
      <View style={styles.agentsGrid}>
        {AI_AGENTS.map((agent) => (
          <TouchableOpacity
            key={agent.type}
            style={[styles.agentCard, { borderLeftColor: agent.color }]}
            onPress={() => handleAgentPress(agent.type)}
          >
            <View style={[styles.agentIcon, { backgroundColor: agent.color + '20' }]}>
              <Ionicons name={agent.icon as any} size={32} color={agent.color} />
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <Text style={styles.agentDescription}>{agent.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.grey[400]} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  content: {
    padding: DIMENSIONS.SCREEN_PADDING,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.secondary,
    marginBottom: 32,
  },
  agentsGrid: {
    gap: 16,
  },
  agentCard: {
    backgroundColor: COLORS.background.light,
    borderRadius: DIMENSIONS.BORDER_RADIUS,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: COLORS.grey[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  agentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  agentDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
});

export default AIHomeScreen;