# Document #1: Email Functionality within the Survey Module

This document outlines the core email and communication features of the 360 Survey Platform as implemented in the current version.

## 1. Message Library
The platform features a centralized **Message Library** that serves as the single source of truth for all outgoing communications.

### 1.1. Library Scope
- **Universal Templates:** Global templates accessible across all campaigns and organizations.
- **Campaign-Specific Templates:** Customized templates that live within a specific campaign, overriding universal defaults.

### 1.2. Communication Plans
Templates are organized into **Communication Plans** (e.g., "Standard Leadership", "Executive Review", "Quarterly Pulse"). A plan acts as a bundle of scheduled messages for a specific survey lifecycle.

### 1.3. Template Types
The system supports two primary template categories:
- **360 Templates:** Participant Invitation, Reminder, Final Reminder, Rater Invitation, Rater Reminder, Rater Final Reminder.
- **Survey Templates:** Survey Invitation, Reminder Email, Thank You/Close-out Email.
- **Landing Pages:** Includes templates for Welcome Pages and Consent Forms.

## 2. Email Customization & Personalization
Emails are built using a visual editor that supports:
- **Dynamic Variables (Piping):** Support for `{{FirstName}}`, `{{LastName}}`, `{{Link}}`, `{{CampaignName}}`, `{{Deadline}}`, and `{{AssessmentOwner}}`.
- **Subject Line Customization:** Full control over subject lines with piping support.
- **Rich Text / Text-Only Flexibility:** Current implementation focuses on clean text/HTML emails to ensure high deliverability and mobile responsiveness.

## 3. Distribution & Scheduling
Distribution is handled at the **Survey Instance** level, giving users granular control over timing.

### 3.1. Distribution Types
- **Invitations:** The initial email sent to respondents. Can be sent immediately upon launch or scheduled for a future date/time.
- **Reminders:** Multi-stage reminder sequence. Users can add N reminders, each with specific timing.
- **Close-out Emails:** "Thank You" messages sent upon completion or manual closing of the survey.

### 3.2. Audience Targeting
Emails can be targeted based on respondent status:
- **All:** Entire respondent pool.
- **Incomplete (Default for Reminders):** Only those who haven't started or haven't finished the survey.
- **Completed:** For thank-you/follow-up messages.

### 3.3. Control Mechanism
- **Pause/Resume:** Global toggle to halt all scheduled emails for an instance if issues are detected.
- **Send Immediately Overrides:** Ability to bypass the schedule and fire messages manually from the Monitor dashboard.

## 4. Deliverability & Technical Configuration
- **Domain Verification:** Support for verifying sender domains via SPF, DKIM, and DMARC records.
- **Sender Profiles:** Ability to configure "Friendly From" names and reply-to addresses.
- **Test Sending:** Built-in "Send Test Email" functionality to verify rendering before launching at scale.
