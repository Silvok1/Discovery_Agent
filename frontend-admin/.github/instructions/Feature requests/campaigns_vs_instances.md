# Document #3: Campaigns vs. Survey Instances

This document explains the structural relationship between Campaigns and Survey Instances, which forms the architectural backbone of the platform's multi-project management.

## 1. The Core Concept: Vertical Hierarchy
The platform uses a two-tier hierarchy to manage survey projects:
- **Tier 1: Campaign (The Container)**
- **Tier 2: Survey Instance (The Execution)**

## 2. Campaign: High-Level Container
A **Campaign** is the top-level entity representing a broad initiative or program.

- **Purpose:** Organizes related surveys, rater groups, or assessments under a single brand and owner.
- **Campaign Types:** 
    - **360 Campaign:** Specialized for multi-rater feedback cycles.
    - **Survey Campaign:** General-purpose survey management.
- **Shared Properties:**
    - **Branding Defaults:** Global email templates and "Look & Feel" presets.
    - **Ownership:** Access control lists (ACLs) are usually inherited from the campaign level.
    - **Reporting Aggregation:** Ability to view high-level stats across all instances within the campaign.
- **Status lifecycle:** `Draft`, `Active`, `Completed`, `Archived`.

## 3. Survey Instance: The Execution Layer
A **Survey Instance** is a specific, actionable project within a campaign.

- **Purpose:** Represents the actual deployment of a survey to a specific audience at a specific time.
- **Relationship:** 1 Campaign → Many Instances.
- **Why use Instances?**
    - **Versioning:** Instance A is the "2024 Pulse", Instance B is the "2025 Pulse" (same campaign, different data points).
    - **Audience Segmentation:** Instance A for "Sales Dept", Instance B for "Engineering" (running the same survey concurrently).
    - **Testing:** "Sandbox" instances can be created within a campaign without polluting live results.

### 3.1. Unique Instance Data
Each instance maintains its own:
- **Survey Data:** Its own copy of blocks, questions, and logic. Modifying a question in Instance A does not affect Instance B.
- **Respondent Source:** Can be unique per instance (e.g., CSV upload for one, Anonymous link for another).
- **Distribution Settings:** Unique schedules for invitations and reminders.
- **Analytics:** Individual results stored and calculated separately.

## 4. Key Workflows

### 4.1. "Pull Forward" (The Clone)
One of the most powerful features of the current architecture is the ability to create a new instance by "Pulling Forward" from a previous one. This clones:
- The survey structure.
- The respondent list (optional).
- email logic.

### 4.2. Instance Lifecycle
An instance moves through states independent of the parent campaign:
1.  **Draft:** Under construction in the Survey Builder.
2.  **Ready:** Validated and ready for launch (has survey, respondents, and schedule).
3.  **Live:** Emails are sending and responses are being collected.
4.  **Closed:** No more responses accepted; final reports are generated.

## 5. Summary Table

| Feature | Campaign Level | Instance Level |
| :--- | :--- | :--- |
| **Identity** | Initiative Name (e.g. "Annual 360") | Project Name (e.g. "Q1 Tech Dept") |
| **Execution** | No (Cannot "send" a campaign) | Yes (Can launch an instance) |
| **Data** | Metadata Only | Full Survey + Respondent Data |
| **Scheduling** | Global defaults only | Precise invitation/reminder dates |
| **Reporting** | Aggregate / Comparison | Individual Project Reports |
