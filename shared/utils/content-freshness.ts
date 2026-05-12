/**
 * Content Freshness Utilities
 * Helps display and track content freshness for SEO
 * Bing heavily values content freshness signals
 */

/**
 * Format a date for display with "Last updated" prefix
 */
export function formatLastUpdated(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // If updated today
  if (diffDays === 0) {
    return 'Updated today';
  }

  // If updated yesterday
  if (diffDays === 1) {
    return 'Updated yesterday';
  }

  // If updated within last week
  if (diffDays < 7) {
    return `Updated ${diffDays} days ago`;
  }

  // If updated within last month
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Updated ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  // If updated within last year
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Updated ${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  // Show actual date for older content
  return `Last updated ${formatDate(dateObj)}`;
}

/**
 * Format a date in a readable format
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date for ISO 8601 (schema.org dateModified)
 */
export function formatISODate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Check if content is considered "fresh" (updated within X days)
 */
export function isContentFresh(
  date: Date | string,
  thresholdDays: number = 90,
): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays <= thresholdDays;
}

/**
 * Get a freshness badge based on how recently content was updated
 */
export function getFreshnessBadge(date: Date | string): {
  label: string;
  variant: 'fresh' | 'recent' | 'outdated' | null;
} {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Fresh: Updated within 30 days
  if (diffDays <= 30) {
    return { label: 'Recently Updated', variant: 'fresh' };
  }

  // Recent: Updated within 90 days
  if (diffDays <= 90) {
    return { label: 'Updated', variant: 'recent' };
  }

  // Outdated: Not updated in over 1 year
  if (diffDays > 365) {
    return { label: 'Older Content', variant: 'outdated' };
  }

  return { label: '', variant: null };
}

/**
 * Generate content age metadata for Article schema
 */
export function generateContentAgeMetadata(
  publishDate: Date | string,
  modifiedDate?: Date | string,
): {
  datePublished: string;
  dateModified: string;
  isFresh: boolean;
} {
  const published = formatISODate(publishDate);
  const modified = modifiedDate ? formatISODate(modifiedDate) : published;

  return {
    datePublished: published,
    dateModified: modified,
    isFresh: isContentFresh(modifiedDate || publishDate),
  };
}

/**
 * Format published and modified dates for display
 */
export function formatContentDates(
  publishDate: Date | string,
  modifiedDate?: Date | string,
): {
  published: string;
  modified?: string;
  showModified: boolean;
} {
  const published = formatDate(publishDate);

  if (!modifiedDate) {
    return { published, showModified: false };
  }

  const publishDateObj =
    typeof publishDate === 'string' ? new Date(publishDate) : publishDate;
  const modifiedDateObj =
    typeof modifiedDate === 'string' ? new Date(modifiedDate) : modifiedDate;

  // Only show modified date if it's significantly different (more than 1 day)
  const diffMs = modifiedDateObj.getTime() - publishDateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) {
    return { published, showModified: false };
  }

  return {
    published,
    modified: formatLastUpdated(modifiedDate),
    showModified: true,
  };
}

/**
 * Get content update recommendations based on age
 */
export function getUpdateRecommendation(date: Date | string): {
  shouldUpdate: boolean;
  urgency: 'high' | 'medium' | 'low';
  reason: string;
} {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Very old: Over 2 years
  if (diffDays > 730) {
    return {
      shouldUpdate: true,
      urgency: 'high',
      reason:
        'Content is over 2 years old and may contain outdated information',
    };
  }

  // Old: Over 1 year
  if (diffDays > 365) {
    return {
      shouldUpdate: true,
      urgency: 'medium',
      reason: 'Content is over 1 year old and should be reviewed for accuracy',
    };
  }

  // Getting old: Over 6 months
  if (diffDays > 180) {
    return {
      shouldUpdate: false,
      urgency: 'low',
      reason: 'Content is getting older, consider reviewing in the near future',
    };
  }

  return {
    shouldUpdate: false,
    urgency: 'low',
    reason: 'Content is relatively fresh',
  };
}

/**
 * Generate a "Last Updated" badge component props
 */
export function generateLastUpdatedBadgeProps(
  modifiedDate: Date | string,
): {
  text: string;
  isFresh: boolean;
  variant: 'success' | 'warning' | 'default';
} {
  const dateObj =
    typeof modifiedDate === 'string' ? new Date(modifiedDate) : modifiedDate;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) {
    return {
      text: formatLastUpdated(modifiedDate),
      isFresh: true,
      variant: 'success',
    };
  }

  if (diffDays <= 180) {
    return {
      text: formatLastUpdated(modifiedDate),
      isFresh: true,
      variant: 'default',
    };
  }

  return {
    text: formatLastUpdated(modifiedDate),
    isFresh: false,
    variant: 'warning',
  };
}
