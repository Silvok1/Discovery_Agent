# Document #5: Survey Builder Workspace - Tab Breakdown

This document provides a detailed breakdown of the functional areas within the Survey Builder, focusing on content capabilities and configuration depth.

## 1. Build Tab (The Canvas)
The primary workspace for question design and organization.
- **Content Level:** High. Uses the **Tiptap Rich Text Editor** for all question text.
- **Capabilities:**
    - Support for **Images & Media** directly in question stems.
    - **Piping/Merge Fields:** Inject respondent data (e.g., `Hello {{FirstName}}`) into questions.
    - **Block Management:** Drag-and-drop questions between logical blocks.
    - **Interaction:** Real-time drag-and-drop reordering of choices and questions.

## 2. Pages Tab (Survey Lifecycle)
Manages the "wrapper" pages that appear before and after the main questions.

### 2.1. Welcome Page
- **Content Level:** High (Rich Text).
- **Purpose:** Context setting and instructions. Supports full HTML formatting and personalized greetings.

### 2.2. Consent Page (GDPR)
- **Content Level:** Medium (Text-based).
- **Features:** Editable consent statement and a mandatory "Accept" checkbox. Essential for regulatory compliance.

### 2.3. Demographics Page
- **Content Level:** Standardized.
- **Library:** 11+ Pre-built questions (Age, Gender, Tenure, Job Level, etc.).
- **Customization:** Ability to add custom text, dropdown, or MCQ demographic fields.

### 2.4. Thank You Page
- **Content Level:** High (Rich Text).
- **Features:**
    - Closing message with support for piped completion data.
    - **Automatic Redirect:** Send respondents to a specific URL (e.g., your website) after X seconds.

## 3. Emails Tab (Communication Hub)
Configuration for all automated touchpoints throughout the survey lifecycle.

- **Content Level:** High (Rich Text Editor).
- **Template Types:**
    - **Invitation:** Sent at launch.
    - **Reminders (1, 2, Final):** Tiered sequence for non-respondents.
    - **Completion:** Confirmation email upon finishing.
- **Scheduling Logic:**
    - "Days after launch" or "Days before close" relative triggers.
    - Support for specific "Launch Date/Time" scheduling.
- **Verification:** Integrated **Domain Verification** status to ensure high deliverability and prevent spam flagging.

## 4. Settings Tab (Technical Core)
Global configurations that govern how the survey behaves and aggregates data.

- **Report Settings:** Define **Anonymity Thresholds** (e.g., "Do not show results if fewer than 5 people responded") to protect respondent privacy.
- **Keywords (Glossary):** Create a database of terms and definitions.
    - **UI Feature:** Terms update automatically in the survey with hover-tooltips for respondents.
- **Consent Toggle:** Global master switch to enable/disable the GDPR consent flow.

## 5. Summary of Content Capabilities
| Area | Rich Text? | Images? | Piping? | Logic? |
| :--- | :---: | :---: | :---: | :---: |
| **Questions** | ✅ | ✅ | ✅ | ✅ |
| **Welcome/Thank You** | ✅ | ✅ | ✅ | ❌ |
| **Emails** | ✅ | ❌ | ✅ | ❌ |
| **Glossary Terms** | ❌ | ❌ | ❌ | ❌ |
| **Consent** | ❌ | ❌ | ❌ | ❌ |
