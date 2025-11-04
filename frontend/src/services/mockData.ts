import { PathwayStep, GrowthPathway } from '../types/outvier';

// Mock pathway steps data
export const mockPathwaySteps: PathwayStep[] = [
  {
    id: 1,
    pathway: 1,
    step_number: 1,
    title: "Introduction to React Native",
    description: "Learn the fundamentals of React Native development, including components, props, and state management. This step covers the basics you need to start building mobile apps.",
    step_type: "video",
    content_url: "https://example.com/react-native-intro",
    estimated_duration: 45,
    prerequisites: [],
    is_completed: false,
    completed_at: null,
    completion_notes: "",
    has_quiz: true,
    passing_score: 70,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    pathway: 1,
    step_number: 2,
    title: "Setting Up Development Environment",
    description: "Configure your development environment with React Native CLI, Android Studio, and Xcode. Learn about debugging tools and best practices.",
    step_type: "tutorial",
    content_url: "https://example.com/setup-environment",
    estimated_duration: 60,
    prerequisites: [1],
    is_completed: false,
    completed_at: null,
    completion_notes: "",
    has_quiz: false,
    passing_score: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 3,
    pathway: 1,
    step_number: 3,
    title: "Building Your First App",
    description: "Create a simple todo app to practice React Native concepts. Learn about navigation, styling, and user interactions.",
    step_type: "project",
    content_url: "https://example.com/first-app",
    estimated_duration: 90,
    prerequisites: [1, 2],
    is_completed: false,
    completed_at: null,
    completion_notes: "",
    has_quiz: true,
    passing_score: 80,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 4,
    pathway: 1,
    step_number: 4,
    title: "State Management with Redux",
    description: "Learn how to manage complex application state using Redux. Understand actions, reducers, and the Redux store.",
    step_type: "video",
    content_url: "https://example.com/redux-tutorial",
    estimated_duration: 75,
    prerequisites: [3],
    is_completed: false,
    completed_at: null,
    completion_notes: "",
    has_quiz: true,
    passing_score: 75,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 5,
    pathway: 1,
    step_number: 5,
    title: "API Integration and Data Fetching",
    description: "Learn how to fetch data from APIs, handle loading states, and implement error handling in React Native apps.",
    step_type: "tutorial",
    content_url: "https://example.com/api-integration",
    estimated_duration: 50,
    prerequisites: [4],
    is_completed: false,
    completed_at: null,
    completion_notes: "",
    has_quiz: false,
    passing_score: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 6,
    pathway: 1,
    step_number: 6,
    title: "Testing and Debugging",
    description: "Master testing strategies for React Native apps. Learn about unit tests, integration tests, and debugging techniques.",
    step_type: "video",
    content_url: "https://example.com/testing-debugging",
    estimated_duration: 65,
    prerequisites: [5],
    is_completed: false,
    completed_at: null,
    completion_notes: "",
    has_quiz: true,
    passing_score: 70,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 7,
    pathway: 1,
    step_number: 7,
    title: "Performance Optimization",
    description: "Learn techniques to optimize React Native app performance, including image optimization, lazy loading, and memory management.",
    step_type: "tutorial",
    content_url: "https://example.com/performance",
    estimated_duration: 55,
    prerequisites: [6],
    is_completed: false,
    completed_at: null,
    completion_notes: "",
    has_quiz: true,
    passing_score: 75,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 8,
    pathway: 1,
    step_number: 8,
    title: "Publishing Your App",
    description: "Learn how to build and publish your React Native app to the App Store and Google Play Store. Understand the submission process and requirements.",
    step_type: "project",
    content_url: "https://example.com/publishing",
    estimated_duration: 80,
    prerequisites: [7],
    is_completed: false,
    completed_at: null,
    completion_notes: "",
    has_quiz: false,
    passing_score: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
];

// Mock learning content for each step
export const mockLearningContent = {
  1: {
    videoUrl: "https://example.com/videos/react-native-intro.mp4",
    transcript: "Welcome to React Native! In this video, we'll cover the basics of React Native development...",
    resources: [
      "React Native Official Documentation",
      "React Native Tutorial Series",
      "Component Library Examples"
    ],
    quiz: {
      questions: [
        {
          id: 1,
          question: "What is React Native?",
          options: [
            "A JavaScript library for building user interfaces",
            "A framework for building native mobile apps using React",
            "A database management system",
            "A web development framework"
          ],
          correct: 1
        },
        {
          id: 2,
          question: "Which of the following is a core React Native component?",
          options: ["View", "div", "span", "section"],
          correct: 0
        }
      ]
    }
  },
  2: {
    tutorialSteps: [
      "Install Node.js and npm",
      "Install React Native CLI",
      "Set up Android Studio",
      "Configure environment variables",
      "Create your first project"
    ],
    resources: [
      "React Native CLI Documentation",
      "Android Studio Setup Guide",
      "Environment Configuration Tips"
    ]
  },
  3: {
    projectFiles: [
      "App.js - Main application component",
      "components/TodoItem.js - Individual todo item",
      "components/TodoList.js - List of todos",
      "styles.js - Application styles"
    ],
    requirements: [
      "Create a todo list interface",
      "Add new todos",
      "Mark todos as complete",
      "Delete todos",
      "Persist data locally"
    ],
    resources: [
      "React Native Components Guide",
      "Styling Best Practices",
      "Local Storage Tutorial"
    ]
  }
};

// Mock pathway data with realistic progress
export const mockPathway: GrowthPathway = {
  id: 20, // Updated to match the actual pathway ID from database
  user: 1,
  title: "Complete React Native Development",
  description: "Master React Native development from basics to advanced concepts. Build real-world mobile applications and learn industry best practices.",
  pathway_type: "mobile_dev",
  difficulty_level: "intermediate",
  status: "in_progress",
  required_skills: [1, 2, 3],
  required_skills_names: ["JavaScript", "React", "Mobile Development"],
  recommended_projects: [1, 2],
  recommended_projects_titles: ["Todo App", "Weather App"],
  learning_resources: [
    "React Native Official Documentation",
    "Expo Documentation",
    "React Native Community Resources"
  ],
  current_step: 2,
  total_steps: 8,
  progress_percentage: 25, // 2 out of 8 steps completed
  is_completed: false,
  completed_at: null,
  estimated_duration: 14,
  is_public: true,
  allow_collaboration: true,
  total_time_spent: 105, // minutes
  last_activity: "2024-01-15T10:30:00Z",
  completion_rate: 0.25,
  preferred_learning_style: "kinesthetic",
  estimated_completion_date: "2024-02-15T00:00:00Z",
  learning_velocity: 0.5,
  steps: mockPathwaySteps,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-15T10:30:00Z"
};

// Function to get mock steps for a pathway
export const getMockStepsForPathway = (pathwayId: number): PathwayStep[] => {
  // For now, return all mock steps regardless of pathwayId since we're using mock data
  // In a real app, this would filter by the actual pathwayId
  return mockPathwaySteps.map(step => ({
    ...step,
    pathway: pathwayId // Update the pathway ID to match the current pathway
  }));
};

// Function to get mock pathway for a specific ID
export const getMockPathway = (pathwayId: number): GrowthPathway => {
  return {
    ...mockPathway,
    id: pathwayId // Update the pathway ID to match the current pathway
  };
};

// Function to update step completion
export const updateStepCompletion = (stepId: number, completionData: any): PathwayStep | null => {
  const stepIndex = mockPathwaySteps.findIndex(step => step.id === stepId);
  if (stepIndex !== -1) {
    mockPathwaySteps[stepIndex] = {
      ...mockPathwaySteps[stepIndex],
      is_completed: true,
      completed_at: new Date().toISOString(),
      completion_notes: completionData.notes || ""
    };
    return mockPathwaySteps[stepIndex];
  }
  return null;
};

// Function to calculate pathway progress
export const calculatePathwayProgress = (pathwayId: number): number => {
  const steps = getMockStepsForPathway(pathwayId);
  const completedSteps = steps.filter(step => step.is_completed).length;
  return Math.round((completedSteps / steps.length) * 100);
};

// Function to get next available step
export const getNextAvailableStep = (pathwayId: number): PathwayStep | null => {
  const steps = getMockStepsForPathway(pathwayId);
  return steps.find(step => !step.is_completed) || null;
};

// Function to check if step prerequisites are met
export const arePrerequisitesMet = (step: PathwayStep): boolean => {
  if (!step.prerequisites || step.prerequisites.length === 0) {
    return true;
  }
  
  return step.prerequisites.every(prereqId => {
    const prereqStep = mockPathwaySteps.find(s => s.id === prereqId);
    return prereqStep?.is_completed || false;
  });
};
