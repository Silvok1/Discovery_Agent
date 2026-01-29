### Epic 1: Dynamic Data Modeling (The "Perceptyx Solution")
**Goal:** Decouple the "Survey Structure" from the "Analytical Structure." Allow users to redefine what measures what *after* data collection, without altering the raw responses.

*   **Story 1.1: Virtual Dimension Manager**
    *   **As a** user,
    *   **I want to** create, rename, and delete Dimensions (Factors) and drag-and-drop items into them at any time,
    *   **So that** I can restructure my reporting model when I realize the original survey grouping doesn't fit the data.
*   **Story 1.2: Exploratory Factor Analysis (EFA) Assistant**
    *   **As a** researcher,
    *   **I want** the system to run an EFA (eigenvalues, scree plot) and suggest which items load together,
    *   **So that** I can scientifically validate my dimensions before finalizing the report structure.
*   **Story 1.3: Confirmatory Factor Analysis (CFA) Check**
    *   **As a** researcher,
    *   **I want to** see fit indices (CFI, TLI, RMSEA) for my current dimension configuration,
    *   **So that** I know if my manual grouping is statistically valid.
*   **Story 1.4: Retroactive Aggregate Recalculation**
    *   **As a** system,
    *   **I want to** instantly recalculate all "Dimension Scores" and "Benchmarks" when a user moves an item from Dimension A to Dimension B,
    *   **So that** the historical trends and current dashboard reflect the new definition immediately.

### Epic 2: Advanced Driver & Psychometric Analysis
**Goal:** Move beyond simple correlation to identify true leverage points, handling multicollinearity and complex relationships.

*   **Story 2.1: Relative Weights Analysis (RWA) / Shapley Value**
    *   **As a** user,
    *   **I want to** run a driver analysis that calculates the relative contribution of each predictor to the R²,
    *   **So that** I get an accurate ranking of drivers even when the questions are highly correlated (multicollinearity).
*   **Story 2.2: Dominance Analysis**
    *   **As a** researcher,
    *   **I want to** see which predictors consistently dominate others across all subset models,
    *   **So that** I can confidently tell executives which factors are the absolute most important.
*   **Story 2.3: Psychometric Network Analysis**
    *   **As a** researcher,
    *   **I want to** visualize items as nodes and partial correlations as edges (a "spiderweb" graph),
    *   **So that** I can identify "Central" items that bridge different concepts, rather than just looking at isolated factors.
*   **Story 2.4: Driver Interaction Matrix**
    *   **As a** user,
    *   **I want to** see a "Priority Matrix" plotting **Importance** (Derived Weight) vs. **Performance** (Current Score),
    *   **So that** I can identify the "Fix Now" items (High Importance, Low Score).

### Epic 3: AI Text Analytics & Thematic Trending
**Goal:** Treat unstructured text as quantitative data.

*   **Story 3.1: Sentiment-to-Score Conversion (BARS)**
    *   **As a** system,
    *   **I want to** assign a numeric sentiment score (-1.0 to +1.0) to every comment,
    *   **So that** I can visualize text sentiment distributions as if they were Likert scale bar charts.
*   **Story 3.2: Thematic Extraction & Clustering**
    *   **As a** user,
    *   **I want** the system to automatically group comments into Themes (e.g., "Compensation," "Manager Support"),
    *   **So that** I don't have to read 5,000 comments manually.
*   **Story 3.3: Thematic Trend Analysis**
    *   **As a** user,
    *   **I want to** see a line chart showing the *volume* and *sentiment* of specific themes over time (e.g., "Are people complaining about Pay more this quarter than last?"),
    *   **So that** I can catch emerging issues early.
*   **Story 3.4: Driver Analysis by Theme**
    *   **As a** user,
    *   **I want to** include "Comment Sentiment" as a predictor in my Driver Analysis,
    *   **So that** I can see if specific topics (like "Office Environment") are driving the Engagement Score.

### Epic 4: Survey Health & Data Quality (Integrated List)
**Goal:** Ensure data integrity using forensic statistical methods.

*   **Story 4.1: Careless Responding Detection (Pattern Recognition)**
    *   *User Story:* I want to see detection of patterned responses (e.g., alternating 1-2-1-2, ascending patterns 1-2-3-4-5, Christmas-treeing), so that I can identify respondents beyond just straight-lining who aren't engaging thoughtfully.
*   **Story 4.2: Item Non-Response Analysis**
    *   *User Story:* I want to see which questions have the highest skip/missing rates, so that I can identify confusing, sensitive, or poorly worded items.
*   **Story 4.3: Response Distribution Health (Floor/Ceiling)**
    *   *User Story:* I want to see floor/ceiling effects (% selecting extreme options) and variance metrics per question, so that I can identify items with poor discrimination.
*   **Story 4.4: Sample Representativeness Check**
    *   *User Story:* I want to compare demographic distributions against expected population parameters, so that I can assess potential sampling bias and weighting needs.
*   **Story 4.5: Long-String Analysis**
    *   *User Story:* I want to see the maximum consecutive identical responses per respondent (not just overall percentage), so that I can catch respondents who straight-lined sections.
*   **Story 4.6: Mahalanobis Distance (Multivariate Outliers)**
    *   *User Story:* I want to flag respondents with statistically improbable response patterns across multiple dimensions, so that I can identify sophisticated careless responders.
*   **Story 4.7: Reliability Comparison Across Subgroups**
    *   *User Story:* I want to see Cronbach's Alpha (and McDonald's Omega) broken down by demographic segments, so that I can assess measurement invariance.
*   **Story 4.8: Reading Speed Analysis (Speeders & Distracted)**
    *   *User Story:* I want to detect "too fast" responses based on reading speed (e.g., <2 sec/question) and "too slow" responses, so I can flag disengaged users.

### Epic 5: Dashboard Visualization & Customization (Integrated List)
**Goal:** Provide a flexible canvas for storytelling with data.

*   **Story 5.1: Color Scheme Customization**
    *   *User Story:* I want to customize color palettes (brand colors, colorblind-safe, sentiment-based), so that I can align with branding and accessibility.
*   **Story 5.2: Benchmarks & Reference Lines**
    *   *User Story:* I want to add reference lines, target values, or benchmark comparisons to charts, so that I can contextualize results.
*   **Story 5.3: Annotations & Callouts**
    *   *User Story:* I want to add text boxes and annotations to specific data points, so that I can highlight insights directly on the dashboard.
*   **Story 5.4: Statistical Significance Toggles**
    *   *User Story:* I want to toggle on/off significance testing markers (asterisks, color coding), so that I can distinguish meaningful differences.
*   **Story 5.5: Custom Grouping/Binning**
    *   *User Story:* I want to create custom demographic groups (e.g., binning tenure years into "Early/Mid/Late"), so that I can analyze segments beyond raw data.
*   **Story 5.6: High-Res Chart Export**
    *   *User Story:* I want to export individual widgets as PNG/SVG/PDF with custom dimensions, so that I can embed them in presentations.
*   **Story 5.7: Dashboard Templates**
    *   *User Story:* I want to save layout templates (e.g., "Executive Summary"), so that I can apply them to future surveys.
*   **Story 5.8: Conditional Formatting**
    *   *User Story:* I want to set rules (e.g., Red if <50%), so that problem areas stand out immediately.
*   **Story 5.9: Cross-Tab/Pivot Builder**
    *   *User Story:* I want to create custom cross-tabulations by dragging dimensions, so that I can explore intersectional patterns.
*   **Story 5.10: Time-Series/Wave Comparison**
    *   *User Story:* I want to overlay data from multiple waves on the same chart, so that I can track trends.
*   **Story 5.11: Custom Calculated Fields (Power User)**
    *   *User Story:* I want to create calculated fields (e.g., Index = AVG(Q1, Q3)), so that I can analyze composite scores without re-processing data.

---

### Technical Implementation Strategy: The "Dynamic Definition" Layer

To support **Epic 1 (Dynamic Dimensions)** specifically, your database schema needs to be clever. You cannot store "Engagement Score" as a static value in the Respondent table.

1.  **Raw Data Store:** Stores `QuestionID` and `ResponseValue` (immutable).
2.  **Definition Store:** Stores `DimensionID` -> Array of `QuestionIDs`. This is versioned.
3.  **Calculation Engine (The Python/Node Worker):**
    *   When a report loads, it fetches the *current* Definition.
    *   It pulls Raw Data.
    *   It aggregates on the fly (using Redis or similar for caching).
    *   *If a user changes a dimension:* You invalidate the Cache for that Dimension. The next load re-calculates aggregates based on the new mapping.