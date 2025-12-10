# Requirements Document

## Introduction

This feature adds a visit streak tracking system to the Progress page in KanaDojo. Similar to GitHub's contribution graph, it displays the user's daily visit history across different time periods (7 days, 30 days, and yearly view). The system tracks when users visit any page of the website and persists this data locally using LocalForage.

## Glossary

- **Visit**: A single recorded instance of a user accessing any page of the KanaDojo website on a particular calendar day
- **Streak**: A consecutive sequence of days where the user has at least one recorded visit
- **Visit Tracker**: The system component responsible for detecting and recording user visits
- **Streak Display**: The UI component that visualizes visit history in a calendar/grid format
- **LocalForage**: A JavaScript library that provides offline storage using IndexedDB, WebSQL, or localStorage as fallbacks

## Requirements

### Requirement 1

**User Story:** As a user, I want my daily visits to be automatically tracked, so that I can see my learning consistency over time.

#### Acceptance Criteria

1. WHEN a user visits any page of the website THEN the Visit Tracker SHALL record the current date as a visit entry in LocalForage
2. WHEN a user visits multiple pages on the same calendar day THEN the Visit Tracker SHALL store only one visit entry for that day
3. WHEN the Visit Tracker stores a visit THEN the Visit Tracker SHALL use the format "YYYY-MM-DD" for date keys
4. WHEN the Visit Tracker serializes visit data to LocalForage THEN the Visit Tracker SHALL store dates as an array of date strings
5. WHEN the Visit Tracker deserializes visit data from LocalForage THEN the Visit Tracker SHALL parse the stored array back into the same format

### Requirement 2

**User Story:** As a user, I want to switch between the simple progress view and the streak view, so that I can choose which statistics to focus on.

#### Acceptance Criteria

1. WHEN a user is on the Progress page THEN the Progress Page SHALL display a toggle switch to alternate between "Statistics" and "Streak" views
2. WHEN a user clicks the toggle switch THEN the Progress Page SHALL transition to the selected view without page reload
3. WHEN a user selects the "Streak" view THEN the Progress Page SHALL display the StreakProgress component
4. WHEN a user selects the "Statistics" view THEN the Progress Page SHALL display the SimpleProgress component

### Requirement 3

**User Story:** As a user, I want to see my visit history for the last 7 days, so that I can track my recent learning activity.

#### Acceptance Criteria

1. WHEN the Streak Display renders the 7-day view THEN the Streak Display SHALL show exactly 7 day cells representing the last 7 calendar days including today
2. WHEN a day has a recorded visit THEN the Streak Display SHALL render that day cell with a filled/highlighted visual indicator
3. WHEN a day has no recorded visit THEN the Streak Display SHALL render that day cell with an empty/muted visual indicator
4. WHEN displaying day cells THEN the Streak Display SHALL show the day-of-week label for each cell

### Requirement 4

**User Story:** As a user, I want to see my visit history for the last 30 days, so that I can understand my monthly learning patterns.

#### Acceptance Criteria

1. WHEN the Streak Display renders the 30-day view THEN the Streak Display SHALL show exactly 30 day cells representing the last 30 calendar days including today
2. WHEN a day has a recorded visit THEN the Streak Display SHALL render that day cell with a filled/highlighted visual indicator
3. WHEN a day has no recorded visit THEN the Streak Display SHALL render that day cell with an empty/muted visual indicator
4. WHEN displaying the 30-day grid THEN the Streak Display SHALL organize cells in a weekly row format

### Requirement 5

**User Story:** As a user, I want to see my visit history for the entire year, so that I can visualize my long-term learning commitment.

#### Acceptance Criteria

1. WHEN the Streak Display renders the yearly view THEN the Streak Display SHALL show day cells for the last 365 days organized by month
2. WHEN displaying the yearly view THEN the Streak Display SHALL label each month section with the month name
3. WHEN a day has a recorded visit THEN the Streak Display SHALL render that day cell with a filled/highlighted visual indicator
4. WHEN a day has no recorded visit THEN the Streak Display SHALL render that day cell with an empty/muted visual indicator
5. WHEN displaying the yearly grid THEN the Streak Display SHALL use a compact cell size to fit all days visually

### Requirement 6

**User Story:** As a user, I want to see my current streak count, so that I can stay motivated to maintain my learning habit.

#### Acceptance Criteria

1. WHEN the Streak Display renders THEN the Streak Display SHALL calculate and display the current consecutive day streak count
2. WHEN the user has visited today and the previous consecutive days THEN the Streak Display SHALL include today in the streak count
3. WHEN the user has not visited today but visited yesterday and previous consecutive days THEN the Streak Display SHALL show the streak as still active but not include today
4. WHEN the user has a gap of one or more days in their visit history THEN the Streak Display SHALL reset the streak count from the most recent visit

### Requirement 7

**User Story:** As a user, I want to see summary statistics about my visits, so that I can understand my overall engagement.

#### Acceptance Criteria

1. WHEN the Streak Display renders THEN the Streak Display SHALL show the total number of recorded visit days
2. WHEN the Streak Display renders THEN the Streak Display SHALL show the longest streak achieved
3. WHEN the Streak Display renders THEN the Streak Display SHALL show the current streak count
