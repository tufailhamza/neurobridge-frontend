import { env } from '@/config/env';

export interface ContentPreferencesRequest {
  user_id: number;
  role: string;
  content_preferences: string[];
}

export interface ContentPreferencesResponse {
  message: string;
  user_id: number;
  role: string;
  content_preferences: string[];
}

export const preferencesApi = {
  /**
   * Update content preferences for a user
   */
  async updateContentPreferences(
    user_id: number,
    role: string,
    content_preferences: string[]
  ): Promise<ContentPreferencesResponse> {
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      throw new Error('No access token found');
    }

    const response = await fetch(`${env.BACKEND_URL}/preferences/content/${user_id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        role,
        content_preferences
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('Access forbidden. Please check your permissions.');
      } else if (response.status === 404) {
        throw new Error('User not found.');
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Invalid request data.');
      } else {
        throw new Error(`Failed to update content preferences: ${response.status}`);
      }
    }

    return await response.json();
  }
};
