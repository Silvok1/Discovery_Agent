# Document #4: Survey Display & Skip Logic

This document outlines the conditional logic framework used to create dynamic and personalized respondent journeys.

## 1. Logic Types
The platform implements three distinct layers of logic:

### 1.1. Display Logic
- **Scope:** Controls the visibility of a **Question** or an entire **Block**.
- **Behavior:** By default, items are shown. If Display Logic is added, the item is hidden unless the conditions are met.
- **Data Sources:** Can be based on **Previous Answers** or **Respondent Data** (Embedded Fields).

### 1.2. Skip Logic
- **Scope:** Controls the linear flow of the survey.
- **Behavior:** If a specific answer is given, the respondent "skips" over the intervening questions directly to a **Target Question** or the **End of Survey**.
- **Constraint:** Can only skip to subsequent questions (forward-only).

### 1.3. Choice Logic (Intra-Question)
- **Scope:** Controls visibility of individual **Choices**, **Rows**, or **Columns** within a single question (e.g., Matrix or Multiple Choice).
- **Behavior:** Useful for "filtering" options based on previous selections (e.g., "Which of the brands you selected above is your favorite?").

## 2. Condition Building
Logic is constructed using an `IF [Condition] THEN [Action]` pattern.

### 2.1. Supported Operators
| Operator | Compatibility |
| :--- | :--- |
| **Equals / Not Equals** | All types |
| **Is Answered / Is Not Answered** | All types |
| **Contains / Does Not Contain** | Multiple Answer MCQ |
| **Greater / Less Than** | Numeric, Sliders, Constant Sum |

### 2.2. Complex Logic (Boolean)
- **AND Logic:** Multiple conditions can be added to a single rule; all must be true for the action to fire.
- **Order of Operations:** Rules are evaluated sequentially.

## 3. Respondent Data Integration
Logic is not limited to survey answers. Rules can be based on **Embedded Fields** uploaded via the respondent CSV:
- `IF {{Department}} Equals "Sales" THEN Show Sales-Specific Block`
- `IF {{IsManager}} Equals "True" THEN Show Leadership Questions`

## 4. Technical Constraints
- **Directionality:** Conditions can only be based on questions that appear *chronologically before* the target question in the survey flow.
- **Cyclical Safety:** The UI prevents "Looping" logic where Question A leads to B and B leads back to A.
