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
    getMostUsedTemplate
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
      color: 'var(--main-color)'
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
          id => id !== templateId
        )
      });
    } else {
      // Add to defaults
      updateSettings({
        defaultTemplates: [...settings.defaultTemplates, templateId]
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
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div
          className={clsx(
            'p-4 rounded-xl border-2',
            'bg-[var(--card-color)] border-[var(--border-color)]'
          )}
        >
          <p className='text-sm text-[var(--secondary-color)] mb-1'>
            Total Achievements
          </p>
          <p className='text-3xl font-bold text-[var(--main-color)]'>
            {totalAchievements}
          </p>
        </div>

        <div
          className={clsx(
            'p-4 rounded-xl border-2',
            'bg-[var(--card-color)] border-[var(--border-color)]'
          )}
        >
          <p className='text-sm text-[var(--secondary-color)] mb-1'>
            Most Used Template
          </p>
          <p className='text-xl font-bold text-[var(--main-color)]'>
            {mostUsedTemplate ? (
              <span>
                {mostUsedTemplate.icon} {mostUsedTemplate.label}
              </span>
            ) : (
              'N/A'
            )}
          </p>
          {mostUsedTemplate && (
            <p className='text-xs text-[var(--secondary-color)] mt-1'>
              {mostUsedCount} times
            </p>
          )}
        </div>

        <div
          className={clsx(
            'p-4 rounded-xl border-2',
            'bg-[var(--card-color)] border-[var(--border-color)]'
          )}
        >
          <p className='text-sm text-[var(--secondary-color)] mb-1'>
            Recent Activity
          </p>
          <p className='text-xl font-bold text-[var(--main-color)]'>
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
          'p-4 rounded-xl border-2',
          'bg-[var(--card-color)] border-[var(--border-color)]'
        )}
      >
        <h4 className='text-lg font-semibold mb-4'>Audio Settings</h4>

        <div className='space-y-4'>
          {/* Sound toggle */}
          <div className='flex items-center justify-between'>
            <label className='text-sm'>Play sound when goal reached</label>
            <button
              onClick={toggleSound}
              aria-label='Toggle play sound'
              className={clsx(
                'w-12 h-6 rounded-full transition-colors',
                settings.defaultPlaySound
                  ? 'bg-[var(--main-color)]'
                  : 'bg-[var(--border-color)]'
              )}
            >
              <div
                className={clsx(
                  'w-5 h-5 rounded-full bg-white transition-transform',
                  settings.defaultPlaySound ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Volume slider */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <label className='text-sm'>Volume</label>
              <span className='text-sm text-[var(--secondary-color)]'>
                {settings.soundVolume}%
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={toggleSound}
                className='text-[var(--secondary-color)] hover:text-[var(--main-color)]'
              >
                {settings.defaultPlaySound ? (
                  <Volume2 className='w-5 h-5' />
                ) : (
                  <VolumeX className='w-5 h-5' />
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
          'p-4 rounded-xl border-2',
          'bg-[var(--card-color)] border-[var(--border-color)]'
        )}
      >
        <h4 className='text-lg font-semibold mb-4'>Visual Settings</h4>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Sparkles className='w-5 h-5 text-[var(--main-color)]' />
            <label className='text-sm text-[var(--secondary-color)]'>
              Show confetti animation when goal reached
            </label>
          </div>
          <button
            onClick={toggleAnimation}
            aria-label='Toggle confetti animation'
            className={clsx(
              'w-12 h-6 rounded-full transition-colors hover:cursor-pointer',
              settings.defaultShowAnimation
                ? 'bg-[var(--secondary-color)]'
                : 'bg-[var(--border-color)]'
            )}
          >
            <div
              className={clsx(
                'w-5 h-5 rounded-full bg-white transition-transform',
                settings.defaultShowAnimation
                  ? 'translate-x-6'
                  : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </div>

      {/* Built-in Templates */}
      <div>
        <h4 className='text-lg font-semibold mb-3'>Built-in Templates</h4>
        <p className='text-sm text-[var(--secondary-color)] mb-4'>
          Select which templates appear in quick-add
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {builtInTemplates.map(template => {
            const isDefault = settings.defaultTemplates.includes(template.id);

            return (
              <button
                key={template.id}
                onClick={() => toggleDefaultTemplate(template.id)}
                className={clsx(
                  'p-3 rounded-lg border-2 transition-colors text-left hover:cursor-pointer',
                  isDefault
                    ? 'border-[var(--main-color)] bg-[var(--main-color)] bg-opacity-10'
                    : 'border-[var(--border-color)] hover:bg-[var(--card-color)]'
                )}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl'>{template.icon}</span>
                    <div>
                      <p
                        className={clsx(
                          'font-medium ',
                          isDefault
                            ? 'text-[var(--background-color)]'
                            : 'text-[var(--main-color)]'
                        )}
                      >
                        {template.label}
                      </p>
                      <p
                        className={clsx(
                          'text-xs',
                          isDefault
                            ? 'text-[var(--card-color)]'
                            : 'text-[var(--secondary-color)]'
                        )}
                      >
                        {Math.floor(template.targetSeconds / 60)} minutes
                      </p>
                    </div>
                  </div>
                  {isDefault && (
                    <span className='text-xs text-[var(--card-color)] font-medium'>
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
        <div className='flex items-center justify-between mb-3'>
          <h4 className='text-lg font-semibold'>Your Custom Templates</h4>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className={clsx(
                'px-3 py-1.5 rounded-lg border-2 transition-colors hover:cursor-pointer',
                'border-[var(--border-color)]',
                'hover:bg-[var(--border-color)]',
                'flex items-center gap-2'
              )}
            >
              <Plus className='w-4 h-4' />
              New Template
            </button>
          )}
        </div>

        {/* Add template form */}
        {isAdding && (
          <div
            className={clsx(
              'mb-4 p-4 rounded-xl border-2',
              'bg-[var(--card-color)] border-[var(--border-color)]'
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
                    'w-20 px-3 py-2 rounded-lg border-2 text-center text-2xl',
                    'bg-[var(--card-color)] border-[var(--border-color)]'
                  )}
                />
                <input
                  type='text'
                  placeholder='Template name'
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  className={clsx(
                    'flex-1 px-3 py-2 rounded-lg border-2',
                    'bg-[var(--card-color)] border-[var(--border-color)]',
                    'text-[var(--main-color)]'
                  )}
                  autoFocus
                />
              </div>

              <div className='flex gap-3 items-center'>
                <input
                  type='number'
                  min='1'
                  max='120'
                  value={newMinutes}
                  onChange={e => setNewMinutes(parseInt(e.target.value) || 1)}
                  className={clsx(
                    'w-24 px-3 py-2 rounded-lg border-2',
                    'bg-[var(--card-color)] border-[var(--border-color)]',
                    'text-[var(--main-color)]'
                  )}
                />
                <span className='text-sm text-[var(--secondary-color)]'>
                  minutes
                </span>
              </div>

              <div className='flex gap-2'>
                <button
                  onClick={handleAddTemplate}
                  className={clsx(
                    'flex-1 px-4 py-2 rounded-lg transition-opacity hover:cursor-pointer',
                    'bg-[var(--main-color)] text-[var(--background-color)]',
                    'hover:opacity-90'
                  )}
                >
                  Create Template
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className={clsx(
                    'px-4 py-2 border-2 rounded-lg transition-colors hover:cursor-pointer',
                    'border-[var(--border-color)]',
                    'hover:bg-[var(--border-color)]'
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
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {customTemplates.map(template => {
              const isDefault = settings.defaultTemplates.includes(template.id);

              return (
                <div
                  key={template.id}
                  className={clsx(
                    'p-3 rounded-lg border-2',
                    isDefault
                      ? 'border-[var(--main-color)] bg-[var(--main-color)] bg-opacity-10'
                      : 'border-[var(--border-color)]'
                  )}
                >
                  <div className='flex items-center justify-between'>
                    <button
                      onClick={() => toggleDefaultTemplate(template.id)}
                      className='flex items-center gap-2 flex-1 text-left'
                    >
                      <span className='text-2xl'>{template.icon}</span>
                      <div>
                        <p
                          className={clsx(
                            'font-medium ',
                            isDefault
                              ? 'text-[var(--background-color)]'
                              : 'text-[var(--main-color)]'
                          )}
                        >
                          {template.label}
                        </p>
                        <p
                          className={clsx(
                            'text-xs',
                            isDefault
                              ? 'text-[var(--card-color)]'
                              : 'text-[var(--secondary-color)]'
                          )}
                        >
                          {Math.floor(template.targetSeconds / 60)} minutes
                          {isDefault && ' • Default'}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => removeTemplate(template.id)}
                      className='p-2 text-red-500 hover:bg-red-500 hover:text-[var(--card-color)] hover:bg-opacity-10 rounded transition-colors hover:cursor-pointer'
                      title='Delete template'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className='text-sm text-[var(--secondary-color)] text-center py-8'>
            No custom templates yet. Create one to get started!
          </p>
        )}
      </div>
    </div>
  );
}
