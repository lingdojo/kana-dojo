'use client';

import { useState } from 'react';
import { Trash2, Plus, Volume2, VolumeX, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import useGoalTimersStore from '@/features/Preferences/store/useGoalTimersStore';

// Settings component for Goal Timers feature
export default function GoalTimers() {
  const {
    templates,
    settings,
    history,
    addTemplate,
    removeTemplate,
    updateSettings,
    getTotalAchievements,
    getMostUsedTemplate,
  } = useGoalTimersStore();

  // Component state for adding new templates
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newMinutes, setNewMinutes] = useState(5);
  const [newIcon, setNewIcon] = useState('⏱️');

  // Get stats
  const totalAchievements = getTotalAchievements();
  const mostUsedTemplate = getMostUsedTemplate();

  // Calculate count for most used template
  const mostUsedCount = mostUsedTemplate
    ? history.filter(h => h.goalId === mostUsedTemplate.id).length
    : 0;

  // Handle volume change (0-100)
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ soundVolume: parseInt(e.target.value) });
  };

  // Toggle sound on/off
  const toggleSound = () => {
    updateSettings({ defaultPlaySound: !settings.defaultPlaySound });
  };

  // Toggle animation on/off
  const toggleAnimation = () => {
    updateSettings({ defaultShowAnimation: !settings.defaultShowAnimation });
  };

  // Add new custom template
  const handleAddTemplate = () => {
    if (!newLabel.trim()) return;

    addTemplate({
      label: newLabel,
      targetSeconds: newMinutes * 60,
      category: 'custom',
      icon: newIcon,
      color: 'var(--main-color)',
    });

    // Reset form
    setNewLabel('');
    setNewMinutes(5);
    setNewIcon('⏱️');
    setIsAdding(false);
  };

  // Toggle template as default (show in quick-add)
  const toggleDefaultTemplate = (templateId: string) => {
    const isDefault = settings.defaultTemplates.includes(templateId);

    if (isDefault) {
      // Remove from defaults
      updateSettings({
        defaultTemplates: settings.defaultTemplates.filter(
          id => id !== templateId,
        ),
      });
    } else {
      // Add to defaults
      updateSettings({
        defaultTemplates: [...settings.defaultTemplates, templateId],
      });
    }
  };

  // Custom templates only (can be deleted)
  const customTemplates = templates.filter(t => t.category === 'custom');

  // Built-in templates (cannot be deleted)
  const builtInTemplates = templates.filter(t => t.category !== 'custom');

  return (
    <div className='flex flex-col gap-6'>
      {/* Statistics */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div
          className={clsx(
            'rounded-xl border-2 p-4',
            'border-(--border-color) bg-(--card-color)',
          )}
        >
          <p className='mb-1 text-sm text-(--secondary-color)'>
            Total Achievements
          </p>
          <p className='text-3xl font-bold text-(--main-color)'>
            {totalAchievements}
          </p>
        </div>

        <div
          className={clsx(
            'rounded-xl border-2 p-4',
            'border-(--border-color) bg-(--card-color)',
          )}
        >
          <p className='mb-1 text-sm text-(--secondary-color)'>
            Most Used Template
          </p>
          <p className='text-xl font-bold text-(--main-color)'>
            {mostUsedTemplate ? (
              <span>
                {mostUsedTemplate.icon} {mostUsedTemplate.label}
              </span>
            ) : (
              'N/A'
            )}
          </p>
          {mostUsedTemplate && (
            <p className='mt-1 text-xs text-(--secondary-color)'>
              {mostUsedCount} times
            </p>
          )}
        </div>

        <div
          className={clsx(
            'rounded-xl border-2 p-4',
            'border-(--border-color) bg-(--card-color)',
          )}
        >
          <p className='mb-1 text-sm text-(--secondary-color)'>
            Recent Activity
          </p>
          <p className='text-xl font-bold text-(--main-color)'>
            {history.length > 0 ? (
              <>Last {Math.min(10, history.length)} achievements</>
            ) : (
              'No activity yet'
            )}
          </p>
        </div>
      </div>

      {/* Audio Settings */}
      <div
        className={clsx(
          'rounded-xl border-2 p-4',
          'border-(--border-color) bg-(--card-color)',
        )}
      >
        <h4 className='mb-4 text-lg font-semibold'>Audio Settings</h4>

        <div className='space-y-4'>
          {/* Sound toggle */}
          <div className='flex items-center justify-between'>
            <label className='text-sm'>Play sound when goal reached</label>
            <button
              onClick={toggleSound}
              aria-label='Toggle play sound'
              className={clsx(
                'h-6 w-12 rounded-full transition-colors',
                settings.defaultPlaySound
                  ? 'bg-(--main-color)'
                  : 'bg-(--border-color)',
              )}
            >
              <div
                className={clsx(
                  'h-5 w-5 rounded-full bg-white transition-transform',
                  settings.defaultPlaySound ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
          </div>

          {/* Volume slider */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <label className='text-sm'>Volume</label>
              <span className='text-sm text-(--secondary-color)'>
                {settings.soundVolume}%
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={toggleSound}
                className='text-(--secondary-color) hover:text-(--main-color)'
              >
                {settings.defaultPlaySound ? (
                  <Volume2 className='h-5 w-5' />
                ) : (
                  <VolumeX className='h-5 w-5' />
                )}
              </button>
              <input
                type='range'
                min='0'
                max='100'
                value={settings.soundVolume}
                onChange={handleVolumeChange}
                disabled={!settings.defaultPlaySound}
                className='flex-1'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Animation Settings */}
      <div
        className={clsx(
          'rounded-xl border-2 p-4',
          'border-(--border-color) bg-(--card-color)',
        )}
      >
        <h4 className='mb-4 text-lg font-semibold'>Visual Settings</h4>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-(--main-color)' />
            <label className='text-sm text-(--secondary-color)'>
              Show confetti animation when goal reached
            </label>
          </div>
          <button
            onClick={toggleAnimation}
            aria-label='Toggle confetti animation'
            className={clsx(
              'h-6 w-12 rounded-full transition-colors hover:cursor-pointer',
              settings.defaultShowAnimation
                ? 'bg-(--main-color)'
                : 'bg-(--border-color)',
            )}
          >
            <div
              className={clsx(
                'h-5 w-5 rounded-full bg-white transition-transform',
                settings.defaultShowAnimation
                  ? 'translate-x-6'
                  : 'translate-x-1',
              )}
            />
          </button>
        </div>
      </div>

      {/* Built-in Templates */}
      <div>
        <h4 className='mb-3 text-lg font-semibold'>Built-in Templates</h4>
        <p className='mb-4 text-sm text-(--secondary-color)'>
          Select which templates appear in quick-add
        </p>

        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          {builtInTemplates.map(template => {
            const isDefault = settings.defaultTemplates.includes(template.id);

            return (
              <button
                key={template.id}
                onClick={() => toggleDefaultTemplate(template.id)}
                className={clsx(
                  'rounded-lg border-2 p-3 text-left transition-colors hover:cursor-pointer',
                  isDefault
                    ? 'bg-opacity-10 border-(--main-color) bg-(--main-color)'
                    : 'border-(--border-color) hover:bg-(--card-color)',
                )}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl'>{template.icon}</span>
                    <div>
                      <p
                        className={clsx(
                          'font-medium',
                          isDefault
                            ? 'text-(--background-color)'
                            : 'text-(--main-color)',
                        )}
                      >
                        {template.label}
                      </p>
                      <p
                        className={clsx(
                          'text-xs',
                          isDefault
                            ? 'text-(--card-color)'
                            : 'text-(--secondary-color)',
                        )}
                      >
                        {Math.floor(template.targetSeconds / 60)} minutes
                      </p>
                    </div>
                  </div>
                  {isDefault && (
                    <span className='text-xs font-medium text-(--card-color)'>
                      Default
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Templates */}
      <div>
        <div className='mb-3 flex items-center justify-between'>
          <h4 className='text-lg font-semibold'>Your Custom Templates</h4>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className={clsx(
                'rounded-lg border-2 px-3 py-1.5 transition-colors hover:cursor-pointer',
                'border-(--border-color)',
                'hover:bg-(--border-color)',
                'flex items-center gap-2',
              )}
            >
              <Plus className='h-4 w-4' />
              New Template
            </button>
          )}
        </div>

        {/* Add template form */}
        {isAdding && (
          <div
            className={clsx(
              'mb-4 rounded-xl border-2 p-4',
              'border-(--border-color) bg-(--card-color)',
            )}
          >
            <div className='space-y-3'>
              <div className='flex gap-3'>
                <input
                  type='text'
                  placeholder='Emoji icon (e.g., 📚)'
                  value={newIcon}
                  onChange={e => setNewIcon(e.target.value)}
                  maxLength={2}
                  className={clsx(
                    'w-20 rounded-lg border-2 px-3 py-2 text-center text-2xl',
                    'border-(--border-color) bg-(--card-color)',
                  )}
                />
                <input
                  type='text'
                  placeholder='Template name'
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  className={clsx(
                    'flex-1 rounded-lg border-2 px-3 py-2',
                    'border-(--border-color) bg-(--card-color)',
                    'text-(--main-color)',
                  )}
                  autoFocus
                />
              </div>

              <div className='flex items-center gap-3'>
                <input
                  type='number'
                  min='1'
                  max='120'
                  value={newMinutes}
                  onChange={e => setNewMinutes(parseInt(e.target.value) || 1)}
                  className={clsx(
                    'w-24 rounded-lg border-2 px-3 py-2',
                    'border-(--border-color) bg-(--card-color)',
                    'text-(--main-color)',
                  )}
                />
                <span className='text-sm text-(--secondary-color)'>
                  minutes
                </span>
              </div>

              <div className='flex gap-2'>
                <button
                  onClick={handleAddTemplate}
                  className={clsx(
                    'flex-1 rounded-lg px-4 py-2 transition-opacity hover:cursor-pointer',
                    'bg-(--main-color) text-(--background-color)',
                    'hover:opacity-90',
                  )}
                >
                  Create Template
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className={clsx(
                    'rounded-lg border-2 px-4 py-2 transition-colors hover:cursor-pointer',
                    'border-(--border-color)',
                    'hover:bg-(--border-color)',
                  )}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom templates list */}
        {customTemplates.length > 0 ? (
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            {customTemplates.map(template => {
              const isDefault = settings.defaultTemplates.includes(template.id);

              return (
                <div
                  key={template.id}
                  className={clsx(
                    'rounded-lg border-2 p-3',
                    isDefault
                      ? 'bg-opacity-10 border-(--main-color) bg-(--main-color)'
                      : 'border-(--border-color)',
                  )}
                >
                  <div className='flex items-center justify-between'>
                    <button
                      onClick={() => toggleDefaultTemplate(template.id)}
                      className='flex flex-1 items-center gap-2 text-left'
                    >
                      <span className='text-2xl'>{template.icon}</span>
                      <div>
                        <p
                          className={clsx(
                            'font-medium',
                            isDefault
                              ? 'text-(--background-color)'
                              : 'text-(--main-color)',
                          )}
                        >
                          {template.label}
                        </p>
                        <p
                          className={clsx(
                            'text-xs',
                            isDefault
                              ? 'text-(--card-color)'
                              : 'text-(--secondary-color)',
                          )}
                        >
                          {Math.floor(template.targetSeconds / 60)} minutes
                          {isDefault && ' • Default'}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => removeTemplate(template.id)}
                      className='hover:bg-opacity-10 rounded p-2 text-red-500 transition-colors hover:cursor-pointer hover:bg-red-500 hover:text-(--card-color)'
                      title='Delete template'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className='py-8 text-center text-sm text-(--secondary-color)'>
            No custom templates yet. Create one to get started!
          </p>
        )}
      </div>
    </div>
  );
}
