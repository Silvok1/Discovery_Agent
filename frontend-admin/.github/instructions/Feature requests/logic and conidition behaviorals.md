# Survey Platform Question Features Outline

This outline details the available behaviors and advanced logic options that can be applied to individual survey questions and answer choices.

## I. Question Behavior (General)

* **Custom Question Behavior:** Options can be enabled for each question to enhance survey design.
* **Recode Values:** Allows changing the default numeric values or variable names for answer choices.
    * The updated coding is used for calculating all statistics, reports, and raw data.
* **Adding & Removing Notes:** Ability to attach notes to a question.
* **Default Choices:** Pre-populate answer choices within a question when the respondent opens the survey.
    * This is useful for asking respondents to update previously collected data, such as mailing address or email.
    * Supports displaying **Piped Text** (dynamic content) in default choices.

---

## II. Conditional Logic

### 1. Display Logic
* **Purpose:** Customizes the survey for each respondent by showing questions or answer choices conditionally based on previous information.
* **Conditional Display Targets:**
    * Questions.
    * Answer Choices.
* **Conditions can be based on:**
    * **Question:** A specific answer to a previous question.
    * **Embedded Data:** Information stored about the respondent (e.g., Age equals 25).
    * **Contact List:** Information already stored in a contact list field (e.g., first name, last name, or email).
    * **GeoIP Location:** The estimated location (country, city, postal code) based on the participant's IP address.
* **In Page Display Logic:** An option to display the conditional question immediately once the condition is met, without inserting a page break.

### 2. Skip Logic
* **Purpose:** Sends respondents **forward** to a future point in the survey based on how they answer a question.
* **Limitation:** Can only be used to send respondents forward in the survey, not backward.
* **Usage:** Ideal for simple skips (e.g., skip to the end of the survey if the respondent does not agree to a consent form).
    * For more advanced logic involving multiple AND/OR statements, Display Logic or Branch Logic is recommended.

---

## III. Answer Choice Management

### 1. Carry Forward Choices
* **Purpose:** Allows copying specific answer choices from one question and using them as answer choices in a future question.
* **Example Use Case:** Asking respondents to first select which products they bought, then carrying those selected choices forward into the next question to ask them to rank their preference *from that subset only*.
* **Carry Forward Options:** Conditions for which choices to carry forward can include:
    * Selected Choices.
    * Unselected Choices.
    * All Choices (Displayed & Hidden).
    * Displayed Choices (Not Displayed Choices).

### 2. Choice Randomization
* **Purpose:** Randomizes the order of answer choices to help overcome bias resulting from item presentation order.
* **Randomization Types:**
    * **No Randomization:** The default setting.
    * **Display choices in a random order:** Randomizes all answer choices.
    * **Present only *N* of total choices:** Randomly displays a specified number of choices from the total available.
    * **Randomly flip the order of choices:** Randomly reverses the entire order of presented choices (e.g., A, B, C becomes C, B, A).
        * This can be set to **Consistently reverse the choice order** for all questions with this option selected.
    * **Advanced Randomization:** Allows specifying which choices are randomized, which are excluded, and which are fixed in a specific location (top or bottom).