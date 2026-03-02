import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { showMessage } from 'react-native-flash-message';
import { Platform } from 'react-native';

//const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.3:8000/api';  
// for local
//const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://13.49.244.26:8000/api';
//  for live
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://13.238.194.235/api';

class ApiService {
  public api: AxiosInstance;

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

  private async getStoredToken() {
    if (Platform.OS === 'web') {
      return localStorage.getItem('outvier_session');
    }
    try {
      return await SecureStore.getItemAsync('outvier_session');
    } catch {
      return null;
    }
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        try {
          let sessionId = await AsyncStorage.getItem('sessionId');
          if (!sessionId) {
            sessionId = await this.getStoredToken();
          }

          if (sessionId) {
            config.headers['Authorization'] = `Bearer ${sessionId}`;
            if (Platform.OS !== 'web') {
              config.headers['X-Session-ID'] = sessionId;
            }
          }
        } catch (error) {
          console.error('Failed to get session ID:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.multiRemove(['user', 'sessionId']);
          if (Platform.OS === 'web') {
            localStorage.removeItem('outvier_session');
          } else {
            await SecureStore.deleteItemAsync('outvier_session').catch(() => {});
          }

          showMessage({
            message: 'Session expired. Please login again.',
            type: 'warning',
            duration: 4000,
          });
        } else if (error.response?.status >= 500) {
          showMessage({
            message: 'Server error. Please try again later.',
            type: 'danger',
            duration: 4000,
          });
        } else if (!error.response) {
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

  // --- Auth Endpoints ---
  async login(credentials: { username: string; password: string }) {
    try {
      const response = await this.post('/auth/login/', credentials);
      if (response.data.sessionid) {
        this.api.defaults.headers.common['Authorization'] = `Bearer ${response.data.sessionid}`;
      }
      return response.data;
    } catch (error) {
      console.log('Login failed:', error);
      throw error;
    }
  }

  async register(data: any) { return this.post('/auth/register/', data); }
  async logout() { return this.post('/auth/logout/'); }
  async forgotPassword(email: string) { return this.post('/auth/forgot-password/', { email }); }
  async resetPassword(token: string, password: string, confirmPassword: string) {
    return this.post('/auth/reset-password/', { token, password, confirm_password: confirmPassword });
  }
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.post('/auth/change-password/', { current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword });
  }
  async getCurrentUser() { return this.get('/auth/me/'); }
  async updateProfile(data: any) { return this.patch('/auth/profile/', data); }

  // --- Flashcards / Goals Endpoints (NEW & UPDATED) ---
  async getGoals() {
    return this.get('/projects/goals/'); 
  }

  async createGoal(data: { title: string; description?: string; deadline: string }) {
    return this.post('/projects/goals/', data);
  }

  async updateGoalStatus(goalId: number, isCompleted: boolean) {
    return this.patch(`/projects/goals/${goalId}/`, {
      is_completed: isCompleted,
    });
  }

  async updateGoalProgress(goalId: number, progress: number) {
    return this.post(`/outvier/goals/${goalId}/update_progress/`, {
      progress_percentage: progress,
    });
  }

  // --- Profiles & Assessments ---
  async getProfile() { return this.get('/outvier/profiles/my_profile/'); }
  async completeAssessment(data: any) { return this.post('/outvier/profiles/complete_assessment/', data); }
  async findMatches(data: any) { return this.post('/outvier/matches/find_matches/', data); }
  async acceptMatch(matchId: number) { return this.post(`/outvier/matches/${matchId}/accept_match/`); }

  // --- Pathways & Insights ---
  async getPathways() { return this.get('/outvier/pathways/'); }
  async getRecommendedPathways() { return this.post('/outvier/pathways/recommend_pathways/'); }
  async getInsights() { return this.get('/outvier/insights/'); }
  async markInsightAsRead(insightId: number) { return this.post(`/outvier/insights/${insightId}/mark_read/`); }

  // --- Dashboards ---
  async getDashboard() { return this.get('/outvier/dashboard/my_dashboard/'); }
  async getAnalytics() { return this.get('/outvier/dashboard/analytics/'); }

  // --- Projects Endpoints ---
  async getProjects(params?: any) { return this.get('/projects/', { params }); }
  async getProject(id: number) { return this.get(`/projects/${id}/`); }
  async createProject(data: any) { return this.post('/projects/', data); }
  async applyToProject(projectId: number, data: any) { return this.post(`/projects/${projectId}/apply/`, data); }

  // --- Events Endpoints ---
  async getEvents(params?: any) { return this.get('/events/', { params }); }
  async getEvent(id: number) { return this.get(`/events/${id}/`); }
  async registerForEvent(eventId: number, data?: any) { return this.post(`/events/${eventId}/register/`, data); }

  // --- Community & Forum ---
  async getCommunityMembers(params?: any) { return this.get('/community/members/', { params }); }
  async getMemberProfile(userId: number) { return this.get(`/community/members/${userId}/`); }
  async sendConnectionRequest(userId: number, data?: any) { return this.post(`/community/members/${userId}/connect/`, data); }
  async getForumCategories() { return this.get('/forum/categories/'); }
  async getForumTopics(categoryId?: number, params?: any) {
    const url = categoryId ? `/forum/categories/${categoryId}/topics/` : '/forum/topics/';
    return this.get(url, { params });
  }
  async getTopic(id: number) { return this.get(`/forum/topics/${id}/`); }
  async createTopic(data: any) { return this.post('/forum/topics/', data); }
  async createPost(topicId: number, data: any) { return this.post(`/forum/topics/${topicId}/posts/`, data); }

  // --- Matches Endpoints ---
  async getMatches(params?: any) { return this.get('/outvier/matches/', { params }); }
  async getMatch(id: number) { return this.get(`/outvier/matches/${id}/`); }
  async rejectMatch(matchId: number, data?: any) { return this.post(`/outvier/matches/${matchId}/reject/`, data); }
}

export const apiService = new ApiService();

// Export goalService separately for clean use in Flashcards screen
export const goalService = {
  getGoals: () => apiService.getGoals(),
  createGoal: (data: any) => apiService.createGoal(data),
  updateGoalStatus: (id: number, completed: boolean) => apiService.updateGoalStatus(id, completed),
};