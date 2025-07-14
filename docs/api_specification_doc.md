### 6.4 Submit Assessment
```yaml
POST /assessments/sessions/{session_id}/submit
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "session_id": "session_abc123",
    "assessment_id": "test_thermodynamics_001",
    "submitted_at": "2025-07-15T11:45:00Z",
    "time_taken_minutes": 45,
    "score": {
      "total_marks": 85,
      "max_marks": 100,
      "percentage": 85,
      "grade": "A",
      "pass_status": "passed"
    },
    "question_analysis": {
      "correct": 21,
      "incorrect": 4,
      "unanswered": 0,
      "by_difficulty": {
        "easy": {"correct": 8, "total": 8},
        "medium": {"correct": 10, "total": 12},
        "hard": {"correct": 3, "total": 5}
      },
      "by_topic": {
        "Laws of Thermodynamics": {"correct": 6, "total": 7},
        "Heat Transfer": {"correct": 8, "total": 9},
        "Thermodynamic Processes": {"correct": 5, "total": 6},
        "Entropy": {"correct": 2, "total": 3}
      }
    },
    "performance_insights": {
      "strengths": ["Heat Transfer", "Basic Laws"],
      "areas_for_improvement": ["Entropy", "Complex Processes"],
      "time_management": "good",
      "accuracy_rate": 84
    },
    "rank": {
      "current_attempt": 156,
      "all_time_best": 89,
      "percentile": 78
    },
    "next_steps": [
      "Review entropy concepts",
      "Practice more complex problems",
      "Move to next chapter"
    ],
    "detailed_report_url": "https://api.aarambhai.com/v1/assessments/sessions/session_abc123/report"
  },
  "message": "Assessment submitted successfully"
}
```

### 6.5 Get Assessment Results
```yaml
GET /assessments/sessions/{session_id}/results
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "session_id": "session_abc123",
    "assessment_info": {
      "title": "Thermodynamics Chapter Test",
      "type": "chapter_test",
      "total_questions": 25,
      "max_marks": 100
    },
    "score_summary": {
      "marks_obtained": 85,
      "percentage": 85,
      "grade": "A",
      "pass_status": "passed",
      "time_taken_minutes": 45,
      "rank": 156,
      "percentile": 78
    },
    "detailed_results": [
      {
        "question_id": "q_001",
        "question_number": 1,
        "question_text": "What is the first law of thermodynamics?",
        "user_answer": "opt_a",
        "correct_answer": "opt_a",
        "is_correct": true,
        "marks_awarded": 4,
        "marks_possible": 4,
        "time_taken_seconds": 45,
        "explanation": "Correct! The first law states that energy cannot be created or destroyed, only converted from one form to another.",
        "topic": "Laws of Thermodynamics",
        "difficulty": "easy"
      },
      {
        "question_id": "q_002",
        "question_number": 2,
        "question_text": "Calculate the entropy change for an irreversible process...",
        "user_answer": "opt_b",
        "correct_answer": "opt_c",
        "is_correct": false,
        "marks_awarded": 0,
        "marks_possible": 4,
        "time_taken_seconds": 120,
        "explanation": "Incorrect. For irreversible processes, entropy always increases. The correct formula is ΔS = Q/T.",
        "topic": "Entropy",
        "difficulty": "hard",
        "hint": "Remember that entropy is a state function",
        "related_resources": [
          {
            "type": "lesson",
            "id": "lesson_095",
            "title": "Understanding Entropy"
          }
        ]
      }
    ],
    "performance_analysis": {
      "topic_wise_performance": [
        {
          "topic": "Laws of Thermodynamics",
          "correct": 6,
          "total": 7,
          "percentage": 85.7,
          "status": "strong"
        },
        {
          "topic": "Entropy",
          "correct": 2,
          "total": 3,
          "percentage": 66.7,
          "status": "needs_improvement"
        }
      ],
      "difficulty_wise_performance": [
        {
          "difficulty": "easy",
          "correct": 8,
          "total": 8,
          "percentage": 100
        },
        {
          "difficulty": "medium",
          "correct": 10,
          "total": 12,
          "percentage": 83.3
        },
        {
          "difficulty": "hard",
          "correct": 3,
          "total": 5,
          "percentage": 60
        }
      ],
      "time_analysis": {
        "average_time_per_question": 108,
        "fastest_correct": 25,
        "slowest_correct": 180,
        "time_efficiency": "good"
      }
    },
    "recommendations": {
      "study_plan": [
        {
          "action": "review",
          "content": "Entropy and Second Law",
          "priority": "high",
          "estimated_time": 45
        },
        {
          "action": "practice",
          "content": "Complex thermodynamic calculations",
          "priority": "medium",
          "estimated_time": 60
        }
      ],
      "related_assessments": [
        {
          "id": "practice_entropy_001",
          "title": "Entropy Practice Quiz",
          "type": "practice_quiz"
        }
      ]
    }
  }
}
```

## 7. AI Agent Interaction API

### 7.1 Teacher Agent - Content Generation
```yaml
POST /ai/teacher/generate-content
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "topic": "Quantum Mechanics - Wave Particle Duality",
  "content_type": "lesson",
  "difficulty_level": "intermediate",
  "format": "multimodal",
  "course_context": {
    "course_id": "course_physics_advanced",
    "prerequisites": ["classical_mechanics", "wave_optics"],
    "learning_objectives": [
      "Understand wave-particle duality",
      "Explain photoelectric effect",
      "Apply de Broglie wavelength"
    ]
  },
  "user_profile": {
    "learning_style": "visual",
    "current_level": "intermediate",
    "preferred_examples": "real_world"
  }
}

Response (200):
{
  "success": true,
  "data": {
    "content_id": "content_generated_001",
    "generation_id": "gen_abc123",
    "content": {
      "text_content": {
        "introduction": "Wave-particle duality is one of the most fascinating concepts in quantum mechanics...",
        "main_sections": [
          {
            "title": "Historical Background",
            "content": "The concept emerged from experiments that couldn't be explained by classical physics...",
            "key_points": [
              "Planck's quantum hypothesis",
              "Einstein's photoelectric effect",
              "de Broglie's matter waves"
            ]
          }
        ],
        "conclusion": "Understanding wave-particle duality opens the door to modern quantum mechanics...",
        "key_formulas": [
          {
            "name": "Planck's Energy Relation",
            "formula": "E = hf",
            "variables": {"E": "Energy", "h": "Planck's constant", "f": "frequency"}
          }
        ]
      },
      "multimedia_suggestions": [
        {
          "type": "animation",
          "description": "Double-slit experiment showing wave and particle behavior",
          "duration": 120,
          "style": "3d_animation"
        },
        {
          "type": "interactive_simulation",
          "description": "Virtual photoelectric effect experiment",
          "features": ["adjustable_frequency", "variable_intensity"]
        }
      ],
      "assessment_questions": [
        {
          "type": "multiple_choice",
          "question": "What happens to the kinetic energy of photoelectrons when light frequency increases?",
          "options": ["Increases", "Decreases", "Remains same", "Becomes zero"],
          "correct_answer": 0,
          "explanation": "According to Einstein's equation, KE = hf - φ, so increasing frequency increases kinetic energy."
        }
      ]
    },
    "metadata": {
      "generated_at": "2025-07-15T12:30:00Z",
      "generation_time_seconds": 8.5,
      "quality_score": 0.92,
      "research_sources": 15,
      "validation_status": "approved"
    }
  },
  "message": "Content generated successfully"
}
```

### 7.2 Designer Agent - Visual Content Creation
```yaml
POST /ai/designer/create-visual
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "content_description": "Diagram showing electromagnetic spectrum with wavelength and frequency ranges",
  "visual_type": "infographic",
  "style": "modern_educational",
  "specifications": {
    "dimensions": "1920x1080",
    "color_scheme": "blue_gradient",
    "include_labels": true,
    "interactive_elements": ["hover_details", "zoom"]
  },
  "context": {
    "subject": "physics",
    "topic": "electromagnetic_waves",
    "audience": "high_school_students"
  }
}

Response (200):
{
  "success": true,
  "data": {
    "visual_id": "visual_001",
    "creation_id": "create_xyz789",
    "visual_content": {
      "primary_image": {
        "url": "https://storage.blob.core.windows.net/generated/em_spectrum_diagram.png",
        "dimensions": "1920x1080",
        "format": "png",
        "size_mb": 2.3
      },
      "interactive_version": {
        "url": "https://storage.blob.core.windows.net/interactive/em_spectrum_interactive.html",
        "features": ["hover_details", "clickable_regions", "zoom_functionality"]
      },
      "variations": [
        {
          "type": "high_contrast",
          "url": "https://storage.blob.core.windows.net/generated/em_spectrum_high_contrast.png"
        },
        {
          "type": "simplified",
          "url": "https://storage.blob.core.windows.net/generated/em_spectrum_simple.png"
        }
      ]
    },
    "metadata": {
      "created_at": "2025-07-15T12:35:00Z",
      "creation_time_seconds": 12.3,
      "style_applied": "modern_educational",
      "accessibility_features": ["alt_text", "high_contrast_available", "scalable_text"],
      "quality_metrics": {
        "clarity_score": 0.94,
        "educational_value": 0.91,
        "visual_appeal": 0.89
      }
    }
  },
  "message": "Visual content created successfully"
}
```

### 7.3 Personal Watcher Agent - Analytics
```yaml
GET /ai/personal-watcher/analytics/{user_id}
Authorization: Bearer <access_token>

Query Parameters:
- time_period: string (7d, 30d, 90d, 1y)
- metrics: array (engagement, performance, progress, behavior)
- courses: array (optional - specific course IDs)

Response (200):
{
  "success": true,
  "data": {
    "user_id": "usr_abc123",
    "analysis_period": "30d",
    "generated_at": "2025-07-15T13:00:00Z",
    "overall_insights": {
      "learning_velocity": "above_average",
      "engagement_trend": "increasing",
      "performance_stability": "consistent",
      "goal_achievement_rate": 78
    },
    "detailed_analytics": {
      "engagement_metrics": {
        "daily_active_days": 23,
        "average_session_duration": 45,
        "total_time_spent_hours": 34.5,
        "preferred_study_times": ["18:00-20:00", "10:00-12:00"],
        "content_interaction_rate": 0.87,
        "feature_usage": {
          "lessons": 0.95,
          "practice_tests": 0.72,
          "community": 0.34,
          "games": 0.56
        }
      },
      "performance_metrics": {
        "average_assessment_score": 78.5,
        "improvement_rate": 12.3,
        "consistency_score": 0.84,
        "strong_topics": ["Mechanics", "Thermodynamics"],
        "weak_topics": ["Quantum Physics", "Relativity"],
        "problem_solving_speed": "average",
        "accuracy_trend": "improving"
      },
      "progress_metrics": {
        "courses_in_progress": 2,
        "completion_rate": 0.68,
        "milestone_achievements": 15,
        "streak_record": {
          "current": 7,
          "longest": 21
        },
        "learning_path_adherence": 0.82
      },
      "behavioral_patterns": {
        "learning_style": "visual_kinesthetic",
        "preferred_content_types": ["video", "interactive"],
        "optimal_difficulty_level": "intermediate",
        "break_frequency": "every_30_minutes",
        "motivation_drivers": ["achievement", "progress_tracking"],
        "distraction_factors": ["notifications", "long_text_blocks"]
      }
    },
    "predictions": {
      "course_completion_probability": {
        "course_jee_physics_001": 0.85,
        "course_jee_chemistry_001": 0.72
      },
      "performance_forecast": {
        "next_assessment_score": 82,
        "confidence_interval": [78, 86]
      },
      "engagement_forecast": {
        "next_week_activity": "high",
        "risk_of_dropout": "low"
      }
    },
    "recommendations": {
      "immediate_actions": [
        {
          "type": "review_weak_topics",
          "priority": "high",
          "topics": ["Quantum Physics"],
          "estimated_time": 60
        },
        {
          "type": "maintain_streak",
          "priority": "medium",
          "action": "Complete daily lesson",
          "estimated_time": 30
        }
      ],
      "study_plan_adjustments": [
        {
          "change": "increase_interactive_content",
          "reason": "High engagement with interactive elements",
          "impact": "positive"
        },
        {
          "change": "shorter_text_blocks",
          "reason": "Lower engagement with long text",
          "impact": "positive"
        }
      ],
      "content_suggestions": [
        {
          "type": "lesson",
          "id": "lesson_quantum_basics",
          "reason": "Address weak topic with simplified approach"
        },
        {
          "type": "practice_quiz",
          "id": "quiz_mechanics_advanced",
          "reason": "Leverage strength in mechanics"
        }
      ]
    }
  }
}
```

### 7.4 Adaptive Coach Agent - Learning Path Optimization
```yaml
POST /ai/adaptive-coach/optimize-path
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "user_id": "usr_abc123",
  "course_id": "course_jee_physics_001",
  "current_progress": {
    "completed_lessons": 45,
    "current_chapter": "Thermodynamics",
    "recent_scores": [78, 85, 72, 91],
    "time_spent_per_lesson": 35,
    "difficulty_comfort": "intermediate"
  },
  "goals": {
    "target_exam_date": "2026-04-15",
    "target_score": 85,
    "daily_study_time": 120,
    "priority_topics": ["Mechanics", "Electricity"]
  },
  "constraints": {
    "available_time_per_day": 150,
    "preferred_study_slots": ["morning", "evening"],
    "break_preferences": "every_45_minutes"
  }
}

Response (200):
{
  "success": true,
  "data": {
    "optimization_id": "opt_abc123",
    "generated_at": "2025-07-15T13:15:00Z",
    "optimized_path": {
      "total_duration_days": 275,
      "completion_probability": 0.89,
      "estimated_final_score": 87,
      "path_efficiency": 0.92
    },
    "weekly_schedule": [
      {
        "week": 1,
        "focus": "Complete Thermodynamics",
        "daily_plans": [
          {
            "day": "Monday",
            "sessions": [
              {
                "time_slot": "09:00-10:30",
                "activity": "lesson",
                "content_id": "lesson_089",
                "estimated_duration": 45,
                "difficulty": "intermediate"
              },
              {
                "time_slot": "19:00-20:00",
                "activity": "practice",
                "content_id": "quiz_thermodynamics_002",
                "estimated_duration": 30
              }
            ],
            "daily_goals": ["Complete heat transfer lesson", "Score >80% in practice quiz"],
            "break_schedule": ["10:30-10:45", "19:45-20:00"]
          }
        ],
        "weekly_goals": ["Master thermodynamics concepts", "Achieve 85% average in chapter"],
        "assessment": {
          "id": "test_thermodynamics_final",
          "scheduled_for": "Friday"
        }
      }
    ],
    "adaptive_features": {
      "difficulty_adjustment": {
        "current_level": "intermediate",
        "next_adjustment_trigger": "3_consecutive_scores_below_70",
        "adjustment_strategy": "reduce_difficulty_gradually"
      },
      "pace_adjustment": {
        "current_pace": "optimal",
        "monitoring_metrics": ["time_per_lesson", "comprehension_rate"],
        "adjustment_triggers": ["falling_behind_schedule", "too_fast_progression"]
      },
      "content_personalization": {
        "learning_style_adaptations": ["more_visual_content", "interactive_simulations"],
        "weakness_focus": ["quantum_physics_simplified", "extra_practice_problems"],
        "strength_leveraging": ["advanced_mechanics_problems", "peer_tutoring_opportunities"]
      }
    },
    "milestone_tracking": {
      "short_term": [
        {
          "milestone": "Complete Thermodynamics",
          "target_date": "2025-07-22",
          "progress_required": "6_lessons_and_1_test"
        }
      ],
      "medium_term": [
        {
          "milestone": "Complete Electricity & Magnetism",
          "target_date": "2025-09-15",
          "progress_required": "25_lessons_and_3_tests"
        }
      ],
      "long_term": [
        {
          "milestone": "Course Completion",
          "target_date": "2026-03-15",
          "progress_required": "all_remaining_content"
        }
      ]
    },
    "optimization_rationale": {
      "schedule_reasoning": "Based on user's peak performance times and attention span",
      "content_sequencing": "Arranged to build upon previous knowledge and address weak areas",
      "difficulty_progression": "Gradual increase to maintain challenge without overwhelming",
      "time_allocation": "Balanced between new content and revision based on retention patterns"
    }
  },
  "message": "Learning path optimized successfully"
}
```

## 8. Community API

### 8.1 Create Study Group
```yaml
POST /community/groups
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "name": "JEE Physics Masters",
  "description": "Group for serious JEE aspirants focusing on Physics",
  "course_id": "course_jee_physics_001",
  "group_type": "study_group",
  "privacy": "public",
  "max_members": 25,
  "requirements": {
    "minimum_progress": 20,
    "target_exam": "JEE_MAIN_2026"
  },
  "rules": [
    "Respectful communication only",
    "Share resources freely",
    "Help others with doubts",
    "No spam or irrelevant content"
  ],
  "meeting_schedule": {
    "frequency": "weekly",
    "day": "Sunday",
    "time": "19:00",
    "duration": 90
  }
}

Response (201):
{
  "success": true,
  "data": {
    "group_id": "group_abc123",
    "name": "JEE Physics Masters",
    "description": "Group for serious JEE aspirants focusing on Physics",
    "creator_id": "usr_abc123",
    "created_at": "2025-07-15T14:00:00Z",
    "member_count": 1,
    "group_code": "JPM2025",
    "join_link": "https://app.aarambhai.com/groups/join/JPM2025",
    "status": "active",
    "features_enabled": [
      "group_chat",
      "file_sharing",
      "study_sessions",
      "leaderboard",
      "collaborative_notes"
    ]
  },
  "message": "Study group created successfully"
}
```

### 8.2 Join Study Group
```yaml
POST /community/groups/{group_id}/join
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "join_message": "Hi! I'm preparing for JEE 2026 and would love to join this physics study group. Currently at 25% progress in the course."
}

Response (200):
{
  "success": true,
  "data": {
    "group_id": "group_abc123",
    "membership_id": "member_xyz789",
    "joined_at": "2025-07-15T14:30:00Z",
    "member_role": "member",
    "approval_status": "approved",
    "welcome_message": "Welcome to JEE Physics Masters! Glad to have you aboard.",
    "group_info": {
      "current_members": 8,
      "recent_activity": "Daily physics problem solving",
      "upcoming_events": [
        {
          "event": "Group Study Session",
          "date": "2025-07-21T19:00:00Z",
          "topic": "Thermodynamics Review"
        }
      ]
    }
  },
  "message": "Successfully joined the study group"
}
```

### 8.3 Get Group Messages
```yaml
GET /community/groups/{group_id}/messages
Authorization: Bearer <access_token>

Query Parameters:
- limit: integer (default: 50)
- before: string (message_id for pagination)
- after: string (message_id for pagination)
- message_type: string (text, file, study_session, announcement)

Response (200):
{
  "success": true,
  "data": {
    "group_id": "group_abc123",
    "messages": [
      {
        "message_id": "msg_001",
        "sender": {
          "user_id": "usr_def456",
          "name": "Sarah Kumar",
          "avatar": "https://storage.blob.core.windows.net/avatars/usr_def456.jpg",
          "role": "member"
        },
        "content": {
          "type": "text",
          "text": "Can someone help me understand the concept of entropy in thermodynamics?",
          "mentions": [],
          "attachments": []
        },
        "timestamp": "2025-07-15T15:30:00Z",
        "reactions": [
          {
            "emoji": "👍",
            "count": 3,
            "users": ["usr_abc123", "usr_ghi789", "usr_jkl012"]
          }
        ],
        "replies": [
          {
            "reply_id": "reply_001",
            "sender": {
              "user_id": "usr_abc123",
              "name": "John Doe"
            },
            "content": {
              "type": "text",
              "text": "Sure! Entropy is a measure of disorder in a system. Think of it as..."
            },
            "timestamp": "2025-07-15T15:35:00Z"
          }
        ],
        "is_pinned": false,
        "edited_at": null
      },
      {
        "message_id": "msg_002",
        "sender": {
          "user_id": "usr_abc123",
          "name": "John Doe",
          "role": "creator"
        },
        "content": {
          "type": "file",
          "text": "Sharing thermodynamics formula sheet for tomorrow's test",
          "attachments": [
            {
              "file_id": "file_thermo_001",
              "filename": "thermodynamics_formulas.pdf",
              "file_type": "pdf",
              "file_size": 2048576,
              "download_url": "https://storage.blob.core.windows.net/group-files/thermodynamics_formulas.pdf"
            }
          ]
        },
        "timestamp": "2025-07-15T16:00:00Z",
        "reactions": [
          {
            "emoji": "🙏",
            "count": 5,
            "users": ["usr_def456", "usr_ghi789", "usr_jkl012", "usr_mno345", "usr_pqr678"]
          }
        ],
        "is_pinned": true
      }
    ],
    "pagination": {
      "has_more": true,
      "next_cursor": "msg_050",
      "total_count": 127
    },
    "group_info": {
      "name": "JEE Physics Masters",
      "member_count": 8,
      "online_members": 3
    }
  }
}
```

### 8.4 Send Group Message
```yaml
POST /community/groups/{group_id}/messages
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "content": {
    "type": "text",
    "text": "Great explanation @john! I have a follow-up question about reversible processes.",
    "mentions": ["usr_abc123"],
    "reply_to": "msg_001"
  }
}

Response (201):
{
  "success": true,
  "data": {
    "message_id": "msg_new_001",
    "group_id": "group_abc123",
    "sender_id": "usr_def456",
    "content": {
      "type": "text",
      "text": "Great explanation @john! I have a follow-up question about reversible processes.",
      "mentions": ["usr_abc123"],
      "reply_to": "msg_001"
    },
    "timestamp": "2025-07-15T16:15:00Z",
    "status": "sent",
    "notifications_sent": ["usr_abc123"]
  },
  "message": "Message sent successfully"
}
```

## 9. Analytics and Reports API

### 9.1 Get User Progress Report
```yaml
GET /analytics/users/{user_id}/progress
Authorization: Bearer <access_token>

Query Parameters:
- time_period: string (7d, 30d, 90d, 1y, all)
- courses: array (optional course IDs)
- format: string (summary, detailed)

Response (200):
{
  "success": true,
  "data": {
    "user_id": "usr_abc123",
    "report_period": "30d",
    "generated_at": "2025-07-15T17:00:00Z",
    "overall_summary": {
      "total_study_time_hours": 45.5,
      "lessons_completed": 67,
      "assessments_taken": 12,
      "average_score": 78.5,
      "courses_active": 2,
      "streak_days": 15,
      "knowledge_improvement": 23.5
    },
    "course_wise_progress": [
      {
        "course_id": "course_jee_physics_001",
        "course_title": "JEE Main Physics",
        "enrollment_date": "2025-06-15T00:00:00Z",
        "progress_percentage": 43.2,
        "lessons_completed": 45,
        "total_lessons": 156,
        "time_spent_hours": 28.5,
        "current_chapter": "Thermodynamics",
        "performance_metrics": {
          "average_lesson_score": 82.3,
          "average_assessment_score": 76.8,
          "improvement_trend": "increasing",
          "consistency_score": 0.84
        },
        "milestones_achieved": [
          {
            "milestone": "Mechanics Master",
            "achieved_at": "2025-07-01T00:00:00Z",
            "description": "Completed all mechanics lessons with >80% average"
          }
        ],
        "predicted_completion": "2025-11-15T00:00:00Z",
        "risk_factors": [
          {
            "factor": "slow_progress_in_quantum_physics",
            "severity": "medium",
            "recommendation": "Additional practice sessions recommended"
          }
        ]
      }
    ],
    "learning_analytics": {
      "study_patterns": {
        "most_active_hours": ["09:00-11:00", "19:00-21:00"],
        "most_active_days": ["Monday", "Wednesday", "Sunday"],
        "average_session_duration": 35,
        "preferred_content_types": ["video", "interactive"],
        "break_frequency": "every_45_minutes"
      },
      "performance_trends": {
        "score_progression": [
          {"week": 1, "average_score": 65},
          {"week": 2, "average_score": 71},
          {"week": 3, "average_score": 76},
          {"week": 4, "average_score": 78}
        ],
        "time_efficiency": {
          "trend": "improving",
          "current_rate": "1.2_lessons_per_hour",
          "target_rate": "1.5_lessons_per_hour"
        },
        "knowledge_retention": {
          "short_term": 0.89,
          "medium_term": 0.76,
          "long_term": 0.68,
          "retention_strategy": "spaced_repetition_recommended"
        }
      },
      "strengths_and_weaknesses": {
        "strong_areas": [
          {
            "topic": "Classical Mechanics",
            "proficiency": 0.92,
            "evidence": "Consistent high scores in related assessments"
          },
          {
            "topic": "Thermodynamics",
            "proficiency": 0.85,
            "evidence": "Quick comprehension and good problem-solving"
          }
        ],
        "improvement_areas": [
          {
            "topic": "Quantum Physics",
            "proficiency": 0.58,
            "evidence": "Multiple attempts needed, lower assessment scores",
            "recommendations": [
              "Review fundamental concepts",
              "Additional practice problems",
              "Consider peer tutoring"
            ]
          }
        ]
      }
    },
    "goals_tracking": {
      "set_goals": [
        {
          "goal_id": "goal_001",
          "description": "Complete JEE Physics course by December 2025",
          "target_date": "2025-12-15T00:00:00Z",
          "progress": 0.432,
          "status": "on_track",
          "milestones": [
            {
              "milestone": "Complete Mechanics",
              "status": "completed",
              "completed_at": "2025-07-01T00:00:00Z"
            },
            {
              "milestone": "Master Thermodynamics",
              "status": "in_progress",
              "target_date": "2025-08-15T00:00:00Z",
              "progress": 0.75
            }
          ]
        }
      ],
      "auto_generated_goals": [
        {
          "goal": "Improve Quantum Physics proficiency to 75%",
          "reason": "Current weak area identified",
          "suggested_actions": ["Additional study time", "Practice problems", "Concept review"],
          "estimated_time": "3 weeks"
        }
      ]
    },
    "recommendations": {
      "immediate": [
        {
          "type": "study_focus",
          "action": "Spend extra 30 minutes on quantum physics concepts",
          "priority": "high",
          "estimated_impact": "significant_improvement"
        }
      ],
      "weekly": [
        {
          "type": "schedule_adjustment",
          "action": "Add revision session every Friday",
          "priority": "medium",
          "estimated_impact": "better_retention"
        }
      ],
      "monthly": [
        {
          "type": "assessment",
          "action": "Take comprehensive mock test",
          "priority": "high",
          "estimated_impact": "performance_validation"
        }
      ]
    }
  }
}
```

### 9.2 Get Course Analytics
```yaml
GET /analytics/courses/{course_id}
Authorization: Bearer <access_token>

Query Parameters:
- time_period: string (7d, 30d, 90d, 1y)
- metrics: array (enrollment, completion, performance, engagement)

Response (200):
{
  "success": true,
  "data": {
    "course_id": "course_jee_physics_001",
    "course_title": "JEE Main Physics Complete Course",
    "analytics_period": "30d",
    "generated_at": "2025-07-15T17:30:00Z",
    "enrollment_metrics": {
      "total_enrolled": 15420,
      "new_enrollments_period": 234,
      "enrollment_trend": "increasing",
      "conversion_rate": 0.067,
      "refund_rate": 0.023,
      "enrollment_by_plan": {
        "monthly": 89,
        "quarterly": 98,
        "annual": 47
      }
    },
    "engagement_metrics": {
      "active_learners": 12456,
      "daily_active_users": 3420,
      "average_session_duration": 42,
      "lesson_completion_rate": 0.743,
      "assessment_participation_rate": 0.651,
      "community_participation": 0.234,
      "content_ratings": {
        "average": 4.6,
        "distribution": {
          "5_star": 0.68,
          "4_star": 0.24,
          "3_star": 0.06,
          "2_star": 0.015,
          "1_star": 0.005
        }
      }
    },
    "performance_metrics": {
      "overall_completion_rate": 0.672,
      "average_course_score": 74.8,
      "assessment_pass_rate": 0.834,
      "improvement_rate": 18.7,
      "time_to_completion": {
        "average_days": 145,
        "median_days": 132,
        "fastest": 67,
        "slowest": 298
      }
    },
    "content_analytics": {
      "most_popular_lessons": [
        {
          "lesson_id": "lesson_001",
          "title": "Introduction to Mechanics",
          "view_count": 14890,
          "completion_rate": 0.94,
          "average_rating": 4.8
        },
        {
          "lesson_id": "lesson_045",
          "title": "Newton's Laws Application",
          "view_count": 13245,
          "completion_rate": 0.87,
          "average_rating": 4.7
        }
      ],
      "challenging_content": [
        {
          "lesson_id": "lesson_134",
          "title": "Quantum Mechanics Introduction",
          "completion_rate": 0.52,
          "average_attempts": 2.3,
          "dropout_rate": 0.18
        }
      ],
      "content_effectiveness": {
        "video_lessons": {
          "engagement_rate": 0.89,
          "completion_rate": 0.82
        },
        "interactive_content": {
          "engagement_rate": 0.94,
          "completion_rate": 0.91
        },
        "text_based": {
          "engagement_rate": 0.67,
          "completion_rate": 0.71
        }
      }
    },
    "learner_segmentation": {
      "by_performance": {
        "high_performers": {
          "percentage": 0.25,
          "characteristics": ["consistent_study", "high_engagement", "community_active"],
          "average_score": 89.2
        },
        "average_performers": {
          "percentage": 0.55,
          "characteristics": ["regular_study", "moderate_engagement"],
          "average_score": 74.1
        },
        "struggling_learners": {
          "percentage": 0.20,
          "characteristics": ["irregular_study", "low_completion"],
          "average_score": 58.3,
          "intervention_needed": true
        }
      },
      "by_study_pattern": {
        "intensive_learners": 0.30,
        "steady_learners": 0.45,
        "sporadic_learners": 0.25
      }
    },
    "predictive_insights": {
      "completion_predictions": {
        "likely_to_complete": 0.68,
        "at_risk_of_dropout": 0.15,
        "intervention_candidates": 0.17
      },
      "performance_forecasts": {
        "expected_improvement": 12.5,
        "predicted_satisfaction": 4.5
      }
    }
  }
}
```

## 10. Subscription and Payment API

### 10.1 Get Subscription Plans
```yaml
GET /subscriptions/plans
Authorization: Bearer <access_token> (optional)

Query Parameters:
- course_id: string (optional)
- category: string (optional)

Response (200):
{
  "success": true,
  "data": {
    "plans": [
      {
        "plan_id": "plan_jee_physics_monthly",
        "course_id": "course_jee_physics_001",
        "plan_name": "JEE Physics Monthly",
        "description": "Monthly access to complete JEE Physics course",
        "duration_days": 30,
        "price": {
          "amount": 499,
          "currency": "INR",
          "display_price": "₹499"
        },
        "features": [
          "Full course access",
          "All multimedia content",
          "Practice tests and quizzes",
          "Progress tracking",
          "Community access",
          "Mobile app access"
        ],
        "limitations": [
          "No offline downloads",
          "Standard support"
        ],
        "popular": false,
        "savings": null
      },
      {
        "plan_id": "plan_jee_physics_annual",
        "course_id": "course_jee_physics_001",
        "plan_name": "JEE Physics Annual",
        "description": "Full year access with premium features",
        "duration_days": 365,
        "price": {
          "amount": 3999,
          "currency": "INR",
          "display_price": "₹3,999",
          "monthly_equivalent": 333,
          "original_price": 5988,
          "discount_percentage": 33
        },
        "features": [
          "Full course access",
          "All multimedia content",
          "Unlimited practice tests",
          "Advanced analytics",
          "Priority community access",
          "Offline downloads",
          "1-on-1 doubt sessions",
          "Mock exam series",
          "Priority support"
        ],
        "limitations": [],
        "popular": true,
        "savings": {
          "amount": 1989,
          "percentage": 33,
          "comparison": "vs monthly plan"
        },
        "bonus_features": [
          "Free mock test series (Worth ₹999)",
          "Bonus revision materials"
        ]
      }
    ],
    "current_offers": [
      {
        "offer_id": "summer_2025",
        "title": "Summer Learning Offer",
        "description": "Get 25% off on annual plans",
        "discount_percentage": 25,
        "valid_until": "2025-08-31T23:59:59Z",
        "applicable_plans": ["plan_jee_physics_annual"],
        "coupon_code": "SUMMER25"
      }
    ],
    "payment_methods": [
      "credit_card",
      "debit_card",
      "upi",
      "net_banking",
      "razorpay_wallet"
    ]
  }
}
```

### 10.2 Create Subscription
```yaml
POST /subscriptions
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "plan_id": "plan_jee_physics_annual",
  "payment_method": "razorpay",
  "coupon_code": "SUMMER25",
  "billing_address": {
    "name": "John Doe",
    "address_line_1": "123 Main Street",
    "address_line_2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "country": "India"
  }
}

Response (201):
{
  "success": true,
  "data": {
    "subscription_id": "sub_abc123",
    "plan_id": "plan_jee_physics_annual",
    "user_id": "usr_abc123",
    "course_id": "course_jee_physics_001",
    "status": "pending_payment",
    "billing_cycle": "annual",
    "pricing": {
      "base_amount": 3999,
      "discount_applied": 1000,
      "coupon_discount": 0,
      "final_amount": 2999,
      "currency": "INR",
      "tax_amount": 539,
      "total_payable": 3538
    },
    "payment_details": {
      "payment_id": "pay_xyz789",
      "payment_method": "razorpay",
      "payment_url": "https://razorpay.com/payment/pay_xyz789",
      "expires_at": "2025-07-15T18:30:00Z"
    },
    "subscription_period": {
      "start_date": "2025-07-15T00:00:00Z",
      "end_date": "2026-07-15T00:00:00Z",
      "days_remaining": 365
    },
    "features_unlocked": [
      "full_course_access",
      "offline_downloads",
      "priority_support",
      "doubt_sessions",
      "mock_tests"
    ],
    "next_steps": [
      "Complete payment within 30 minutes",
      "Download mobile app for offline access",
      "Join course community"
    ]
  },
  "message": "Subscription created successfully. Please complete payment."
}
```

### 10.3 Get Subscription Status
```yaml
GET /subscriptions/{subscription_id}
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "subscription_id": "sub_abc123",
    "user_id": "usr_abc123",
    "course_id": "course_jee_physics_001",
    "plan_details": {
      "plan_id": "plan_jee_physics_annual",
      "plan_name": "JEE Physics Annual",
      "billing_cycle": "annual"
    },
    "status": "active",
    "subscription_period": {
      "start_date": "2025-07-15T00:00:00Z",
      "end_date": "2026-07-15T00:00:00Z",
      "days_remaining": 365,
      "auto_renewal": true
    },
    "payment_history": [
      {
        "payment_id": "pay_xyz789",
        "amount": 3538,
        "currency": "INR",
        "status": "completed",
        "payment_date": "2025-07-15T17:45:00Z",
        "payment_method": "razorpay",
        "invoice_url": "https://storage.blob.core.windows.net/invoices/inv_abc123.pdf"
      }
    ],
    "features": {
      "enabled": [
        "full_course_access",
        "offline_downloads", 
        "priority_support",
        "doubt_sessions",
        "mock_tests",
        "community_access"
      ],
      "usage": {
        "offline_downloads": {
          "used": 12,
          "limit": 50
        },
        "doubt_sessions": {
          "used": 2,
          "limit": 10
        }
      }
    },
    "renewal_info": {
      "next_billing_date": "2026-07-15T00:00:00Z",
      "renewal_amount": 3999,
      "auto_renewal_enabled": true,
      "renewal_reminder_sent": false
    },
    "cancellation_info": {
      "can_cancel": true,
      "cancellation_policy": "Cancel anytime. Refund available within 7 days.",
      "refund_eligible": true,
      "refund_amount": 3538
    }
  }
}
```

### 10.4 Cancel Subscription
```yaml
POST /subscriptions/{subscription_id}/cancel
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "cancellation_reason": "financial_constraints",
  "feedback": "Great course but can't afford right now",
  "immediate_cancellation": false
}

Response (200):
{
  "success": true,
  "data": {
    "subscription_id": "sub_abc123",
    "cancellation_id": "cancel_def456",
    "status": "cancelled",
    "cancellation_details": {
      "cancelled_at": "2025-07-15T18:00:00Z",
      "cancelled_by": "usr_abc123",
      "reason": "financial_constraints",
      "immediate": false,
      "access_until": "2026-07-15T00:00:00Z"
    },
    "refund_info": {
      "eligible": true,
      "amount": 3538,
      "processing_time": "5-7 business days",
      "refund_id": "refund_ghi789",
      "status": "processing"
    },
    "data_retention": {
      "progress_data": "retained_for_90_days",
      "course_access": "removed_after_subscription_period",
      "downloads": "removed_immediately"
    },
    "reactivation": {
      "available": true,
      "discount_offer": "25% off on next subscription",
      "valid_until": "2025-10-15T00:00:00Z"
    }
  },
  "message": "Subscription cancelled successfully"
}
```

## 11. Notification API

### 11.1 Get User Notifications
```yaml
GET /notifications
Authorization: Bearer <access_token>

Query Parameters:
- type: string (lesson_reminder, achievement, community, assessment, system)
- status: string (unread, read, all)
- limit: integer (default: 20)
- offset: integer (default: 0)

Response (200):
{
  "success": true,
  "data": {
    "notifications": [
      {
        "notification_id": "notif_001",
        "type": "achievement",
        "title": "New Achievement Unlocked!",
        "message": "Congratulations! You've completed 50 lessons in Physics.",
        "data": {
          "achievement_id": "achieve_50_lessons",
          "achievement_name": "Learning Streak Master",
          "badge_url": "https://storage.blob.core.windows.net/badges/50_lessons.png",
          "course_id": "course_jee_physics_001"
        },
        "priority": "medium",
        "status": "unread",
        "created_at": "2025-07-15T16:30:00Z",
        "expires_at": null,
        "action_required": false,
        "actions": [
          {
            "type": "view_achievement",
            "label": "View Achievement",
            "url": "/achievements/achieve_50_lessons"
          }
        ]
      },
      {
        "notification_id": "notif_002",
        "type": "lesson_reminder",
        "title": "Continue Your Learning Journey",
        "message": "You haven't studied today. Complete your next lesson to maintain your streak!",
        "data": {
          "streak_days": 14,
          "next_lesson": {
            "lesson_id": "lesson_090",
            "title": "Radiation Heat Transfer",
            "estimated_duration": 35
          },
          "course_id": "course_jee_physics_001"
        },
        "priority": "high",
        "status": "unread",
        "created_at": "2025-07-15T18:00:00Z",
        "expires_at": "2025-07-15T23:59:59Z",
        "action_required": true,
        "actions": [
          {
            "type": "start_lesson",
            "label": "Start Lesson",
            "url": "/courses/course_jee_physics_001/lessons/lesson_090"
          },
          {
            "type": "reschedule",
            "label": "Reschedule",
            "url": "/schedule/reschedule"
          }
        ]
      }
    ],
    "summary": {
      "total_count": 15,
      "unread_count": 8,
      "by_type": {
        "achievement": 3,
        "lesson_reminder": 4,
        "community": 2,
        "assessment": 1,
        "system": 5
      }
    },
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "has_more": false
    }
  }
}
```

### 11.2 Mark Notification as Read
```yaml
POST /notifications/{notification_id}/read
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "notification_id": "notif_001",
    "status": "read",
    "read_at": "2025-07-15T18:30:00Z"
  },
  "message": "Notification marked as read"
}
```

### 11.3 Update Notification Preferences
```yaml
PUT /notifications/preferences
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "email_notifications": {
    "lesson_reminders": true,
    "achievement_updates": true,
    "community_activity": false,
    "assessment_results": true,
    "course_updates": true,
    "marketing": false
  },
  "push_notifications": {
    "lesson_reminders": true,
    "achievement_updates": true,
    "community_mentions": true,
    "assessment_deadlines": true,
    "system_updates": false
  },
  "sms_notifications": {
    "enabled": false
  },
  "notification_schedule": {
    "quiet_hours": {
      "start": "22:00",
      "end": "08:00"
    },
    "timezone": "Asia/Kolkata",
    "preferred_reminder_time": "19:00"
  }
}

Response (200):
{
  "success": true,
  "data": {
    "preferences_updated": true,
    "updated_at": "2025-07-15T18:45:00Z"
  },
  "message": "Notification preferences updated successfully"
}
```

This completes the comprehensive API specification for AARAMBH AI. The document now includes detailed API endpoints for all major functionalities including authentication, user management, course management, content delivery, assessments, AI agent interactions, community features, analytics, subscriptions, and notifications.

Each endpoint includes:
- Complete request/response schemas
- Authentication requirements
- Query parameters
- Error handling patterns
- Real-world examples with Indian educational context

This specification provides Claude CLI with all the technical details needed to implement the complete AARAMBH AI platform.# AARAMBH AI - Complete API Specification

## 1. API Overview

### 1.1 Base Configuration
- **Base URL**: `https://api.aarambhai.com/v1`
- **Authentication**: Firebase JWT tokens
- **Content-Type**: `application/json`
- **Rate Limiting**: 1000 requests per hour per user
- **API Version**: v1

### 1.2 Common Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2025-07-15T10:30:00Z",
  "request_id": "req_123456789"
}
```

### 1.3 Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2025-07-15T10:30:00Z",
  "request_id": "req_123456789"
}
```

## 2. Authentication API

### 2.1 User Registration
```yaml
POST /auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "age": 16,
  "provider": "email"
}

Response (201):
{
  "success": true,
  "data": {
    "user_id": "usr_abc123",
    "firebase_uid": "firebase_uid_123",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "refresh_token_abc123",
    "expires_in": 3600,
    "user_profile": {
      "email": "user@example.com",
      "name": "John Doe",
      "age": 16,
      "onboarding_completed": false
    }
  },
  "message": "User registered successfully"
}
```

### 2.2 User Login
```yaml
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "provider": "email"
}

Response (200):
{
  "success": true,
  "data": {
    "user_id": "usr_abc123",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "refresh_token_abc123",
    "expires_in": 3600,
    "user_profile": {
      "email": "user@example.com",
      "name": "John Doe",
      "subscription_status": "active",
      "onboarding_completed": true
    }
  }
}
```

### 2.3 OAuth Login (Google/Facebook)
```yaml
POST /auth/oauth
Content-Type: application/json

Request Body:
{
  "provider": "google",
  "oauth_token": "google_oauth_token_123",
  "user_info": {
    "email": "user@gmail.com",
    "name": "John Doe",
    "profile_picture": "https://lh3.googleusercontent.com/..."
  }
}

Response (200):
{
  "success": true,
  "data": {
    "user_id": "usr_def456",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "refresh_token_def456",
    "is_new_user": true
  }
}
```

### 2.4 Token Refresh
```yaml
POST /auth/refresh
Content-Type: application/json
Authorization: Bearer <refresh_token>

Response (200):
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

### 2.5 Logout
```yaml
POST /auth/logout
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 3. User Management API

### 3.1 Get User Profile
```yaml
GET /users/profile
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "user_id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "age": 16,
    "gender": "male",
    "location": "Mumbai, Maharashtra",
    "profile_picture": "https://storage.blob.core.windows.net/profiles/usr_abc123.jpg",
    "academic_info": {
      "board": "CBSE",
      "grade": "11",
      "school": "Delhi Public School",
      "subjects": ["Physics", "Chemistry", "Mathematics"]
    },
    "learning_preferences": {
      "preferred_content_types": ["video", "interactive"],
      "difficulty_level": "intermediate",
      "study_schedule": "evening",
      "learning_style": "visual"
    },
    "subscription": {
      "status": "active",
      "plan": "premium",
      "expires_at": "2025-12-15T00:00:00Z"
    },
    "statistics": {
      "courses_enrolled": 3,
      "lessons_completed": 45,
      "total_study_time": 2340,
      "current_streak": 7
    },
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-07-15T08:45:00Z"
  }
}
```

### 3.2 Update User Profile
```yaml
PUT /users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "name": "John Smith",
  "age": 17,
  "academic_info": {
    "grade": "12",
    "subjects": ["Physics", "Chemistry", "Mathematics", "Biology"]
  },
  "learning_preferences": {
    "preferred_content_types": ["video", "text", "interactive"],
    "difficulty_level": "advanced"
  }
}

Response (200):
{
  "success": true,
  "data": {
    "user_id": "usr_abc123",
    "updated_fields": ["name", "age", "academic_info", "learning_preferences"],
    "updated_at": "2025-07-15T10:45:00Z"
  },
  "message": "Profile updated successfully"
}
```

### 3.3 Upload Profile Picture
```yaml
POST /users/profile/picture
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Request Body:
- profile_picture: <file>

Response (200):
{
  "success": true,
  "data": {
    "profile_picture_url": "https://storage.blob.core.windows.net/profiles/usr_abc123_new.jpg",
    "updated_at": "2025-07-15T10:50:00Z"
  },
  "message": "Profile picture updated successfully"
}
```

### 3.4 Get User Preferences
```yaml
GET /users/preferences
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "notifications": {
      "email_enabled": true,
      "push_enabled": true,
      "sms_enabled": false,
      "reminder_frequency": "daily"
    },
    "privacy": {
      "profile_visibility": "friends",
      "activity_sharing": true,
      "leaderboard_participation": true
    },
    "accessibility": {
      "high_contrast": false,
      "font_size": "medium",
      "audio_descriptions": false,
      "subtitles": true
    },
    "learning": {
      "auto_play_videos": true,
      "skip_known_content": false,
      "adaptive_difficulty": true,
      "gamification": true
    }
  }
}
```

### 3.5 Update User Preferences
```yaml
PUT /users/preferences
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "notifications": {
    "email_enabled": false,
    "reminder_frequency": "weekly"
  },
  "learning": {
    "adaptive_difficulty": false
  }
}

Response (200):
{
  "success": true,
  "message": "Preferences updated successfully"
}
```

## 4. Course Management API

### 4.1 Get Available Courses
```yaml
GET /courses
Authorization: Bearer <access_token> (optional for curiosity platform)

Query Parameters:
- category: string (school, competitive_exam, college, professional)
- level: string (beginner, intermediate, advanced)
- board: string (CBSE, ICSE, state_board)
- grade: string (1-12, undergraduate)
- subject: string (physics, chemistry, mathematics, etc.)
- exam_type: string (JEE, NEET, UPSC, etc.)
- search: string (search query)
- page: integer (default: 1)
- limit: integer (default: 20)
- sort_by: string (popularity, rating, latest, price)

Example: GET /courses?category=competitive_exam&exam_type=JEE&level=intermediate&page=1&limit=10

Response (200):
{
  "success": true,
  "data": {
    "courses": [
      {
        "course_id": "course_jee_physics_001",
        "title": "JEE Main Physics Complete Course",
        "description": "Comprehensive physics preparation for JEE Main with 150+ lessons",
        "category": "competitive_exam",
        "exam_type": "JEE_MAIN",
        "level": "intermediate",
        "duration_days": 365,
        "total_lessons": 156,
        "total_assessments": 45,
        "instructor": "AI Teacher Agent",
        "rating": 4.8,
        "enrolled_students": 15420,
        "pricing": {
          "monthly": 499,
          "quarterly": 1299,
          "annual": 3999,
          "currency": "INR"
        },
        "features": [
          "Multi-modal lessons",
          "Interactive 3D models",
          "Practice tests",
          "Doubt resolution",
          "Progress tracking"
        ],
        "syllabus": {
          "chapters": [
            {
              "chapter_id": "ch_mechanics",
              "title": "Mechanics",
              "topics": ["Kinematics", "Dynamics", "Work Energy Power"],
              "lesson_count": 25,
              "estimated_hours": 40
            },
            {
              "chapter_id": "ch_thermodynamics",
              "title": "Thermodynamics",
              "topics": ["Heat Transfer", "Laws of Thermodynamics"],
              "lesson_count": 18,
              "estimated_hours": 30
            }
          ]
        },
        "prerequisites": ["Class 10 Physics"],
        "thumbnail": "https://storage.blob.core.windows.net/thumbnails/jee_physics.jpg",
        "demo_lesson": "lesson_kinematics_intro",
        "created_at": "2025-01-15T00:00:00Z",
        "updated_at": "2025-07-10T14:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 48,
      "items_per_page": 10,
      "has_next": true,
      "has_previous": false
    },
    "filters": {
      "applied": {
        "category": "competitive_exam",
        "exam_type": "JEE",
        "level": "intermediate"
      },
      "available": {
        "categories": ["school", "competitive_exam", "college"],
        "exam_types": ["JEE", "NEET", "UPSC", "CAT"],
        "levels": ["beginner", "intermediate", "advanced"],
        "subjects": ["physics", "chemistry", "mathematics"]
      }
    }
  }
}
```

### 4.2 Get Course Details
```yaml
GET /courses/{course_id}
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "course_id": "course_jee_physics_001",
    "title": "JEE Main Physics Complete Course",
    "description": "Comprehensive physics preparation for JEE Main examination",
    "detailed_description": "This course covers all topics required for JEE Main Physics...",
    "category": "competitive_exam",
    "exam_type": "JEE_MAIN",
    "level": "intermediate",
    "duration_days": 365,
    "total_lessons": 156,
    "total_assessments": 45,
    "instructor_info": {
      "name": "AI Teacher Agent",
      "specialization": "Physics",
      "experience": "Expert AI with access to vast physics knowledge base"
    },
    "rating": 4.8,
    "review_count": 2340,
    "enrolled_students": 15420,
    "completion_rate": 78.5,
    "pricing": {
      "monthly": 499,
      "quarterly": 1299,
      "annual": 3999,
      "currency": "INR",
      "discount": {
        "type": "early_bird",
        "percentage": 20,
        "valid_until": "2025-08-15T23:59:59Z"
      }
    },
    "detailed_syllabus": {
      "chapters": [
        {
          "chapter_id": "ch_mechanics",
          "title": "Mechanics",
          "description": "Fundamental concepts of motion and forces",
          "position": 1,
          "topics": [
            {
              "topic_id": "topic_kinematics",
              "title": "Kinematics",
              "lessons": [
                {
                  "lesson_id": "lesson_001",
                  "title": "Introduction to Motion",
                  "duration_minutes": 45,
                  "type": "theory",
                  "content_types": ["video", "text", "interactive"],
                  "difficulty": "beginner",
                  "is_free": true
                }
              ]
            }
          ],
          "lesson_count": 25,
          "estimated_hours": 40,
          "assessments": [
            {
              "assessment_id": "quiz_mechanics_001",
              "title": "Mechanics Chapter Test",
              "question_count": 25,
              "duration_minutes": 60,
              "type": "chapter_test"
            }
          ]
        }
      ]
    },
    "learning_outcomes": [
      "Master fundamental physics concepts",
      "Solve JEE Main level problems",
      "Develop problem-solving strategies"
    ],
    "features": [
      "Multi-modal lessons with text, video, and interactive content",
      "3D visualizations and simulations",
      "AI-powered doubt resolution",
      "Adaptive learning path",
      "Progress tracking and analytics",
      "Mock tests and practice papers",
      "Community discussion forums"
    ],
    "system_requirements": {
      "internet_connection": "Required for streaming content",
      "device_compatibility": ["web", "iOS", "Android"],
      "minimum_specs": "2GB RAM, modern browser"
    },
    "sample_content": {
      "demo_lessons": ["lesson_001", "lesson_015"],
      "sample_quiz": "quiz_sample_001"
    },
    "reviews": [
      {
        "user_name": "Student123",
        "rating": 5,
        "comment": "Excellent course with great explanations",
        "date": "2025-07-10T00:00:00Z"
      }
    ],
    "enrollment_info": {
      "is_enrolled": false,
      "can_enroll": true,
      "enrollment_deadline": null,
      "prerequisites_met": true
    },
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-07-10T14:30:00Z"
  }
}
```

### 4.3 Search Courses
```yaml
POST /courses/search
Authorization: Bearer <access_token> (optional)
Content-Type: application/json

Request Body:
{
  "query": "JEE physics mechanics",
  "filters": {
    "category": ["competitive_exam"],
    "level": ["intermediate", "advanced"],
    "price_range": {
      "min": 0,
      "max": 5000
    },
    "duration_range": {
      "min_days": 30,
      "max_days": 365
    },
    "rating_min": 4.0
  },
  "sort": {
    "field": "relevance",
    "order": "desc"
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}

Response (200):
{
  "success": true,
  "data": {
    "query": "JEE physics mechanics",
    "results": [
      {
        "course_id": "course_jee_physics_001",
        "title": "JEE Main Physics Complete Course",
        "relevance_score": 0.95,
        "match_highlights": {
          "title": "JEE Main <highlight>Physics</highlight> Complete Course",
          "description": "Comprehensive physics preparation including <highlight>mechanics</highlight>"
        }
      }
    ],
    "suggestions": [
      "JEE physics thermodynamics",
      "NEET physics mechanics",
      "Class 11 physics"
    ],
    "total_results": 12,
    "search_time_ms": 156
  }
}
```

### 4.4 Enroll in Course
```yaml
POST /courses/{course_id}/enroll
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "plan_type": "quarterly",
  "payment_method": "razorpay",
  "coupon_code": "EARLYBIRD20",
  "target_completion_date": "2025-12-15"
}

Response (201):
{
  "success": true,
  "data": {
    "enrollment_id": "enroll_abc123",
    "course_id": "course_jee_physics_001",
    "user_id": "usr_abc123",
    "plan_type": "quarterly",
    "enrollment_date": "2025-07-15T10:30:00Z",
    "expiry_date": "2025-10-15T23:59:59Z",
    "payment_info": {
      "payment_id": "pay_xyz789",
      "amount_paid": 1039,
      "discount_applied": 260,
      "currency": "INR",
      "payment_status": "completed"
    },
    "access_granted": true,
    "next_steps": [
      "Complete course orientation",
      "Take initial assessment",
      "Set up study schedule"
    ]
  },
  "message": "Successfully enrolled in course"
}
```

### 4.5 Get Enrolled Courses
```yaml
GET /users/courses
Authorization: Bearer <access_token>

Query Parameters:
- status: string (active, completed, expired)
- page: integer
- limit: integer

Response (200):
{
  "success": true,
  "data": {
    "enrolled_courses": [
      {
        "enrollment_id": "enroll_abc123",
        "course_id": "course_jee_physics_001",
        "title": "JEE Main Physics Complete Course",
        "thumbnail": "https://storage.blob.core.windows.net/thumbnails/jee_physics.jpg",
        "enrollment_date": "2025-07-15T10:30:00Z",
        "expiry_date": "2025-10-15T23:59:59Z",
        "status": "active",
        "progress": {
          "completion_percentage": 23.5,
          "lessons_completed": 37,
          "total_lessons": 156,
          "current_chapter": "Thermodynamics",
          "current_lesson": "Heat Transfer Mechanisms",
          "time_spent_minutes": 1245,
          "last_accessed": "2025-07-14T18:30:00Z"
        },
        "performance": {
          "average_score": 78.5,
          "total_assessments_taken": 8,
          "rank": 245,
          "streak_days": 12
        },
        "next_lesson": {
          "lesson_id": "lesson_089",
          "title": "Conduction and Convection",
          "estimated_duration": 35
        }
      }
    ],
    "summary": {
      "total_enrolled": 3,
      "active_courses": 2,
      "completed_courses": 1,
      "total_study_time": 4560,
      "overall_progress": 45.2
    }
  }
}
```

## 5. Content Management API

### 5.1 Get Lesson Content
```yaml
GET /courses/{course_id}/lessons/{lesson_id}
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "lesson_id": "lesson_089",
    "course_id": "course_jee_physics_001",
    "chapter_id": "ch_thermodynamics",
    "title": "Conduction and Convection",
    "description": "Understanding heat transfer mechanisms",
    "position": 89,
    "estimated_duration": 35,
    "difficulty": "intermediate",
    "learning_objectives": [
      "Understand conduction mechanism",
      "Learn about convection process",
      "Solve numerical problems"
    ],
    "prerequisites": ["lesson_088"],
    "content": {
      "text": {
        "sections": [
          {
            "title": "Introduction to Heat Conduction",
            "content": "Heat conduction is the transfer of thermal energy...",
            "subsections": [
              {
                "title": "Fourier's Law",
                "content": "The mathematical expression for heat conduction..."
              }
            ]
          }
        ]
      },
      "multimedia": {
        "videos": [
          {
            "id": "video_conduction_001",
            "title": "Heat Conduction Animation",
            "url": "https://storage.blob.core.windows.net/videos/conduction_animation.mp4",
            "duration": 180,
            "thumbnail": "https://storage.blob.core.windows.net/thumbnails/conduction.jpg",
            "quality": ["480p", "720p", "1080p"],
            "subtitles": ["en", "hi"]
          }
        ],
        "audio": [
          {
            "id": "audio_narration_001",
            "title": "Lesson Narration",
            "url": "https://storage.blob.core.windows.net/audio/lesson_089_narration.mp3",
            "duration": 420,
            "language": "en"
          }
        ],
        "images": [
          {
            "id": "img_conduction_diagram",
            "title": "Conduction Process Diagram",
            "url": "https://storage.blob.core.windows.net/images/conduction_diagram.png",
            "alt_text": "Diagram showing heat conduction through a metal rod",
            "caption": "Heat conduction through a solid material"
          }
        ],
        "interactive_content": [
          {
            "id": "sim_heat_transfer",
            "type": "3d_simulation",
            "title": "Heat Transfer Simulator",
            "url": "https://storage.blob.core.windows.net/interactive/heat_transfer_sim.html",
            "description": "Interactive 3D simulation of heat transfer",
            "controls": ["temperature", "material_type", "thickness"]
          }
        ]
      },
      "assessments": [
        {
          "id": "quiz_conduction_001",
          "type": "inline_quiz",
          "position": "after_section_1",
          "questions": [
            {
              "id": "q_001",
              "type": "multiple_choice",
              "question": "Which law governs heat conduction?",
              "options": [
                "Newton's Law",
                "Fourier's Law",
                "Ohm's Law",
                "Boyle's Law"
              ],
              "correct_answer": 1,
              "explanation": "Fourier's Law describes the rate of heat transfer through conduction"
            }
          ]
        }
      ],
      "downloadable_resources": [
        {
          "id": "pdf_notes_001",
          "title": "Conduction Formula Sheet",
          "type": "pdf",
          "url": "https://storage.blob.core.windows.net/resources/conduction_formulas.pdf",
          "size_mb": 2.5
        }
      ]
    },
    "user_progress": {
      "is_completed": false,
      "progress_percentage": 45,
      "time_spent": 15,
      "last_position": "section_2",
      "bookmarks": ["formula_fourier_law"],
      "notes": [
        {
          "id": "note_001",
          "timestamp": 235,
          "content": "Important: k depends on material properties",
          "created_at": "2025-07-14T18:45:00Z"
        }
      ]
    },
    "metadata": {
      "created_by": "teacher_agent",
      "generated_at": "2025-01-20T10:00:00Z",
      "last_updated": "2025-07-01T14:30:00Z",
      "version": "2.1",
      "content_rating": 4.7,
      "view_count": 15420
    }
  }
}
```

### 5.2 Update Lesson Progress
```yaml
POST /courses/{course_id}/lessons/{lesson_id}/progress
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "progress_percentage": 75,
  "time_spent_seconds": 1800,
  "current_position": "section_3",
  "completed_sections": ["introduction", "section_1", "section_2"],
  "quiz_responses": [
    {
      "question_id": "q_001",
      "selected_answer": 1,
      "time_taken": 15,
      "is_correct": true
    }
  ],
  "notes": [
    {
      "timestamp": 456,
      "content": "Remember: Thermal conductivity varies with temperature"
    }
  ],
  "bookmarks": ["thermal_conductivity_table"],
  "is_completed": false
}

Response (200):
{
  "success": true,
  "data": {
    "lesson_id": "lesson_089",
    "progress_updated": true,
    "new_progress_percentage": 75,
    "total_time_spent": 1860,
    "achievements_unlocked": [
      {
        "id": "achievement_quiz_master",
        "title": "Quiz Master",
        "description": "Answered 10 quiz questions correctly in a row"
      }
    ],
    "next_recommendation": {
      "type": "lesson",
      "id": "lesson_090",
      "title": "Radiation Heat Transfer",
      "reason": "Continue with the next topic in thermodynamics"
    }
  },
  "message": "Progress updated successfully"
}
```

### 5.3 Get Chapter Content
```yaml
GET /courses/{course_id}/chapters/{chapter_id}
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "chapter_id": "ch_thermodynamics",
    "course_id": "course_jee_physics_001",
    "title": "Thermodynamics",
    "description": "Study of heat, work, and energy transformations",
    "position": 5,
    "estimated_hours": 30,
    "learning_objectives": [
      "Understand laws of thermodynamics",
      "Analyze thermodynamic processes",
      "Solve complex problems"
    ],
    "lessons": [
      {
        "lesson_id": "lesson_088",
        "title": "Introduction to Thermodynamics",
        "duration": 40,
        "type": "theory",
        "difficulty": "beginner",
        "is_completed": true,
        "score": 85
      },
      {
        "lesson_id": "lesson_089",
        "title": "Conduction and Convection",
        "duration": 35,
        "type": "theory",
        "difficulty": "intermediate",
        "is_completed": false,
        "progress": 75
      }
    ],
    "assessments": [
      {
        "assessment_id": "test_thermodynamics_001",
        "title": "Thermodynamics Chapter Test",
        "type": "chapter_test",
        "question_count": 25,
        "duration": 60,
        "max_score": 100,
        "is_attempted": false,
        "unlock_criteria": {
          "lessons_completed": 15,
          "current_completed": 12
        }
      }
    ],
    "progress_summary": {
      "completion_percentage": 67,
      "lessons_completed": 12,
      "total_lessons": 18,
      "average_score": 78.5,
      "time_spent_hours": 8.5,
      "estimated_time_remaining": 6.2
    },
    "prerequisites": {
      "completed": ["ch_heat_and_temperature"],
      "required": []
    },
    "resources": [
      {
        "id": "resource_thermodynamics_001",
        "title": "Thermodynamics Formula Sheet",
        "type": "pdf",
        "description": "Complete formula reference for thermodynamics"
      }
    ]
  }
}
```

## 6. Assessment API

### 6.1 Get Assessment Details
```yaml
GET /assessments/{assessment_id}
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "assessment_id": "test_thermodynamics_001",
    "course_id": "course_jee_physics_001",
    "chapter_id": "ch_thermodynamics",
    "title": "Thermodynamics Chapter Test",
    "description": "Comprehensive test covering all thermodynamics topics",
    "type": "chapter_test",
    "difficulty": "intermediate",
    "question_count": 25,
    "duration_minutes": 60,
    "max_score": 100,
    "passing_score": 60,
    "attempts_allowed": 3,
    "instructions": [
      "Read each question carefully",
      "All questions are mandatory",
      "No negative marking",
      "You can review answers before submission"
    ],
    "syllabus_coverage": [
      "Laws of Thermodynamics",
      "Heat Transfer",
      "Thermodynamic Processes",
      "Entropy and Enthalpy"
    ],
    "question_distribution": {
      "easy": 8,
      "medium": 12,
      "hard": 5
    },
    "sample_questions": [
      {
        "id": "sample_q_001",
        "type": "multiple_choice",
        "question": "What is the first law of thermodynamics?",
        "options": [
          "Energy cannot be created or destroyed",
          "Entropy always increases",
          "Heat flows from hot to cold",
          "Work is path dependent"
        ],
        "difficulty": "easy"
      }
    ],
    "user_status": {
      "is_unlocked": true,
      "attempts_taken": 0,
      "best_score": null,
      "last_attempt": null,
      "can_attempt": true,
      "unlock_requirements_met": true
    },
    "statistics": {
      "total_attempts": 8420,
      "average_score": 72.3,
      "pass_rate": 78.5,
      "average_time_taken": 52
    },
    "created_at": "2025-01-20T00:00:00Z",
    "updated_at": "2025-07-01T00:00:00Z"
  }
}
```

### 6.2 Start Assessment
```yaml
POST /assessments/{assessment_id}/start
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "session_id": "session_abc123",
    "assessment_id": "test_thermodynamics_001",
    "started_at": "2025-07-15T11:00:00Z",
    "expires_at": "2025-07-15T12:00:00Z",
    "questions": [
      {
        "id": "q_001",
        "question_number": 1,
        "type": "multiple_choice",
        "question_text": "What is the first law of thermodynamics?",
        "options": [
          {
            "id": "opt_a",
            "text": "Energy cannot be created or destroyed"
          },
          {
            "id": "opt_b", 
            "text": "Entropy always increases"
          },
          {
            "id": "opt_c",
            "text": "Heat flows from hot to cold"
          },
          {
            "id": "opt_d",
            "text": "Work is path dependent"
          }
        ],
        "marks": 4,
        "difficulty": "easy",
        "image": null,
        "hint": "Think about energy conservation"
      }
    ],
    "navigation": {
      "can_navigate_freely": true,
      "can_review": true,
      "auto_submit": true
    },
    "time_remaining": 3600
  },
  "message": "Assessment started successfully"
}
```

### 6.3 Submit Answer
```yaml
POST /assessments/sessions/{session_id}/answers
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
  "question_id": "q_001",
  "answer": "opt_a",
  "time_taken_seconds": 45,
  "is_final": false
}

Response (200):
{
  "success": true,
  "data": {
    "question_id": "q_001",
    "answer_saved": true,
    "is_correct": null,
    "time_remaining": 3555,
    "progress": {
      "answered": 1,
      "total": 25,
      "percentage": 4
    }
  },
  "message": "Answer saved successfully"
}
```

### 6.4 Submit Assessment
```yaml
POST /assessments/sessions/{session_id}/submit
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "session_id": "session_abc123",
    "assessment_id": "test_thermodynamics_001",
    "submitted_at": "2025-07-15T11:45:00Z",
    "time_taken_minutes