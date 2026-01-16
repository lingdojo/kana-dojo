import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Goal Timer Template - Predefined or custom timer goals
 */
export interface GoalTemplate {
  id: string;
  label: string;
  targetSeconds: number;
  category: 'workout' | 'productivity' | 'pomodoro' | 'study' | 'custom';
  icon?: string;
  color?: string;
}

/**
 * Achievement record when a goal is reached
 */
export interface GoalAchievement {
  goalId: string;
  goalLabel: string;
  achievedAt: Date;
  duration: number;
  context?: string; // e.g., "Kana Timed Challenge"
}

/**
 * Goal Timers Settings
 */
export interface GoalTimersSettings {
  defaultShowAnimation: boolean;
  defaultPlaySound: boolean;
  soundVolume: number;
  defaultTemplates: string[]; // IDs of default templates to show
}

/**
 * Goal Timers Store State
 */
export interface GoalTimersStore {
  // Templates
  templates: GoalTemplate[];

  // History
  history: GoalAchievement[];

  // Settings
  settings: GoalTimersSettings;

  // Template Actions
  addTemplate: (template: Omit<GoalTemplate, 'id'>) => string;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<GoalTemplate>) => void;
  getTemplate: (id: string) => GoalTemplate | undefined;

  // History Actions
  addToHistory: (achievement: Omit<GoalAchievement, 'id'>) => void;
  clearHistory: () => void;
  getHistoryByGoal: (goalId: string) => GoalAchievement[];

  // Settings Actions
  updateSettings: (settings: Partial<GoalTimersSettings>) => void;

  // Stats
  getTotalAchievements: () => number;
  getMostUsedTemplate: () => GoalTemplate | undefined;
}

/**
 * Default templates that come with the app
 */
const DEFAULT_TEMPLATES: GoalTemplate[] = [
  {
    id: 'warmup-1m',
    label: 'Warm-up',
    targetSeconds: 60,
    category: 'workout',
    icon: '🔥',
    color: '#f59e0b'
  },
  {
    id: 'sprint-5m',
    label: 'Sprint',
    targetSeconds: 300,
    category: 'workout',
    icon: '⚡',
    color: '#3b82f6'
  },
  {
    id: 'focus-10m',
    label: 'Focus Block',
    targetSeconds: 600,
    category: 'productivity',
    icon: '🎯',
    color: '#8b5cf6'
  },
  {
    id: 'pomodoro-25m',
    label: 'Pomodoro',
    targetSeconds: 1500,
    category: 'pomodoro',
    icon: '🍅',
    color: '#ef4444'
  },
  {
    id: 'break-5m',
    label: 'Short Break',
    targetSeconds: 300,
    category: 'pomodoro',
    icon: '☕',
    color: '#10b981'
  },
  {
    id: 'study-30m',
    label: 'Study Session',
    targetSeconds: 1800,
    category: 'study',
    icon: '📚',
    color: '#6366f1'
  }
];

/**
 * Default settings
 */
const DEFAULT_SETTINGS: GoalTimersSettings = {
  defaultShowAnimation: true,
  defaultPlaySound: true,
  soundVolume: 50,
  defaultTemplates: ['warmup-1m', 'sprint-5m', 'focus-10m']
};

/**
 * Zustand store for Goal Timers with persistence
 */
export const useGoalTimersStore = create<GoalTimersStore>()(
  persist(
    (set, get) => ({
      // Initial state
      templates: DEFAULT_TEMPLATES,
      history: [],
      settings: DEFAULT_SETTINGS,

      // Template Actions
      addTemplate: template => {
        const id = `custom-${crypto.randomUUID()}`;
        const newTemplate: GoalTemplate = {
          ...template,
          id,
          category: template.category || 'custom'
        };

        set(state => ({
          templates: [...state.templates, newTemplate]
        }));

        return id;
      },

      removeTemplate: id => {
        set(state => ({
          templates: state.templates.filter(t => t.id !== id)
        }));
      },

      updateTemplate: (id, updates) => {
        set(state => ({
          templates: state.templates.map(t =>
            t.id === id ? { ...t, ...updates } : t
          )
        }));
      },

      getTemplate: id => {
        return get().templates.find(t => t.id === id);
      },

      // History Actions
      addToHistory: achievement => {
        const newAchievement: GoalAchievement = {
          ...achievement,
          achievedAt: new Date()
        };

        set(state => ({
          history: [newAchievement, ...state.history]
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      getHistoryByGoal: goalId => {
        return get().history.filter(h => h.goalId === goalId);
      },

      // Settings Actions
      updateSettings: newSettings => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      // Stats
      getTotalAchievements: () => {
        return get().history.length;
      },

      getMostUsedTemplate: () => {
        const history = get().history;
        const templates = get().templates;

        if (history.length === 0) return undefined;

        // Count achievements by goal ID
        const counts: Record<string, number> = {};
        history.forEach(achievement => {
          counts[achievement.goalId] = (counts[achievement.goalId] || 0) + 1;
        });

        // Find most used goal ID
        const mostUsedId = Object.entries(counts).reduce((a, b) =>
          b[1] > a[1] ? b : a
        )[0];

        // Return the template
        return templates.find(t => t.id === mostUsedId);
      }
    }),
    {
      name: 'kanadojo-goal-timers', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist templates, history, and settings
      partialize: state => ({
        templates: state.templates,
        history: state.history,
        settings: state.settings
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | Partial<GoalTimersStore>
          | undefined;

        return {
          ...currentState,
          templates: persisted?.templates ?? DEFAULT_TEMPLATES,
          history: persisted?.history ?? [],
          settings: {
            ...DEFAULT_SETTINGS,
            ...(persisted?.settings || {}),
            // Ensure array has default if missing from persisted state
            defaultTemplates:
              persisted?.settings?.defaultTemplates ??
              DEFAULT_SETTINGS.defaultTemplates
          }
        };
      }
    }
  )
);

export default useGoalTimersStore;
