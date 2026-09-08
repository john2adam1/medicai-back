import { Platform } from 'react-native';
import { AIScenario, ActionResult, PatientStats, VisualState } from '../types/simulation';

// Default localhost config for iOS Simulator / Web, 10.0.2.2 for Android Emulator
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

let customApiUrl: string | null = null;

export const setApiUrl = (url: string) => {
  customApiUrl = url;
};

export const getApiUrl = () => {
  return customApiUrl || DEFAULT_HOST;
};

export async function startScenario(
  topic: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  timeLimitMinutes: number = 30,
  language: string = 'uz'
): Promise<AIScenario> {
  const url = `${getApiUrl()}/start`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      difficulty,
      timeLimitMinutes,
      language,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server xatosi: ${response.status}`);
  }

  return response.json();
}

export async function processAction(params: {
  action: string;
  scenario: AIScenario;
  currentStats: PatientStats;
  currentVisual: VisualState;
  healthBar: number;
  elapsedMinutes: number;
  actionHistory: string[];
  language?: string;
}): Promise<ActionResult> {
  const url = `${getApiUrl()}/action`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...params,
      language: params.language || 'uz',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server xatosi: ${response.status}`);
  }

  return response.json();
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}
