# Side by Side Question

1. **Structure**
    - **Visual Elements:** A compound table where each *row* is a subject or item, and each *column* is essentially a separate question about that item. It allows multiple question types to appear “side by side” under one overall question. For example, a side-by-side could ask about several products (rows) and have one column for a satisfaction rating (e.g., a Likert scale) and another column for an open-ended comment.
    - **Statements (Rows):** These are the items or subjects of the question (listed down the left, similar to matrix statements).
    - **Columns:** Each column has its own question format and choices. All columns share the same set of rows.
    - **Variations:** Instead of predefined variations like other question types, you configure the Side by Side by choosing column types:
        - *Scaled Response (Likert Scale) Columns:* A column where you present choices like a Multiple Choice. Under this, Qualtrics offers:
            - **Single Answer** (radio buttons per row),
            - **Multiple Answer** (checkboxes per row),
            - **Dropdown List** (a dropdown menu for each row).
          These function like a Matrix within that column.
        - *Open-Ended Text Columns:* A column of text entry boxes for each row. You can set the text box size (Short, Medium, Long, Essay) for that column. 
        - (There is no direct slider or other specialized column type; side-by-side primarily supports Likert-type or text input columns. A Yes/No question can be a Single Answer with two choices “Yes” and “No”.)
        - You can include multiple columns of either type. For example, Column 1 could be a Single Answer scale (“Easy, Neutral, Difficult”), Column 2 could be a Single Answer Yes/No, and Column 3 a text entry for comments.
2. **Settings & Features**
    - **Add/Remove Columns:** In the editing pane, you can add up to 10 columns. Each column can be configured via *Column Options*. You can move columns left or right to change their order.
    - **Column Options & Types:** For each column:
        - If it’s Scaled (Likert): define the answer choices for that column. E.g., you might set column 1’s choices to a 5-point satisfaction scale, and column 2’s choices to Yes/No.
        - If it’s Open-Ended: choose the text box size (Short/Medium/Long/Essay) and optionally set content validation (e.g., Column 2 might require an email format if asking for email in each row).
        - You can also rename the column headers to serve as the question text for that sub-question (these appear at the top of each column).
    - **Repeat Headers:** If you have many rows, you can enable *Repeat Headers* (under Format) so that the column headers (the titles of each column) repeat periodically down the table (similar to matrix tables). This helps respondents not lose track of what each column means if the list is long.
    - **Statements (Rows) Management:** You can add or remove statements (rows) and edit their text just like in a Matrix question. The rows will apply to all columns uniformly.
    - **Validation:** Each column can have its own validation rules:
        - For *Scaled columns*: you can force a response in each row for that column (Qualtrics will treat it similar to making that sub-question required). If multiple answer column, you can specify minimum/maximum selections per row via Response Requirements, but typically side-by-side doesn’t provide advanced per-row validation for multi-select beyond what a matrix would.
        - For *Text Entry columns*: you have a variety of validation options (accessible via the column’s options). You can require each text entry in that column (force each row’s box to be filled), or set a minimum/maximum *number of text responses* that must be filled in that column (e.g., “Each group contains at least 1 comment” doesn’t quite apply here – more applicable to Pick, Group, Rank – but side-by-side text columns have options like “Force Response” or “Force Response Range” which can ensure respondents fill in, say, at least X of the text boxes in that column). You also can set *Content Validation* on a text column (e.g., Column 3 must be a number or email for each entry).
        - Essentially, each column in a Side by Side is treated as its own question for validation purposes. So you might force responses in some columns but not others.
    - **Display & Layout:** By default, columns are shown separated by vertical lines. You can leave some column header or label blank if you want (Qualtrics tip: pressing space in a label will leave it blank, useful for layout tweaks).
    - **Mobile Consideration:** Side by Side questions are generally not considered mobile-optimized if they have many columns, as they can become too wide for smaller screens. On mobile, respondents might see the table scroll or stack in an unusual way. Qualtrics might not automatically convert side-by-side into a more mobile-friendly format, so it’s good practice to test or use alternative designs for small screens.
    - **Logic Support:** Each column’s data can be referenced in logic. Since internally Qualtrics treats each column like a separate question, you will see something like “Side by Side Question – Column 1” as a target in logic conditions. You can use Skip/Branch Logic on these sub-questions just like on normal questions. For instance, “If [Side by Side Q].[Column 2][Row 5] = Yes then…” is possible (meaning if in row 5 of column 2 the respondent selected Yes). Display Logic at the row level (to show/hide certain rows) is not directly supported within a single side-by-side question – if you need to hide specific rows for some respondents, you would likely need separate questions or some custom scripting.
3. **Data Export Schema**
    - **CSV Column Header Format:** The data file will have separate columns for each “cell” of the side-by-side, similarly to how Matrix exports:
        - For a *Single Answer* or *Dropdown List* column: the export will have one column per row in that column. The naming convention is usually `[QuestionID]#[ColumnID]_[RowID]`. For example, `Q7#1_3` might indicate Question 7, first column, 3rd row – which would contain the choice selected. Qualtrics, when exporting with labels, might instead use a composite header like “Q7 Col1: Ease of Use – Item 3” or “Ease of Use (Column 1) - [Row Text]”. Essentially, each row’s answer in that column is its own data point.
        - For a *Multiple Answer* column: each possible answer for each row becomes its own column (because multi-select outputs as separate binary variables if split). The naming adds an extra identifier for the choice. For example, you might see `Q7#2_1_1` for Column 2, Row 1, Answer 1. In that column, a “1” in the cell means the respondent checked that option, and blank/“0” means they did not. (If you export labels, you’d see the text of the choice for checked, and blank for not checked, or sometimes the text vs blank.)
        - For an *Open-Ended Text* column: each row’s text box is a column in the data. If the column only has one text box per row, it will be similar to single-answer: one column per row (e.g., `Q7#3_2` for Column 3, Row 2 text). If by any chance a column had multiple text inputs in one row (generally not the standard use), the format would include an additional index for the answer box, e.g., `QID#_Row_Answer`. (However, usually it’s one text field per row per column.)
        - The column headers in a fully labeled export might concatenate the side-by-side question text, the column header, and the row text.
    - **Data Values:** 
        - For *Scaled (Single-answer)* columns: the value is the recode number of the choice selected in that row (or the choice text if exporting labels). Each row has one such value. If a respondent did not select anything for that row (and it was allowed to be blank), the cell is blank.
        - For *Scaled (Multi-answer)* columns: if split into multiple columns, each of those columns contains a 1 or 0 (or “Selected”/“Not Selected” label) indicating whether that particular option for that particular row was chosen. If not split (combined), Qualtrics would instead list all selected options in one cell separated by commas, but by default the export tends to split multi-selects.
        - For *Text Entry* columns: the cell contains whatever text the respondent entered for that row’s field. If left empty, it’s blank.
        - *Example:* Suppose a side-by-side has rows [Product A, Product B] and two columns: Column1 = Satisfaction (choices: Very Satisfied, Satisfied, Dissatisfied), Column2 = comment (text). In the export, you’d have:
            - “Satisfaction - Product A” with value like “Very Satisfied” (or a code, e.g., 1) for that respondent.
            - “Satisfaction - Product B” with that respondent’s selection for B.
            - “Comment - Product A” with whatever text they typed for A.
            - “Comment - Product B” with text for B.
        - If any cell was left unanswered (no selection, no text), that cell is blank in data.
    - **Recode Values:** Each column’s data follows the recode rules of that column’s type:
        - For Single Answer columns, the choices have recode values (default 1,2,3... which you can adjust per column if needed). Those recodes are used in numeric exports.
        - For Multi Answer columns, each option is typically represented as 1 (selected) / 0 (not). The option itself might have an internal ID but effectively the presence/absence is the data. (If exporting numeric, “1”/blank; if exporting labels, option text/blank.)
        - Text columns don’t use recodes (they are open text).
        - All recoding is managed per column as if it were its own question. Qualtrics does allow you to set “Export Tags” on side-by-side choices (which could alter the naming in exports), but you cannot recode the grouping of a side-by-side as one entity – you recode within each column’s choices. In summary, treat each column’s recode scheme independently, exactly as you would if that column were a stand-alone question of that type.
