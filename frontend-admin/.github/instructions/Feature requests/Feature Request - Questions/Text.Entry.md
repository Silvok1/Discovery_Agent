# Text Entry Question

1. **Structure**
    - **Visual Elements:** A single open-ended text input field where respondents can type their answer. Depending on configuration, this field may appear as one line or a larger text box for longer responses.
    - **Variations:** Several text box formats under *Text Type*:
        - *Single Line:* A one-line text field (good for short answers). 
        - *Multiple Lines:* A larger text box showing multiple lines at once. (Encourages longer responses; similar to “Essay” size.)
        - *Essay Box:* Essentially the same as multiple lines (a scrolling text area), often just a preset larger height.
        - *Password:* A single-line text box that masks input (characters display as dots). Useful if collecting a password or sensitive code (input is concealed from onlookers).
        - *(Autocomplete:* An advanced variation where the field suggests answers as the user types, based on a pre-defined list. **Note:** Autocomplete is treated as a separate question type in Qualtrics and may require additional setup.)
2. **Settings & Features**
    - **Validation:** You can enforce content rules by toggling *Add Validation*. This opens options like *Content Type* (e.g., must be a valid Email, Phone Number, Date, Postal Code, etc.) or *Length* requirements (minimum/maximum number of characters). If the respondent’s input doesn’t meet the set criteria, an error message is shown and they cannot proceed. You can also simply require that some text is entered (Force Response).
    - **Display Options:** The size (display length) of the text box can be adjusted. By default, “Multiple Lines” and “Essay” provide a taller box than “Single Line”. You can manually resize the text box in the survey editor by dragging its corner, if needed, to override the default. The question text itself can include instructions or a character limit note. (Qualtrics allows up to 20,000 characters input by default in a text entry field.) If you anticipate very long responses, an Essay format is recommended. 
    - **Logic Support:** The answer in a Text Entry can be used in skip/display logic, though typically it’s used with conditions like “is not empty” (to see if respondent provided any answer) or by piping the text elsewhere. Specific text matching in logic is possible via custom conditions (for example, “Text Entry contains ‘XYZ’”), but be cautious as open text can vary. Text entry questions can also be piped into later questions or displayed back to the respondent using piped text codes.
3. **Data Export Schema**
    - **CSV Column Header Format:** Each text entry question produces one column in the data set (per text entry field). If it’s a single standalone text entry, the column header will be the question text (or Tag or coded name). (For multiple text entry fields in one question, see **Form Field Question** below – that outputs multiple columns.)
    - **Data Values:** The content of the cell is exactly what the respondent typed (a string of text). If the field was left blank (and not forced), the data will be blank for that respondent.
    - **Recode Values:** Not applicable for open-ended responses – the answers are literal text, with no numeric coding. (There is no “recode” for text strings, though in analysis you might post-code or categorize them separately. Any internal character limit or validation does not assign a numeric code to the response itself.)
