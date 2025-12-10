# Implementation Plan

- [x] 1. Set up dependencies and core utilities






  - [ ] 1.1 Install localforage package
    - Run `npm install localforage`


    - Add TypeScript types if needed
    - _Requirements: 1.1, 1.4_
  - [ ] 1.2 Create streak calculation utility functions
    - Create `features/Progress/lib/streakCalculations.ts`
    - Implement `formatDate(date: Date): string` - formats to YYYY-MM-DD
    - Implement `parseDate(dateString: string): Date` - parses YYYY-MM-DD
    - Implement `calculateCurrentStreak(visits: string[]): number`


    - Implement `calculateLongestStreak(visits: string[]): number`
    - Implement `getDaysInPeriod(period: TimePeriod, referenceDate: Date): string[]`
    - Implement `hasVisit(visits: string[], date: string): boolean`


    - _Requirements: 6.1, 6.4, 7.1, 7.2_


  - [ ] 1.3 Write property tests for streak calculations
    - **Property 8: Current Streak Calculation**
    - **Property 9: Longest Streak Calculation**
    - **Property 10: Total Visits Count**
    - **Property 3: Date Format Consistency**


    - **Validates: Requirements 1.3, 6.1, 6.4, 7.1, 7.2**


- [-] 2. Implement visit tracking store




  - [ ] 2.1 Create useVisitStore with LocalForage persistence
    - Create `features/Progress/store/useVisitStore.ts`

    - Define VisitState interface with visits array and isLoaded flag

    - Implement loadVisits action to fetch from LocalForage


    - Implement recordVisit action to add date and persist
    - Use LocalForage key "kanadojo-visits"

    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_



  - [ ] 2.2 Write property tests for visit store
    - **Property 1: Visit Idempotence**
    - **Property 2: Visit Serialization Round-Trip**

    - **Validates: Requirements 1.2, 1.4, 1.5**


- [ ] 3. Implement visit tracking hook and integration

  - [ ] 3.1 Create useVisitTracker hook
    - Create `features/Progress/hooks/useVisitTracker.ts`
    - Hook should run on mount and record today's visit

    - Should check if today is already recorded before adding

    - _Requirements: 1.1, 1.2_
  - [ ] 3.2 Integrate visit tracker into ClientLayout
    - Import and use useVisitTracker hook in `app/ClientLayout.tsx`

    - Ensure it runs once per app session

    - _Requirements: 1.1_

- [x] 4. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement streak display components


  - [-] 5.1 Create StreakStats component

    - Create `features/Progress/components/StreakStats.tsx`
    - Display total visits, current streak, longest streak



    - Use Card components matching existing SimpleProgress style
    - _Requirements: 6.1, 7.1, 7.2, 7.3_
  - [ ] 5.2 Create StreakGrid component
    - Create `features/Progress/components/StreakGrid.tsx`
    - Accept visits array and period (7days, 30days, year) as props
    - Render grid of day cells with filled/empty indicators
    - Show day-of-week labels for 7-day view
    - Organize 30-day view in weekly rows
    - Organize yearly view by months with month labels
    - Use CSS variables for theming consistency
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.4, 5.1, 5.2, 5.5_
  - [ ] 5.3 Write property tests for StreakGrid
    - **Property 4: 7-Day View Cell Count**
    - **Property 5: 30-Day View Cell Count**
    - **Property 6: Yearly View Coverage**
    - **Property 7: Visit Indicator Correctness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 4.1, 5.1, 5.2**
  - [ ] 5.4 Create StreakProgress container component
    - Create `features/Progress/components/StreakProgress.tsx`
    - Compose StreakStats and StreakGrid components
    - Add period selector tabs (7 days, 30 days, Year)
    - Use useVisitStore to get visit data
    - _Requirements: 3.1, 4.1, 5.1_

- [ ] 6. Implement view toggle in Progress page

  - [ ] 6.1 Update ProgressWithSidebar with toggle switch
    - Modify `features/Progress/components/ProgressWithSidebar.tsx`
    - Add state for current view (statistics | streak)
    - Add toggle switch UI between Banner and content
    - Conditionally render SimpleProgress or StreakProgress based on state
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ] 6.2 Update Progress feature barrel exports
    - Update `features/Progress/index.ts`
    - Export StreakProgress, StreakGrid, StreakStats components
    - Export useVisitStore
    - _Requirements: N/A (code organization)_

- [ ] 7. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
