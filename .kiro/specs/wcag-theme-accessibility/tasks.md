# Implementation Plan

- [x] 1. Create color utility functions for WCAG calculations

  - [x] 1.1 Create `features/Preferences/lib/colorUtils.ts` with color parsing functions

    - Implement `parseColor()` to handle HSL, HSLA, RGB, and hex formats
    - Implement `hslToRgb()` and `rgbToHsl()` conversion functions
    - _Requirements: 5.2_

  - [x] 1.2 Implement relative luminance calculation

    - Implement `getRelativeLuminance()` using WCAG formula
    - Handle sRGB linearization correctly
    - _Requirements: 5.2_

  - [x] 1.3 Implement contrast ratio calculation

    - Implement `getContrastRatio()` using WCAG formula
    - Return ratio as number (e.g., 4.5 for 4.5:1)
    - _Requirements: 5.2_

  - [ ]\* 1.4 Write property test for contrast ratio calculation
    - **Property 1: Text Color Contrast Compliance**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
    - Test that contrast ratio is symmetric and within valid range (1:1 to 21:1)

- [x] 2. Create theme validation system

  - [x] 2.1 Create `features/Preferences/lib/themeValidator.ts`

    - Implement `validateTheme()` function
    - Check all contrast requirements from design matrix
    - Return detailed validation results with issues
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2_

  - [ ]\* 2.2 Write property test for theme validation
    - **Property 2: Border Visibility Compliance**
    - **Validates: Requirements 1.5, 2.2**
    - Generate random themes and verify border contrast validation
  - [ ]\* 2.3 Write property test for card distinction
    - **Property 3: Card Distinction**
    - **Validates: Requirements 2.1**
    - Generate random themes and verify card-background contrast validation

- [x] 3. Audit existing themes and generate report

  - [x] 3.1 Run validation on all 80+ existing themes

    - Create audit script or function to validate all themes
    - Generate report of non-compliant themes with specific issues
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. Create theme improvement utilities

  - [x] 4.1 Implement `adjustLightness()` function in colorUtils.ts

    - Adjust color lightness to meet target contrast ratio
    - Preserve hue and saturation as much as possible
    - Handle edge cases (already at max/min lightness)
    - _Requirements: 4.3_

  - [x] 4.2 Implement `improveTheme()` function

    - Take non-compliant theme and return improved version
    - Prioritize lightness adjustments over hue changes
    - Maintain aesthetic character of original theme
    - _Requirements: 4.1, 4.3_

  - [ ]\* 4.3 Write property test for accent color distinguishability
    - **Property 4: Accent Color Distinguishability**
    - **Validates: Requirements 2.3, 3.2**
    - Verify mainColor and secondaryColor have sufficient distinction

- [-] 5. Improve non-compliant themes

  - [x] 5.1 Apply improvements to Light theme group

    - Fix 'long' and 'amethyst' themes if needed
    - Verify improvements meet all contrast requirements
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 5.2 Apply improvements to Dark theme group (batch 1)

    - Fix themes from 'monkeytype' through 'wabi'
    - Verify improvements meet all contrast requirements
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 5.3 Apply improvements to Dark theme group (batch 2)

    - Fix themes from 'matrix' through 'cosmic-charcoal'
    - Verify improvements meet all contrast requirements
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 5.4 Apply improvements to Dark theme group (batch 3)
    - Fix remaining dark themes
    - Verify improvements meet all contrast requirements
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ] 5.5 Apply improvements to Halloween and Christmas theme groups
    - Fix seasonal themes if needed
    - Verify improvements meet all contrast requirements
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]\* 5.6 Write property test for color blindness safety
    - **Property 5: Color Blindness Safety**
    - **Validates: Requirements 3.1**
    - Test red-green combinations have sufficient luminance contrast

- [ ] 6. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Create 8 new accessible themes

  - [ ] 7.1 Create 2 warm-toned accessible themes
    - Design themes with warm color palettes (reds, oranges, yellows)
    - Ensure all WCAG AA requirements are met
    - Verify color harmony (complementary, analogous, or triadic)
    - _Requirements: 6.1, 6.2, 4.2_
  - [ ] 7.2 Create 2 cool-toned accessible themes
    - Design themes with cool color palettes (blues, greens, purples)
    - Ensure all WCAG AA requirements are met
    - Verify color harmony
    - _Requirements: 6.1, 6.2, 4.2_
  - [ ] 7.3 Create 2 neutral-toned accessible themes
    - Design themes with neutral palettes (grays, browns, muted tones)
    - Ensure all WCAG AA requirements are met
    - Verify color harmony
    - _Requirements: 6.1, 6.2, 4.2_
  - [ ] 7.4 Create 2 vibrant high-contrast accessible themes
    - Design themes with vibrant, high-saturation colors
    - Ensure all WCAG AA requirements are met (should exceed easily)
    - Verify color harmony
    - _Requirements: 6.1, 6.2, 4.2_
  - [ ]\* 7.5 Write property test for color harmony
    - **Property 6: Color Harmony**
    - **Validates: Requirements 4.2**
    - Verify new themes use harmonious color relationships
  - [ ]\* 7.6 Write property test for theme uniqueness
    - **Property 7: New Theme Uniqueness**
    - **Validates: Requirements 6.3**
    - Verify new themes are visually distinct from existing themes

- [ ] 8. Final validation and integration

  - [ ] 8.1 Run full validation suite on all themes
    - Validate all original themes (improved)
    - Validate all 8 new themes
    - Generate final compliance report
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3_
  - [ ] 8.2 Update themes.ts with all improvements and new themes
    - Apply all theme improvements to the themes array
    - Add 8 new themes to appropriate theme groups
    - Ensure no regressions in existing functionality
    - _Requirements: 6.1_

- [ ] 9. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
