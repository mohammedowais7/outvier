export interface PersonalProfile {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  personality_type?: string;
  communication_style?: string;
  work_preference?: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  growth_areas: string[];
  leadership_score: number;
  technical_score: number;
  creativity_score: number;
  collaboration_score: number;
  is_complete: boolean;
  last_updated: string;
  created_at: string;
}

export interface GoalMilestone {
  id: number;
  title: string;
  description: string;
  target_date: string;
  completed_date?: string;
  is_completed: boolean;
  created_at: string;
}

export interface Goal {
  id: number;
  user: number;
  title: string;
  description: string;
  goal_type: 'personal' | 'professional' | 'skill' | 'project' | 'network' | 'learning' | 'fitness' | 'financial';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string;
  target_date: string;
  completed_date?: string;
  progress_percentage: number;
  is_completed: boolean;
  related_skills: number[];
  related_skills_names: string[];
  related_project?: number;
  related_project_title?: string;
  related_pathway?: number;
  related_pathway_title?: string;
  milestones: GoalMilestone[];
  days_remaining: number;
  is_overdue: boolean;
  progress_status: 'completed' | 'overdue' | 'urgent' | 'almost_done' | 'on_track';
  target_value?: number;
  current_value?: number;
  unit?: string;
  is_public: boolean;
  allow_mentorship: boolean;
  reminder_frequency: 'daily' | 'weekly' | 'monthly' | 'none';
  time_spent: number;
  last_activity?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMatch {
  id: number;
  user: number;
  match_type: 'project' | 'mentorship' | 'peer_learning' | 'skill_exchange';
  matched_users: number[];
  matched_users_names: string[];
  required_skills: number[];
  required_skills_names: string[];
  preferred_roles: string[];
  project_categories: number[];
  project_categories_names: string[];
  compatibility_score: number;
  is_active: boolean;
  is_accepted: boolean;
  accepted_at?: string;
  match_reason: string;
  suggested_roles: string[];
  created_at: string;
  updated_at: string;
}

export interface GrowthPathway {
  id: number;
  user: number;
  title: string;
  description: string;
  pathway_type: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  required_skills: number[];
  required_skills_names: string[];
  recommended_projects: number[];
  recommended_projects_titles: string[];
  learning_resources: string[];
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressInsight {
  id: number;
  user: number;
  insight_type: 'progress' | 'achievement' | 'recommendation';
  title: string;
  message: string;
  related_goal?: number;
  related_goal_title?: string;
  related_match?: number;
  related_pathway?: number;
  related_pathway_title?: string;
  confidence_score: number;
  is_positive: boolean;
  is_read: boolean;
  created_at: string;
}

export interface ProgressSummary {
  total_goals: number;
  completed_goals: number;
  goal_completion_rate: number;
  total_pathways: number;
  completed_pathways: number;
  pathway_completion_rate: number;
}

export interface DashboardData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile: PersonalProfile;
  active_goals: Goal[];
  recent_matches: TeamMatch[];
  current_pathways: GrowthPathway[];
  recent_insights: ProgressInsight[];
  progress_summary: ProgressSummary;
}

export interface AnalyticsData {
  goals: {
    total_goals: number;
    completed_goals: number;
    overdue_goals: number;
    upcoming_deadlines: number;
  };
  matches: {
    total_matches: number;
    accepted_matches: number;
    active_matches: number;
  };
  pathways: {
    total_pathways: number;
    completed_pathways: number;
    in_progress_pathways: number;
  };
}

export interface AssessmentData {
  personality_type: string;
  communication_style: string;
  work_preference: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  growth_areas: string[];
  leadership_score: number;
  technical_score: number;
  creativity_score: number;
  collaboration_score: number;
}

export interface MatchRequest {
  preferred_roles: string[];
  match_type: 'project' | 'mentorship' | 'peer_learning' | 'skill_exchange';
}

export interface PathwayStep {
  id: number;
  pathway: number;
  step_number: number;
  title: string;
  description: string;
  step_type: 'reading' | 'video' | 'exercise' | 'quiz' | 'project' | 'discussion';
  content_url?: string;
  estimated_duration: number;
  prerequisites: number[];
  prerequisites_titles: string[];
  is_completed: boolean;
  completed_at?: string;
  completion_notes?: string;
  has_quiz: boolean;
  passing_score: number;
  created_at: string;
  updated_at: string;
}

export interface LearningProgress {
  id: number;
  user: number;
  pathway_step: number;
  pathway_step_title: string;
  started_at: string;
  completed_at?: string;
  time_spent: number;
  quiz_score?: number;
  quiz_attempts: number;
  difficulty_rating?: number;
  helpfulness_rating?: number;
  notes?: string;
}

export interface Achievement {
  id: number;
  user: number;
  achievement_type: 'goal_completion' | 'pathway_completion' | 'milestone_reached' | 'streak_achieved' | 'skill_mastered' | 'community_contributor';
  title: string;
  description: string;
  icon_name: string;
  related_goal?: number;
  related_goal_title?: string;
  related_pathway?: number;
  related_pathway_title?: string;
  points_earned: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  created_at: string;
}

export interface LearningStreak {
  id: number;
  user: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  target_streak: number;
  streak_goal_achieved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user: number;
  notification_type: 'goal_reminder' | 'goal_deadline' | 'goal_milestone' | 'pathway_reminder' | 'pathway_step' | 'achievement_unlocked' | 'streak_reminder' | 'streak_broken' | 'match_found' | 'insight_available' | 'system_update';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  related_goal?: number;
  related_goal_title?: string;
  related_pathway?: number;
  related_pathway_title?: string;
  related_achievement?: number;
  related_achievement_title?: string;
  related_match?: number;
  is_read: boolean;
  is_sent: boolean;
  sent_at?: string;
  action_url?: string;
  action_text?: string;
  scheduled_for?: string;
  expires_at?: string;
  created_at: string;
}

export interface NotificationPreference {
  id: number;
  user: number;
  goal_reminders: boolean;
  goal_deadlines: boolean;
  goal_milestones: boolean;
  pathway_reminders: boolean;
  pathway_steps: boolean;
  achievements: boolean;
  streak_reminders: boolean;
  streak_broken: boolean;
  matches: boolean;
  insights: boolean;
  system_updates: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  reminder_frequency: 'immediate' | 'daily' | 'weekly' | 'custom';
  created_at: string;
  updated_at: string;
}

export interface NotificationSchedule {
  id: number;
  user: number;
  notification_type: string;
  title_template: string;
  message_template: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time_of_day: string;
  days_of_week: number[];
  days_of_month: number[];
  is_active: boolean;
  start_date: string;
  end_date?: string;
  related_goal?: number;
  related_goal_title?: string;
  related_pathway?: number;
  related_pathway_title?: string;
  created_at: string;
  updated_at: string;
}
