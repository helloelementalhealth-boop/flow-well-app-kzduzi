
import Constants from 'expo-constants';

// Get backend URL from app.json configuration
export const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || '';

// Log the backend URL for debugging
console.log('[API] Backend URL configured:', BACKEND_URL);

// Type definitions for journal entries
export type Mood = 'calm' | 'energized' | 'reflective' | 'restless' | 'grateful' | 'uncertain';

export interface JournalEntry {
  id: string;
  content: string;
  mood?: Mood;
  energy?: number;
  intention?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalEntryInput {
  content: string;
  mood?: Mood;
  energy?: number;
  intention?: string;
}

export interface UpdateJournalEntryInput {
  content?: string;
  mood?: Mood;
  energy?: number;
  intention?: string;
}

// API helper function with error handling
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  console.log(`[API] ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error ${response.status}:`, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[API] Success:`, data);
    return data;
  } catch (error) {
    console.error('[API] Request failed:', error);
    throw error;
  }
}

// Journal API functions
export const journalApi = {
  // Get all journal entries
  async getEntries(): Promise<JournalEntry[]> {
    return apiCall<JournalEntry[]>('/api/journal/entries', {
      method: 'GET',
    });
  },

  // Create a new journal entry
  async createEntry(input: CreateJournalEntryInput): Promise<JournalEntry> {
    return apiCall<JournalEntry>('/api/journal/entries', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  // Get a single journal entry by ID
  async getEntry(id: string): Promise<JournalEntry> {
    return apiCall<JournalEntry>(`/api/journal/entries/${id}`, {
      method: 'GET',
    });
  },

  // Update a journal entry
  async updateEntry(id: string, input: UpdateJournalEntryInput): Promise<JournalEntry> {
    return apiCall<JournalEntry>(`/api/journal/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  // Delete a journal entry
  async deleteEntry(id: string): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>(`/api/journal/entries/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}), // Empty body to avoid FST_ERR_CTP_EMPTY_JSON_BODY
    });
  },
};
