'use client';

import { useMemo, useState } from 'react';
import { Plus, X, Target, Clock, CheckCircle2, Save } from 'lucide-react';
import clsx from 'clsx';
import type { GoalTimer } from '@/shared/hooks/useGoalTimers';
import { useGoalTimersPreferences } from '@/features/Preferences';

interface GoalTimersPanelProps {
  goals: GoalTimer[];
  currentSeconds: number;
  onAddGoal: (goal: Omit<GoalTimer, 'id' | 'reached'>) => void;
  onRemoveGoal: (goalId: string) => void;
  onClearGoals: () => void;
  disabled?: boolean;
}

export default function GoalTimersPanel({
  goals,
  currentSeconds,
  onAddGoal,
  onRemoveGoal,
  onClearGoals,
  disabled = false,
}: GoalTimersPanelProps) {
  // Get templates from store
  const { templates, addTemplate, settings } = useGoalTimersPreferences();

  // Component state for adding goals
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [newGoalMinutes, setNewGoalMinutes] = useState(5);
  const [newGoalSeconds, setNewGoalSeconds] = useState(0);

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Add a goal timer
  const handleAddGoal = () => {
    if (!newGoalLabel.trim()) return;

    const totalSeconds = newGoalMinutes * 60 + newGoalSeconds;
    if (totalSeconds <= 0) return;

    onAddGoal({
      label: newGoalLabel,
      targetSeconds: totalSeconds,
      showAnimation: settings.defaultShowAnimation,
      playSound: settings.defaultPlaySound,
    });

    // Reset form
    setNewGoalLabel('');
    setNewGoalMinutes(5);
    setNewGoalSeconds(0);
    setIsAdding(false);
  };

  // Save current goal as a template
  const handleSaveAsTemplate = () => {
    if (!newGoalLabel.trim()) return;

    const totalSeconds = newGoalMinutes * 60 + newGoalSeconds;
    if (totalSeconds <= 0) return;

    // Add to store as custom template
    addTemplate({
      label: newGoalLabel,
      targetSeconds: totalSeconds,
      category: 'custom',
      icon: '⏱️',
      color: 'var(--main-color)',
    });

    // Also add as active goal
    handleAddGoal();
  };

  // Add goal from template
  const handleAddFromTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    onAddGoal({
      label: template.label,
      targetSeconds: template.targetSeconds,
      showAnimation: settings.defaultShowAnimation,
      playSound: settings.defaultPlaySound,
      templateId: template.id,
    });
  };

  // Get default templates for quick add
  const defaultTemplates = useMemo(
    () =>
      templates.filter(t => settings.defaultTemplates.includes(t.id)),
    [templates, settings.defaultTemplates],
  );
  const customTemplates = useMemo(
    () => templates.filter(t => t.category === 'custom'),
    [templates],
  );

  return (
    <div
      className={clsx(
        'rounded-2xl border-2 p-4',
        'border-(--border-color) bg-(--card-color)',
      )}
    >
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Target className='h-5 w-5 text-(--main-color)' />
          <h3 className='font-semibold text-(--main-color)'>
            Goal Timers
          </h3>
        </div>
        {goals.length > 0 && (
          <button
            onClick={onClearGoals}
            disabled={disabled}
            className={clsx(
              'text-xs transition-colors',
              'text-(--secondary-color) hover:text-(--main-color)',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Goals List */}
      <div className='mb-4 space-y-2'>
        {goals.length === 0 && !isAdding && (
          <p className='py-4 text-center text-sm text-(--secondary-color)'>
            No goals set. Add one to get started!
          </p>
        )}

        {goals.map(goal => {
          const progress = Math.min(
            (currentSeconds / goal.targetSeconds) * 100,
            100,
          );
          const isReached = goal.reached;

          return (
            <div
              key={goal.id}
              className={clsx(
                'rounded-xl border-2 p-3 transition-all',
                isReached
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-(--border-color) bg-(--card-color)',
              )}
            >
              <div className='mb-2 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  {isReached ? (
                    <CheckCircle2 className='h-4 w-4 text-green-500' />
                  ) : (
                    <Clock className='h-4 w-4 text-(--main-color)' />
                  )}
                  <span
                    className={clsx(
                      'font-medium',
                      isReached ? 'text-green-500' : 'text-(--main-color)',
                    )}
                  >
                    {goal.label}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-(--secondary-color)'>
                    {formatTime(goal.targetSeconds)}
                  </span>
                  <button
                    onClick={() => onRemoveGoal(goal.id)}
                    disabled={disabled}
                    className={clsx(
                      'transition-colors',
                      'text-(--secondary-color) hover:text-red-500',
                      disabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {!isReached && (
                <div className='h-1.5 w-full rounded-full bg-(--border-color)'>
                  <div
                    className='h-1.5 rounded-full bg-(--main-color) transition-all duration-300'
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Goal Form */}
      {isAdding ? (
        <div
          className={clsx(
            'space-y-3 rounded-xl border-2 p-3',
            'border-(--border-color) bg-(--card-color)',
          )}
        >
          <input
            type='text'
            placeholder='Goal name (e.g., Warm-up)'
            value={newGoalLabel}
            onChange={e => setNewGoalLabel(e.target.value)}
            className={clsx(
              'w-full rounded-lg border-2 px-3 py-2',
              'border-(--border-color) bg-(--card-color)',
              'text-(--main-color) placeholder:text-(--secondary-color)',
            )}
            autoFocus
          />

          <div className='flex gap-2'>
            <div className='flex-1'>
              <label className='mb-1 block text-xs text-(--secondary-color)'>
                Minutes
              </label>
              <input
                type='number'
                min='0'
                max='59'
                value={newGoalMinutes}
                onChange={e => setNewGoalMinutes(parseInt(e.target.value) || 0)}
                className={clsx(
                  'w-full rounded-lg border-2 px-3 py-2',
                  'border-(--border-color) bg-(--card-color)',
                  'text-(--main-color)',
                )}
              />
            </div>
            <div className='flex-1'>
              <label className='mb-1 block text-xs text-(--secondary-color)'>
                Seconds
              </label>
              <input
                type='number'
                min='0'
                max='59'
                value={newGoalSeconds}
                onChange={e => setNewGoalSeconds(parseInt(e.target.value) || 0)}
                className={clsx(
                  'w-full rounded-lg border-2 px-3 py-2',
                  'border-(--border-color) bg-(--card-color)',
                  'text-(--main-color)',
                )}
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={handleAddGoal}
              className={clsx(
                'flex-1 rounded-lg px-4 py-2 transition-opacity',
                'bg-(--main-color) text-(--bg-color)',
                'hover:opacity-90',
              )}
            >
              Add Goal
            </button>
            <button
              onClick={handleSaveAsTemplate}
              className={clsx(
                'rounded-lg border-2 px-4 py-2 transition-colors',
                'border-(--border-color)',
                'hover:bg-(--border-color)',
                'flex items-center gap-2',
              )}
              title='Save as template and add goal'
            >
              <Save className='h-4 w-4' />
              Save
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className={clsx(
                'rounded-lg border-2 px-4 py-2 transition-colors',
                'border-(--border-color)',
                'hover:bg-(--border-color)',
              )}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Add from Default Templates */}
          {goals.length === 0 && defaultTemplates.length > 0 && (
            <div className='mb-3'>
              <p className='mb-2 text-xs text-(--secondary-color)'>
                Quick add:
              </p>
              <div className='flex flex-wrap gap-2'>
                {defaultTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleAddFromTemplate(template.id)}
                    disabled={disabled}
                    className={clsx(
                      'rounded-lg border-2 px-3 py-2 text-sm transition-colors',
                      'border-(--border-color)',
                      'hover:bg-(--border-color)',
                      disabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <span className='mr-1'>{template.icon}</span>
                    {template.label}
                    <span className='ml-1 text-xs text-(--secondary-color)'>
                      ({Math.floor(template.targetSeconds / 60)}m)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Templates */}
          {customTemplates.length > 0 && (
            <div className='mb-3'>
              <p className='mb-2 text-xs text-(--secondary-color)'>
                Your templates:
              </p>
              <div className='flex flex-wrap gap-2'>
                {customTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleAddFromTemplate(template.id)}
                    disabled={disabled}
                    className={clsx(
                      'rounded-lg border-2 px-3 py-2 text-sm transition-colors',
                      'border-(--border-color)',
                      'hover:bg-(--border-color)',
                      disabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <span className='mr-1'>{template.icon}</span>
                    {template.label}
                    <span className='ml-1 text-xs text-(--secondary-color)'>
                      ({Math.floor(template.targetSeconds / 60)}m)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setIsAdding(true)}
            disabled={disabled}
            className={clsx(
              'w-full rounded-lg border-2 border-dashed px-4 py-2 transition-colors',
              'border-(--border-color)',
              'hover:bg-(--border-color)',
              'flex items-center justify-center gap-2',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <Plus className='h-4 w-4' />
            <span>Add Goal Timer</span>
          </button>
        </>
      )}
    </div>
  );
}
