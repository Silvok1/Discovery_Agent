### Phase 1: The "Sentiment Bucket" Architecture

Instead of trying to program every permutation hard-coded, you need to normalize all rating-style data into a standardized **Sentiment Schema**.

Every Multiple Choice, Matrix Row, or Scaled question should inherently possess a mutable configuration object that looks like this:

#### The Concept: `SentimentMapping`
For every question, the system attempts to auto-assign choices to three buckets: **Negative (Unfavorable)**, **Neutral**, and **Positive (Favorable)**.

**The Data Object (JSON Model):**
```json
{
  "questionId": "Q1",
  "reportingType": "likert_scale", // vs "categorical" (nominal)
  "scaleDirection": "ascending", // 1=Low/Bad, 5=High/Good
  "mapping": {
    "unfavorable": [1, 2], // Raw values mapped to "Bad"
    "neutral": [3],        // Raw values mapped to "Neutral"
    "favorable": [4, 5]    // Raw values mapped to "Good"
  },
  "stats": {
    "calculateMean": true,
    "calculateNPS": false
  }
}
```

---

### Phase 2: The Automation (Heuristic Inference)

You want the system to *guess* correctly 90% of the time so the user doesn't have to configure every question. You build an **Inference Engine** that runs when a survey is published or a report is first generated.

**The Logic Flow:**

1.  **detect_ordinality:**
    *   Does the question use numbers (1-5, 0-10)?
    *   If words, do they match a known ordinal dictionary? (e.g., ["Strongly Disagree", "Disagree", "Neutral"...])

2.  **detect_direction:**
    *   **Keyword Scanning:** Check the label of the *first* option vs. the *last* option.
        *   If Option 1 contains "Disagree", "No", "Low", "Never" $\rightarrow$ **Ascending Scale** (1=Bad, 5=Good).
        *   If Option 1 contains "Agree", "Yes", "High", "Excellent" $\rightarrow$ **Descending Scale** (1=Good, 5=Bad).
    *   **Numeric Heuristic:** If 0-10, usually 10 is favorable.

3.  **auto_bucket:**
    *   *If 5 options:* 1-2 (Neg), 3 (Neu), 4-5 (Pos).
    *   *If 4 options (Forced Choice):* 1-2 (Neg), 3-4 (Pos). (No Neutral).
    *   *If 3 options:* 1 (Neg), 2 (Neu), 3 (Pos).
    *   *If 2 options (Binary):* 1 (Neg), 2 (Pos).

**Outcome:** The system generates a default `SentimentMapping` object. The report generates automatically based on this guess.

---

### Phase 3: The Customization (User Override)

Since the inference will sometimes be wrong (e.g., a user creates a scale: 1=Good, 2=Bad, 3=Great), you need a **"Report Settings" UI** for the admin.

**The UI Controls:**
1.  **Reporting Mode Toggle:** "Treat as Scale (Average/Sentiment)" OR "Treat as Nominal (Categories only)."
    *   *Switching to Nominal disables the "Favorable" calculation and just shows pie charts.*
2.  **Reverse Scale Button:** One click to flip the `scaleDirection`.
    *   *Logic:* Swaps the `favorable` and `unfavorable` arrays.
3.  **The "Bucket" Drag-and-Drop:**
    *   Show three containers: Unfavorable, Neutral, Favorable.
    *   Show the answer choices as draggable pills.
    *   Allow the user to drag "Somewhat Agree" from Favorable to Neutral if they are strict graders.

---

### Phase 4: Mapping to Your Specific Question Types

Here is how you apply this architecture to the file types you uploaded:

#### 1. Multiple Choice & Matrix Table (Likert Variations)
*   **The Problem:** 1-5 Scale, Yes/No, Frequency.
*   **The Fix:** Apply the **Sentiment Bucket** model.
    *   **Visual Output:** Stacked Bar Chart (Red/Gray/Green) + "Top 2 Box Score" (percentage of Favorable bucket).
    *   **Matrix Special Handling:** The Matrix is just a parent wrapper. Each *Row* (Statement) gets its own `SentimentMapping`. You allow the user to set the mapping for the *Header*, which cascades down to all rows, but allow individual row overrides (for reverse-coded questions like "I am often frustrated").

#### 2. Net Promoter Score (NPS)
*   **Automation:** This is the easiest. It is **Standardized**.
*   **Mapping:**
    *   Unfavorable (Detractor): 0-6
    *   Neutral (Passive): 7-8
    *   Favorable (Promoter): 9-10
*   **Customization:** Lock this. Do not allow users to customize NPS buckets, as that violates the definition of NPS. Only allow them to hide the question.

#### 3. Rank Order
*   **The Problem:** Ranking #1 is "Best" (lowest number = highest sentiment).
*   **Automation:**
    *   This is an **Inverse Weighted calculation**.
    *   If 5 items are ranked: Rank 1 gets 5 points, Rank 5 gets 1 point.
*   **Customization:** Allow the user to toggle between "Rank Distribution" (how many times was Item A ranked #1) vs. "Weighted Score" (overall leaderboard).

#### 4. Slider
*   **The Problem:** 0-100 continuous data.
*   **Automation:** Treat as **Ratio** data.
    *   Default reporting: Mean, Median, Min, Max.
*   **Bucketing (Advanced):** Allow the user to define "Bands" in the Reporting UI.
    *   *User Config:* "Create buckets for 0-20 (Low), 21-80 (Mid), 81-100 (High)."
    *   Once buckets are defined, treat it like a Multiple Choice question.

#### 5. Constant Sum
*   **The Problem:** Allocation of resources (e.g., 100 points split 3 ways).
*   **Automation:** Pie chart of the *average* allocation per category.
*   **Math:** Sum of Item A across all users / Total Sum of all items.

#### 6. Hot Spot (Like/Dislike Mode)
*   **The Problem:** It's visual data, but it has sentiment (Green/Red).
*   **Mapping:**
    *   "Like" click = +1 (Favorable)
    *   "Dislike" click = -1 (Unfavorable)
    *   No click = 0 (Neutral)
*   **Reporting:** Calculate a "Net Sentiment Score" per region.
    *   Formula: `(Count(Likes) - Count(Dislikes)) / Total Respondents`.

#### 7. Pick, Group, & Rank
*   **The Problem:** Items are categorized *and* ranked.
*   **Reporting:** Two widgets.
    *   Widget 1 (Categorization): Which Group did Item A fall into most often? (Distribution).
    *   Widget 2 (Ranking): Within "Group 1", what was the average rank of Item A?

---

### Summary Checklist for Development

To build this "Automated Reporting Engine," your backend needs to perform these steps on survey generation:

1.  **Ingest Question:** Identify type (e.g., MC).
2.  **Scan Choices:** Look for keywords (Agree, Yes, No, 1, 5).
3.  **Generate Metadata:** Save a hidden JSON object with the question `reporting_config`.
    *   *Default:* `{"buckets": {"fav": [4,5], "neu": [3], "unfav": [1,2]}}`
4.  **Frontend Render:** The report page reads the `reporting_config`, not just the raw data.
5.  **User Edit:** When the user clicks "Edit Report Settings" on a chart:
    *   They update the `reporting_config`.
    *   The chart re-renders instantly without changing the underlying raw data.
