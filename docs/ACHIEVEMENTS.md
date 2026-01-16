# Achievement System Documentation

## Overview

The Achievement System is a comprehensive gamification feature that tracks user milestones, learning streaks, and consistency, rewarding users with badges, themes, and visual celebrations. The system includes **80+ achievements** across **12 categories**, providing players with diverse goals to work toward.

## 📋 Table of Contents

- [Overview](#overview)
- [Achievement Categories](#-achievement-categories)
- [Achievement List by Category](#achievement-list-by-category)
  - [Streak Achievements](#-streak-achievements)
  - [Milestone Achievements](#-milestone-achievements)
  - [Consistency Achievements](#-consistency-achievements)
  - [Mastery Achievements](#-mastery-achievements)
  - [Exploration Achievements](#-exploration-achievements)
- [Content-Specific Achievements](#content-specific-achievements)
  - [Kana Achievements](#-kana-achievements)
  - [Kanji Achievements](#-kanji-achievements)
  - [Vocabulary Achievements](#-vocabulary-achievements)
- [Game Mode Achievements](#game-mode-achievements)
  - [Gauntlet Achievements](#-gauntlet-achievements)
  - [Blitz Achievements](#-blitz-achievements)
  - [Speed Achievements](#-speed-achievements)
- [Fun \& Secret Achievements](#-fun--secret-achievements)
- [Rarity System](#-rarity-system)
- [Achievements by Difficulty](#achievements-by-difficulty)
- [Celebration System](#-celebration-system)
- [Points \& Leveling](#-points--leveling)
- [Technical Implementation](#technical-implementation)
- [Usage](#usage)
- [File Structure](#file-structure)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

### 🏆 Achievement Categories

The achievement system organizes achievements into the following categories:

| Category        | Description                                 | Achievement Count |
| --------------- | ------------------------------------------- | ----------------- |
| **Streak**      | Consecutive correct answer achievements     | 9                 |
| **Milestone**   | Total progress and point-based achievements | 10                |
| **Consistency** | Training session completion achievements    | 6                 |
| **Mastery**     | Accuracy-based achievements                 | 3                 |
| **Exploration** | Variety and day-tracking achievements       | 7                 |
| **Kana**        | Hiragana and Katakana specific achievements | 8                 |
| **Kanji**       | JLPT level-based Kanji achievements         | 10                |
| **Vocabulary**  | Vocabulary learning achievements            | 6                 |
| **Gauntlet**    | Gauntlet mode specific achievements         | 10                |
| **Blitz**       | Blitz mode specific achievements            | 8                 |
| **Speed**       | Time and response speed achievements        | 5                 |
| **Fun**         | Fun and secret achievements                 | 10                |

---

## Achievement List by Category

### 🔥 Streak Achievements

Achievements for maintaining consecutive correct answers.

| Achievement         | Rarity    | Points | Requirement                 |
| ------------------- | --------- | ------ | --------------------------- |
| **Streak Starter**  | Common    | 25     | Achieve a 5-answer streak   |
| **Hot Streak**      | Uncommon  | 50     | Achieve a 10-answer streak  |
| **Streak Legend**   | Rare      | 150    | Achieve a 25-answer streak  |
| **Unstoppable**     | Epic      | 300    | Achieve a 50-answer streak  |
| **Streak Warrior**  | Epic      | 400    | Achieve a 75-answer streak  |
| **Century Streak**  | Epic      | 600    | Achieve a 100-answer streak |
| **Streak Titan**    | Legendary | 800    | Achieve a 150-answer streak |
| **Streak Immortal** | Legendary | 1000   | Achieve a 200-answer streak |
| **Streak God**      | Legendary | 2000   | Achieve a 500-answer streak |

### 📚 Milestone Achievements

Achievements for total progress and points earned.

| Achievement           | Rarity    | Points | Requirement                      |
| --------------------- | --------- | ------ | -------------------------------- |
| **First Steps**       | Common    | 10     | Get your first correct answer    |
| **Century Scholar**   | Uncommon  | 100    | Answer 100 questions correctly   |
| **Knowledge Seeker**  | Rare      | 250    | Answer 500 questions correctly   |
| **Master Scholar**    | Epic      | 500    | Answer 1000 questions correctly  |
| **Dedicated Scholar** | Rare      | 350    | Answer 2500 questions correctly  |
| **Legendary Master**  | Legendary | 1000   | Answer 5000 questions correctly  |
| **Grand Master**      | Legendary | 1500   | Answer 10000 questions correctly |
| **Legendary Scholar** | Legendary | 3000   | Answer 25000 questions correctly |
| **Point Collector**   | Uncommon  | 100    | Earn 1000 achievement points     |
| **Point Hoarder**     | Rare      | 250    | Earn 5000 achievement points     |
| **Point Master**      | Epic      | 500    | Earn 10000 achievement points    |

### 📖 Consistency Achievements

Achievements for completing training sessions.

| Achievement            | Rarity    | Points | Requirement                     |
| ---------------------- | --------- | ------ | ------------------------------- |
| **Dedicated Learner**  | Common    | 75     | Complete 10 training sessions   |
| **Persistent Student** | Uncommon  | 200    | Complete 50 training sessions   |
| **Training Master**    | Rare      | 400    | Complete 100 training sessions  |
| **Session Veteran**    | Rare      | 400    | Complete 250 training sessions  |
| **Session Legend**     | Epic      | 700    | Complete 500 training sessions  |
| **Eternal Student**    | Legendary | 1200   | Complete 1000 training sessions |

### 🎯 Mastery Achievements

Achievements for maintaining high accuracy.

| Achievement          | Rarity   | Points | Requirement                            |
| -------------------- | -------- | ------ | -------------------------------------- |
| **Precision Novice** | Uncommon | 100    | Maintain 80% accuracy over 50 answers  |
| **Accuracy Expert**  | Rare     | 250    | Maintain 90% accuracy over 100 answers |
| **Perfectionist**    | Epic     | 500    | Maintain 95% accuracy over 200 answers |

### 🌐 Exploration Achievements

Achievements for exploring different content and modes.

| Achievement             | Rarity    | Points | Requirement                                                        |
| ----------------------- | --------- | ------ | ------------------------------------------------------------------ |
| **Well-Rounded**        | Uncommon  | 100    | Train in all three dojos (Kana, Kanji, Vocabulary)                 |
| **Mode Explorer**       | Uncommon  | 100    | Try all four game modes (Pick, Reverse-Pick, Input, Reverse-Input) |
| **Triple Threat**       | Rare      | 200    | Complete sessions in Classic, Gauntlet, and Blitz modes            |
| **Consistent Learner**  | Common    | 75     | Train on 5 different days                                          |
| **Monthly Dedication**  | Rare      | 300    | Train on 30 different days                                         |
| **Century of Learning** | Epic      | 600    | Train on 100 different days                                        |
| **Year of Mastery**     | Legendary | 1500   | Train on 365 different days                                        |

---

## Content-Specific Achievements

### あ Kana Achievements

Achievements specific to Hiragana and Katakana training.

| Achievement                | Icon | Rarity   | Points | Requirement                                                 |
| -------------------------- | ---- | -------- | ------ | ----------------------------------------------------------- |
| **Hiragana Apprentice**    | あ   | Common   | 50     | Answer 50 Hiragana questions correctly                      |
| **Hiragana Adept**         | い   | Uncommon | 150    | Answer 200 Hiragana questions correctly                     |
| **Hiragana Master**        | う   | Rare     | 300    | Answer 500 Hiragana questions correctly                     |
| **Hiragana Perfectionist** | 💯   | Epic     | 500    | Achieve 100% accuracy on all basic Hiragana (46 characters) |
| **Katakana Apprentice**    | ア   | Common   | 50     | Answer 50 Katakana questions correctly                      |
| **Katakana Adept**         | イ   | Uncommon | 150    | Answer 200 Katakana questions correctly                     |
| **Katakana Master**        | ウ   | Rare     | 300    | Answer 500 Katakana questions correctly                     |
| **Katakana Perfectionist** | 💯   | Epic     | 500    | Achieve 100% accuracy on all basic Katakana (46 characters) |

### 漢 Kanji Achievements

Achievements for Kanji learning organized by JLPT level.

#### Explorer Achievements (Correct Answers)

| Achievement     | Icon | Rarity    | Points | Requirement                             |
| --------------- | ---- | --------- | ------ | --------------------------------------- |
| **N5 Explorer** | 🔰   | Common    | 75     | Answer 100 N5 Kanji questions correctly |
| **N4 Explorer** | 📗   | Uncommon  | 100    | Answer 100 N4 Kanji questions correctly |
| **N3 Explorer** | 📘   | Rare      | 150    | Answer 100 N3 Kanji questions correctly |
| **N2 Explorer** | 📕   | Epic      | 200    | Answer 100 N2 Kanji questions correctly |
| **N1 Explorer** | 📙   | Legendary | 300    | Answer 100 N1 Kanji questions correctly |

#### Graduate Achievements (Mastery)

| Achievement     | Icon | Rarity    | Points | Requirement                           |
| --------------- | ---- | --------- | ------ | ------------------------------------- |
| **N5 Graduate** | 🎓   | Rare      | 400    | Master all N5 Kanji with 80% accuracy |
| **N4 Graduate** | 🎓   | Epic      | 500    | Master all N4 Kanji with 80% accuracy |
| **N3 Graduate** | 🎓   | Epic      | 600    | Master all N3 Kanji with 80% accuracy |
| **N2 Graduate** | 🎓   | Legendary | 800    | Master all N2 Kanji with 80% accuracy |
| **N1 Graduate** | 👑   | Legendary | 1000   | Master all N1 Kanji with 80% accuracy |

### 📝 Vocabulary Achievements

Achievements for vocabulary learning.

| Achievement             | Icon | Rarity    | Points | Requirement                                          |
| ----------------------- | ---- | --------- | ------ | ---------------------------------------------------- |
| **Word Collector**      | 📝   | Common    | 75     | Answer 100 vocabulary questions correctly            |
| **Lexicon Builder**     | 📖   | Uncommon  | 200    | Answer 500 vocabulary questions correctly            |
| **Dictionary Devotee**  | 📚   | Rare      | 400    | Answer 1000 vocabulary questions correctly           |
| **Vocabulary Virtuoso** | 🎭   | Epic      | 750    | Answer 2500 vocabulary questions correctly           |
| **Word Wizard**         | 🧙   | Rare      | 350    | Master 50 unique vocabulary words with 90% accuracy  |
| **Linguistic Legend**   | 🏛️   | Legendary | 800    | Master 200 unique vocabulary words with 90% accuracy |

---

## Game Mode Achievements

### ⚔️ Gauntlet Achievements

Achievements for Gauntlet mode accomplishments.

| Achievement                | Icon | Rarity    | Points | Requirement                                         |
| -------------------------- | ---- | --------- | ------ | --------------------------------------------------- |
| **Gauntlet Initiate**      | ⚔️   | Common    | 50     | Complete your first Gauntlet run                    |
| **Gauntlet Survivor**      | 🛡️   | Uncommon  | 100    | Complete a Gauntlet run on Normal difficulty        |
| **Gauntlet Warrior**       | ⚔️   | Rare      | 250    | Complete a Gauntlet run on Hard difficulty          |
| **Gauntlet Legend**        | 💀   | Legendary | 500    | Complete a Gauntlet run on Instant Death difficulty |
| **Gauntlet Veteran**       | 🎖️   | Uncommon  | 150    | Complete 10 Gauntlet runs                           |
| **Gauntlet Champion**      | 🏆   | Epic      | 400    | Complete 50 Gauntlet runs                           |
| **Flawless Victory**       | ✨   | Epic      | 500    | Complete a Gauntlet run with 100% accuracy          |
| **Untouchable**            | 🌟   | Rare      | 300    | Complete a Gauntlet run without losing any lives    |
| **Phoenix Rising**         | 🔥   | Rare      | 200    | Regenerate 5 lives in a single Gauntlet run         |
| **Gauntlet Streak Master** | ⚡   | Epic      | 350    | Achieve a 50-streak in Gauntlet mode                |

### ⚡ Blitz Achievements

Achievements for Blitz mode performance.

| Achievement                  | Icon | Rarity   | Points | Requirement                                              |
| ---------------------------- | ---- | -------- | ------ | -------------------------------------------------------- |
| **Speed Demon Initiate**     | 💨   | Common   | 50     | Complete your first Blitz session                        |
| **Blitz Warrior**            | ⚡   | Uncommon | 150    | Answer 50 questions correctly in a single Blitz session  |
| **Blitz Champion**           | 🏅   | Rare     | 300    | Answer 100 questions correctly in a single Blitz session |
| **Lightning Reflexes**       | ⚡   | Rare     | 200    | Achieve a 25-streak in Blitz mode                        |
| **Blitz Legend**             | 🌩️   | Epic     | 400    | Achieve a 50-streak in Blitz mode                        |
| **Precision Under Pressure** | 🎯   | Epic     | 350    | Maintain 90% accuracy over 100 Blitz answers             |
| **Speed Addict**             | 🏃   | Uncommon | 100    | Complete 10 Blitz sessions                               |
| **Blitz Master**             | 👑   | Epic     | 400    | Complete 50 Blitz sessions                               |

### ⏱️ Speed Achievements

Achievements for fast and efficient learning.

| Achievement             | Icon | Rarity   | Points | Requirement                                                         |
| ----------------------- | ---- | -------- | ------ | ------------------------------------------------------------------- |
| **Quick Draw**          | 🤠   | Uncommon | 100    | Answer 10 questions correctly in under 30 seconds total             |
| **Speed Reader**        | 📖   | Rare     | 200    | Answer 25 questions correctly in under 60 seconds total             |
| **Instant Recognition** | 👁️   | Rare     | 150    | Answer a question correctly in under 1 second                       |
| **Rapid Fire**          | 🔫   | Epic     | 300    | Maintain an average response time under 2 seconds over 50 questions |
| **Efficient Learner**   | ⏱️   | Rare     | 250    | Complete a training session in under 5 minutes with 90% accuracy    |

---

## Fun & Secret Achievements

### 🎉 Fun Achievements

Fun and surprising achievements for delightful moments of discovery.

| Achievement                | Icon | Rarity    | Points | Requirement                                      | Hidden |
| -------------------------- | ---- | --------- | ------ | ------------------------------------------------ | ------ |
| **Learning from Mistakes** | 🤔   | Common    | 10     | Answer your first question wrong                 | No     |
| **Perseverance**           | 💪   | Uncommon  | 50     | Get 5 wrong answers in a row                     | No     |
| **Night Owl**              | 🦉   | Uncommon  | 75     | Train at midnight (00:00-01:00)                  | Yes    |
| **Early Bird**             | 🐦   | Uncommon  | 75     | Train early morning (05:00-06:00)                | Yes    |
| **Answer to Everything**   | 🌌   | Rare      | 142    | Achieve exactly 42 correct answers in a session  | Yes    |
| **Perfect Century**        | 💯   | Rare      | 200    | Achieve exactly 100 correct answers in a session | Yes    |
| **Achievement Hunter**     | 🎯   | Uncommon  | 100    | Unlock 10 achievements                           | No     |
| **Achievement Collector**  | 🏅   | Rare      | 250    | Unlock 25 achievements                           | No     |
| **Achievement Enthusiast** | 🎖️   | Epic      | 500    | Unlock 50 achievements                           | No     |
| **Completionist**          | 🌟   | Legendary | 2000   | Unlock all achievements                          | Yes    |

---

## 🎨 Rarity System

Achievements are categorized by rarity levels:

| Rarity        | Color  | Description                 | Point Range |
| ------------- | ------ | --------------------------- | ----------- |
| **Common**    | Gray   | Basic milestones            | 10-75       |
| **Uncommon**  | Green  | Regular progress markers    | 50-200      |
| **Rare**      | Blue   | Significant accomplishments | 150-400     |
| **Epic**      | Purple | Major achievements          | 300-750     |
| **Legendary** | Gold   | Exceptional feats           | 500-3000    |

---

## 🎯 Achievements by Difficulty

This section groups achievements by their rarity/difficulty level, making it easier to find challenges appropriate for your skill level.

### 🟢 Common Achievements (Easiest)

Basic milestones that most players can achieve early in their journey.

| Achievement                | Category    | Points | Requirement                               |
| -------------------------- | ----------- | ------ | ----------------------------------------- |
| **First Steps**            | Milestone   | 10     | Get your first correct answer             |
| **Learning from Mistakes** | Fun         | 10     | Answer your first question wrong          |
| **Streak Starter**         | Streak      | 25     | Achieve a 5-answer streak                 |
| **Dedicated Learner**      | Consistency | 75     | Complete 10 training sessions             |
| **Consistent Learner**     | Exploration | 75     | Train on 5 different days                 |
| **Hiragana Apprentice**    | Kana        | 50     | Answer 50 Hiragana questions correctly    |
| **Katakana Apprentice**    | Kana        | 50     | Answer 50 Katakana questions correctly    |
| **Gauntlet Initiate**      | Gauntlet    | 50     | Complete your first Gauntlet run          |
| **Speed Demon Initiate**   | Blitz       | 50     | Complete your first Blitz session         |
| **N5 Explorer**            | Kanji       | 75     | Answer 100 N5 Kanji questions correctly   |
| **Word Collector**         | Vocabulary  | 75     | Answer 100 vocabulary questions correctly |

### 🟢 Uncommon Achievements (Easy)

Regular progress markers that reward consistent practice.

| Achievement            | Category    | Points | Requirement                                  |
| ---------------------- | ----------- | ------ | -------------------------------------------- |
| **Hot Streak**         | Streak      | 50     | Achieve a 10-answer streak                   |
| **Century Scholar**    | Milestone   | 100    | Answer 100 questions correctly               |
| **Point Collector**    | Milestone   | 100    | Earn 1000 achievement points                 |
| **Persistent Student** | Consistency | 200    | Complete 50 training sessions                |
| **Well-Rounded**       | Exploration | 100    | Train in all three dojos                     |
| **Mode Explorer**      | Exploration | 100    | Try all four game modes                      |
| **Precision Novice**   | Mastery     | 100    | Maintain 80% accuracy over 50 answers        |
| **Hiragana Adept**     | Kana        | 150    | Answer 200 Hiragana questions correctly      |
| **Katakana Adept**     | Kana        | 150    | Answer 200 Katakana questions correctly      |
| **N4 Explorer**        | Kanji       | 100    | Answer 100 N4 Kanji questions correctly      |
| **Gauntlet Survivor**  | Gauntlet    | 100    | Complete a Gauntlet run on Normal difficulty |
| **Gauntlet Veteran**   | Gauntlet    | 150    | Complete 10 Gauntlet runs                    |
| **Blitz Warrior**      | Blitz       | 150    | Answer 50 questions correctly in Blitz       |
| **Speed Addict**       | Blitz       | 100    | Complete 10 Blitz sessions                   |
| **Quick Draw**         | Speed       | 100    | Answer 10 questions correctly in 30 seconds  |
| **Perseverance**       | Fun         | 50     | Get 5 wrong answers in a row                 |
| **Night Owl**          | Fun         | 75     | Train at midnight (00:00-01:00)              |
| **Early Bird**         | Fun         | 75     | Train early morning (05:00-06:00)            |
| **Achievement Hunter** | Fun         | 100    | Unlock 10 achievements                       |

### 🔵 Rare Achievements (Medium)

Significant accomplishments that require dedicated practice.

| Achievement               | Category    | Points | Requirement                                    |
| ------------------------- | ----------- | ------ | ---------------------------------------------- |
| **Streak Legend**         | Streak      | 150    | Achieve a 25-answer streak                     |
| **Knowledge Seeker**      | Milestone   | 250    | Answer 500 questions correctly                 |
| **Dedicated Scholar**     | Milestone   | 350    | Answer 2500 questions correctly                |
| **Point Hoarder**         | Milestone   | 250    | Earn 5000 achievement points                   |
| **Training Master**       | Consistency | 400    | Complete 100 training sessions                 |
| **Session Veteran**       | Consistency | 400    | Complete 250 training sessions                 |
| **Accuracy Expert**       | Mastery     | 250    | Maintain 90% accuracy over 100 answers         |
| **Monthly Dedication**    | Exploration | 300    | Train on 30 different days                     |
| **Triple Threat**         | Exploration | 200    | Complete sessions in 3 game modes              |
| **Hiragana Master**       | Kana        | 300    | Answer 500 Hiragana questions correctly        |
| **Katakana Master**       | Kana        | 300    | Answer 500 Katakana questions correctly        |
| **N3 Explorer**           | Kanji       | 150    | Answer 100 N3 Kanji questions correctly        |
| **N5 Graduate**           | Kanji       | 400    | Master all N5 Kanji with 80% accuracy          |
| **Lexicon Builder**       | Vocabulary  | 200    | Answer 500 vocabulary questions correctly      |
| **Word Wizard**           | Vocabulary  | 350    | Master 50 unique vocabulary words (90% acc)    |
| **Gauntlet Warrior**      | Gauntlet    | 250    | Complete a Gauntlet run on Hard difficulty     |
| **Phoenix Rising**        | Gauntlet    | 200    | Regenerate 5 lives in a single Gauntlet run    |
| **Blitz Champion**        | Blitz       | 300    | Answer 100 questions correctly in Blitz        |
| **Lightning Reflexes**    | Blitz       | 200    | Achieve a 25-streak in Blitz mode              |
| **Speed Reader**          | Speed       | 200    | Answer 25 questions correctly in 60 seconds    |
| **Instant Recognition**   | Speed       | 150    | Answer a question correctly in under 1 second  |
| **Efficient Learner**     | Speed       | 250    | Complete session in 5 min with 90% accuracy    |
| **Answer to Everything**  | Fun         | 142    | Achieve exactly 42 correct answers in session  |
| **Perfect Century**       | Fun         | 200    | Achieve exactly 100 correct answers in session |
| **Achievement Collector** | Fun         | 250    | Unlock 25 achievements                         |

### 🟣 Epic Achievements (Hard)

Major achievements that require significant dedication.

| Achievement                  | Category    | Points | Requirement                                      |
| ---------------------------- | ----------- | ------ | ------------------------------------------------ |
| **Unstoppable**              | Streak      | 300    | Achieve a 50-answer streak                       |
| **Streak Warrior**           | Streak      | 400    | Achieve a 75-answer streak                       |
| **Century Streak**           | Streak      | 600    | Achieve a 100-answer streak                      |
| **Master Scholar**           | Milestone   | 500    | Answer 1000 questions correctly                  |
| **Point Master**             | Milestone   | 500    | Earn 10000 achievement points                    |
| **Session Legend**           | Consistency | 700    | Complete 500 training sessions                   |
| **Perfectionist**            | Mastery     | 500    | Maintain 95% accuracy over 200 answers           |
| **Century of Learning**      | Exploration | 600    | Train on 100 different days                      |
| **Hiragana Perfectionist**   | Kana        | 500    | Achieve 100% accuracy on all basic Hiragana      |
| **Katakana Perfectionist**   | Kana        | 500    | Achieve 100% accuracy on all basic Katakana      |
| **N2 Explorer**              | Kanji       | 200    | Answer 100 N2 Kanji questions correctly          |
| **N4 Graduate**              | Kanji       | 500    | Master all N4 Kanji with 80% accuracy            |
| **N3 Graduate**              | Kanji       | 600    | Master all N3 Kanji with 80% accuracy            |
| **Dictionary Devotee**       | Vocabulary  | 400    | Answer 1000 vocabulary questions correctly       |
| **Vocabulary Virtuoso**      | Vocabulary  | 750    | Answer 2500 vocabulary questions correctly       |
| **Gauntlet Legend**          | Gauntlet    | 500    | Complete Gauntlet on Instant Death difficulty    |
| **Gauntlet Champion**        | Gauntlet    | 400    | Complete 50 Gauntlet runs                        |
| **Flawless Victory**         | Gauntlet    | 500    | Complete Gauntlet with 100% accuracy             |
| **Untouchable**              | Gauntlet    | 300    | Complete Gauntlet without losing any lives       |
| **Gauntlet Streak Master**   | Gauntlet    | 350    | Achieve a 50-streak in Gauntlet mode             |
| **Blitz Legend**             | Blitz       | 400    | Achieve a 50-streak in Blitz mode                |
| **Precision Under Pressure** | Blitz       | 350    | Maintain 90% accuracy over 100 Blitz answers     |
| **Blitz Master**             | Blitz       | 400    | Complete 50 Blitz sessions                       |
| **Rapid Fire**               | Speed       | 300    | Maintain avg response under 2s over 50 questions |
| **Achievement Enthusiast**   | Fun         | 500    | Unlock 50 achievements                           |

### 🟠 Legendary Achievements (Hardest)

Exceptional feats that represent mastery of KanaDojo.

| Achievement                | Category    | Points | Requirement                                       |
| -------------------------- | ----------- | ------ | ------------------------------------------------- |
| **Streak Titan**           | Streak      | 800    | Achieve a 150-answer streak                       |
| **Streak Immortal**        | Streak      | 1000   | Achieve a 200-answer streak                       |
| **Streak God**             | Streak      | 2000   | Achieve a 500-answer streak                       |
| **Legendary Master**       | Milestone   | 1000   | Answer 5000 questions correctly                   |
| **Grand Master**           | Milestone   | 1500   | Answer 10000 questions correctly                  |
| **Legendary Scholar**      | Milestone   | 3000   | Answer 25000 questions correctly                  |
| **Eternal Student**        | Consistency | 1200   | Complete 1000 training sessions                   |
| **Year of Mastery**        | Exploration | 1500   | Train on 365 different days                       |
| **N1 Explorer**            | Kanji       | 300    | Answer 100 N1 Kanji questions correctly           |
| **N2 Graduate**            | Kanji       | 800    | Master all N2 Kanji with 80% accuracy             |
| **N1 Graduate**            | Kanji       | 1000   | Master all N1 Kanji with 80% accuracy             |
| **Linguistic Legend**      | Vocabulary  | 800    | Master 200 unique vocabulary words (90% accuracy) |
| **Achievement Enthusiast** | Fun         | 500    | Unlock 50 achievements                            |
| **Completionist**          | Fun         | 2000   | Unlock all achievements                           |

---

- **Confetti Animations** - Full-screen celebrations with rarity-specific colors
- **Achievement Modals** - Beautiful modal displays with achievement details
- **Notification System** - Subtle in-app notifications for new achievements
- **Progress Tracking** - Visual progress bars for locked achievements

---

## 📊 Points & Leveling

- **Achievement Points** - Earned by unlocking achievements
- **Level System** - Level up every 500 points
- **Progress Tracking** - Track overall completion percentage
- **Total Available Points** - 30,000+ points across all achievements

---

## Technical Implementation

### Store Structure

The achievement system uses Zustand for state management with the following key components:

```typescript
interface AchievementState {
  unlockedAchievements: Record<string, Achievement>;
  notifications: AchievementNotification[];
  totalPoints: number;
  level: number;
  // ... methods
}
```

### Requirement Types

The system supports the following requirement types:

| Type                  | Description                               |
| --------------------- | ----------------------------------------- |
| `streak`              | Consecutive correct answers               |
| `total_correct`       | Total correct answers                     |
| `total_incorrect`     | Total incorrect answers                   |
| `sessions`            | Training sessions completed               |
| `accuracy`            | Accuracy percentage with minimum answers  |
| `content_correct`     | Correct answers for specific content type |
| `content_mastery`     | Mastery of specific content set           |
| `gauntlet_completion` | Gauntlet runs completed                   |
| `gauntlet_difficulty` | Gauntlet difficulty-specific completions  |
| `gauntlet_perfect`    | Perfect Gauntlet runs                     |
| `gauntlet_lives`      | Life-related Gauntlet achievements        |
| `blitz_session`       | Blitz sessions completed                  |
| `blitz_score`         | Blitz session scores                      |
| `speed`               | Time-based achievements                   |
| `variety`             | Exploration/variety achievements          |
| `days_trained`        | Unique training days                      |
| `time_of_day`         | Time-based (Night Owl, Early Bird)        |
| `wrong_streak`        | Consecutive wrong answers                 |
| `exact_count`         | Exact number achievements                 |
| `achievement_count`   | Meta achievements                         |
| `total_points`        | Point-based achievements                  |

### Integration Points

1. **Stats Integration** - Automatically checks for achievements when stats update
2. **Game Flow** - Triggers achievement checks after correct/incorrect answers
3. **Session Completion** - Checks achievements when training sessions end
4. **Persistent Storage** - Saves achievement progress locally

### Components

#### Core Components

- `AchievementModal` - Full-screen celebration modal
- `AchievementNotification` - In-app notification system
- `AchievementProgress` - Progress tracking page
- `AchievementBadge` - Navigation badge with notifications

#### Settings & Management

- `AchievementSettings` - Management interface in preferences
- Export/Import functionality for achievement data
- Reset options with confirmation

### Hooks

- `useAchievements` - Main hook for achievement integration
- `useAchievementTrigger` - Trigger achievement checks manually
- Integration with existing `useStats` hook

---

## Usage

### Adding New Achievements

1. Add achievement definition to `ACHIEVEMENTS` array in `store/useAchievementStore.ts`
2. Define achievement requirements and metadata
3. Achievements are automatically checked based on requirements

```typescript
{
  id: 'new_achievement',
  title: 'Achievement Title',
  description: 'Achievement description',
  icon: '🎯',
  rarity: 'rare',
  points: 100,
  category: 'milestone',
  requirements: { type: 'total_correct', value: 1000 },
  hidden: false // Optional: set to true for secret achievements
}
```

### Triggering Achievement Checks

Achievement checks are automatically triggered:

- After correct/incorrect answers
- When sessions are saved
- When stats are updated

Manual triggering:

```typescript
const { triggerAchievementCheck } = useAchievementTrigger();
const newAchievements = triggerAchievementCheck();
```

### Displaying Achievement Status

```typescript
const { totalPoints, level, unlockedCount, hasUnseenNotifications } =
  useAchievements();
```

---

## File Structure

```
features/Achievements/
├── store/
│   └── useAchievementStore.ts    # Main achievement store with 80+ achievements
├── components/
│   ├── global/                   # Global achievement components
│   └── progress/                 # Progress tracking components
├── hooks/
│   └── useAchievements.ts        # Achievement hooks
└── __tests__/
    ├── mastery.property.test.ts
    ├── meta.property.test.ts
    ├── modeCompletion.property.test.ts
    ├── streak.property.test.ts
    ├── threshold.property.test.ts
    ├── timeBased.property.test.ts
    └── variety.property.test.ts
```

---

## Best Practices

1. **Performance** - Achievement checks are debounced and optimized
2. **Persistence** - All progress is saved locally with backup/restore options
3. **Accessibility** - Proper ARIA labels and keyboard navigation
4. **Responsive Design** - Works across all device sizes
5. **Integration** - Seamlessly integrates with existing game flow

---

## Troubleshooting

### Common Issues

1. **Achievements not unlocking** - Check if stats are properly updating
2. **Notifications not showing** - Verify notification container is mounted
3. **Progress not saving** - Check localStorage permissions

### Debug Tools

- Achievement recalculation in settings
- Export/import for data backup
- Console logging for development

---

## Contributing

When adding new achievements:

1. Follow existing naming conventions
2. Use appropriate rarity levels
3. Test achievement triggers thoroughly
4. Update this documentation
5. Consider performance impact
6. Add property tests for new requirement types

The achievement system is designed to be extensible and maintainable, encouraging continued learning and engagement with the KanaDojo platform.
