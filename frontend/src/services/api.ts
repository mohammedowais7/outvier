import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';

// Base URL for your Django backend
const BASE_URL = 'https://outvier.duckdns.org/api';
 
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const sessionId = await AsyncStorage.getItem('sessionId');
          if (sessionId) {
            // Send JWT token in Authorization header with Bearer prefix
            config.headers['Authorization'] = `Bearer ${sessionId}`;
            // Also keep the X-Session-ID header for backward compatibility
            config.headers['X-Session-ID'] = sessionId;
          }
        } catch (error) {
          console.error('Failed to get session ID:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear auth data and redirect to login
          await AsyncStorage.multiRemove(['user', 'sessionId']);
          showMessage({
            message: 'Session expired. Please login again.',
            type: 'warning',
            duration: 4000,
          });
        } else if (error.response?.status >= 500) {
          // Server error
          showMessage({
            message: 'Server error. Please try again later.',
            type: 'danger',
            duration: 4000,
          });
        } else if (!error.response) {
          // Network error
          showMessage({
            message: 'Network error. Please check your connection.',
            type: 'danger',
            duration: 4000,
          });
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }

  // Auth endpoints
  async login(credentials: { username: string; password: string }) {
    // The backend expects 'username' field
    const loginData = {
      username: credentials.username,
      password: credentials.password,
    };
    
    console.log('Login attempt with data:', { 
      username: loginData.username,
      hasPassword: !!credentials.password 
    });
    
    return this.post('/auth/login/', loginData);
  }

  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
  }) {
    return this.post('/auth/register/', data);
  }

  async logout() {
    return this.post('/auth/logout/');
  }

  async forgotPassword(email: string) {
    return this.post('/auth/forgot-password/', { email });
  }

  async resetPassword(token: string, password: string, confirmPassword: string) {
    return this.post('/auth/reset-password/', {
      token,
      password,
      confirm_password: confirmPassword,
    });
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.post('/auth/change-password/', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
  }

  async getCurrentUser() {
    return this.get('/auth/me/');
  }

  async updateProfile(data: any) {
    return this.patch('/auth/profile/', data);
  }

  // Outvier endpoints
  async getProfile() {
    return this.get('/outvier/profiles/my_profile/');
  }

  async completeAssessment(data: any) {
    return this.post('/outvier/profiles/complete_assessment/', data);
  }

  async getGoals() {
    return this.get('/outvier/goals/');
  }

  async createGoal(data: any) {
    return this.post('/outvier/goals/', data);
  }

  async updateGoalProgress(goalId: number, progress: number) {
    return this.post(`/outvier/goals/${goalId}/update_progress/`, {
      progress_percentage: progress,
    });
  }


  async findMatches(data: any) {
    return this.post('/outvier/matches/find_matches/', data);
  }

  async acceptMatch(matchId: number) {
    return this.post(`/outvier/matches/${matchId}/accept_match/`);
  }

  async getPathways() {
    return this.get('/outvier/pathways/');
  }

  async getRecommendedPathways() {
    return this.post('/outvier/pathways/recommend_pathways/');
  }

  async getInsights() {
    return this.get('/outvier/insights/');
  }

  async markInsightAsRead(insightId: number) {
    return this.post(`/outvier/insights/${insightId}/mark_read/`);
  }

  async getDashboard() {
    return this.get('/outvier/dashboard/my_dashboard/');
  }

  async getAnalytics() {
    return this.get('/outvier/dashboard/analytics/');
  }

  // Projects endpoints
  async getProjects(params?: any) {
    return this.get('/projects/', { params });
  }

  async getProject(id: number) {
    return this.get(`/projects/${id}/`);
  }

  async createProject(data: any) {
    return this.post('/projects/', data);
  }

  async applyToProject(projectId: number, data: any) {
    return this.post(`/projects/${projectId}/apply/`, data);
  }

  // Events endpoints
  async getEvents(params?: any) {
    return this.get('/events/', { params });
  }

  async getEvent(id: number) {
    return this.get(`/events/${id}/`);
  }

  async registerForEvent(eventId: number, data?: any) {
    return this.post(`/events/${eventId}/register/`, data);
  }

  // Community endpoints
  async getCommunityMembers(params?: any) {
    return this.get('/community/members/', { params });
  }

  async getMemberProfile(userId: number) {
    return this.get(`/community/members/${userId}/`);
  }

  async sendConnectionRequest(userId: number, data?: any) {
    return this.post(`/community/members/${userId}/connect/`, data);
  }

  // Forum endpoints
  async getForumCategories() {
    return this.get('/forum/categories/');
  }

  async getForumTopics(categoryId?: number, params?: any) {
    const url = categoryId ? `/forum/categories/${categoryId}/topics/` : '/forum/topics/';
    return this.get(url, { params });
  }

  // Matches endpoints
  async getMatches(params?: any) {
    return this.get('/outvier/matches/', { params });
  }

  async getMatch(id: number) {
    return this.get(`/outvier/matches/${id}/`);
  }

  async acceptMatch(matchId: number, data?: any) {
    return this.post(`/outvier/matches/${matchId}/accept/`, data);
  }

  async rejectMatch(matchId: number, data?: any) {
    return this.post(`/outvier/matches/${matchId}/reject/`, data);
  }

  async getTopic(id: number) {
    return this.get(`/forum/topics/${id}/`);
  }

  async createTopic(data: any) {
    return this.post('/forum/topics/', data);
  }

  async createPost(topicId: number, data: any) {
    return this.post(`/forum/topics/${topicId}/posts/`, data);
  }
}

export const apiService = new ApiService();
