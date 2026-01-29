# Document #2: Survey Build Functionality in Detail

This document details the survey design and building capabilities currently implemented in the Survey Builder module.

## 1. Core Builder Interface
The Survey Builder utilizes a workspace-centric design with a multi-tabbed interface:
- **Build:** The primary question canvas.
- **Pages:** Management of Welcome, Consent, and Thank You screens.
- **Look & Feel:** Branding and visual customization.
- **Survey Flows / Logic:** Advanced branching and skip logic.
- **Settings:** Backend configuration and constraints.

## 2. Question Architecture
The system supports a hierarchical structure:
1.  **Block:** The logical container for questions. Used for grouping related items and applying logic (e.g., Block Randomization).
2.  **Page:** Defined by Page Breaks within blocks. Each page is presented sequentially to the respondent.
3.  **Question:** Individual data collection units.

## 3. Supported Question Types (14)
The current builder implements a comprehensive set of question types:

| Type | Description |
| :--- | :--- |
| **Multiple Choice** | Single or Multiple answer with list/dropdown formats. |
| **Text Entry** | Single-line, Multi-line (Essay), or numeric inputs. |
| **Form Field** | Grouped text inputs for collecting structured data (e.g., contact info). |
| **Matrix Table** | Evaluation of multiple rows against a shared set of columns. |
| **Side-by-Side** | Advanced matrix allowing multiple question formats per row. |
| **Slider** | Visual numeric input using bars, sliders, or star ratings. |
| **Rank Order** | Drag-and-drop or textbox-based prioritization. |
| **Constant Sum** | Allocating a fixed total (e.g., 100 points) across items. |
| **Pick, Group, Rank** | Categorizing items into buckets and then ranking them. |
| **Reputation Index (NPS)**| Standard 0-10 net promoter score calculation. |
| **Text / Graphic** | Non-data blocks for instructions, images, or separators. |

## 4. Question Library & Templates
A key feature is the **Question Library**, allowing users to skip design by choosing from 50+ pre-validated templates across categories:
- Customer Feedback (CSAT, NPS)
- Employee Engagement (Satisfaction, Growth)
- 360 Leadership Assessment (Competency-based)
- Event Registration
- Demographics

## 5. Visual Branding (Look & Feel)
- **Primary Color & Accents:** Controlled via HEX input or palette picker.
- **Typography:** Selection from curated Google Font families (Inter, Roboto, Poppins, etc.).
- **Progress Bars:** Options for standard bars, percentage text, or "Page X of Y" counters.
- **Styling:** Global control over border radius, question spacing, and background imagery.
- **Live Preview:** Real-time rendering of changes in a simulated mobile/desktop environment.

## 6. Power-User Features
- **Auto-Save:** Real-time state persistence to prevent data loss.
- **Undo / Redo History:** Deep stack (50+ actions) history for complex build sessions.
- **Trash Bin:** Staging area for deleted blocks/questions with "Restore" capability.
- **Logic Builder:** Interface for setting up "If/Then" rules for question visibility and branching.
- **Piping:** Ability to inject respondent name or previous answers into question text.
- **Rich Text Editor:** Full Tiptap-based HTML editing for question text and descriptions.
