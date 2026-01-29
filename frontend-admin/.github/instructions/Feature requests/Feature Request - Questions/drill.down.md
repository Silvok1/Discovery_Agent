# Drill Down Question

1. **Structure**
    - **Visual Elements:** A sequence of dependent dropdown menus. The respondent first selects an option from a top-level dropdown. Based on that choice, a second dropdown is populated with a refined list of options. If there is a third level, it will then show options filtered by the second selection, and so on. The interface typically shows these dropdowns side by side or one after another labeled as categories.
    - **Hierarchy:** Each dropdown represents a level in a hierarchy (e.g., Country -> State -> City, or Year -> Make -> Model for cars). The first dropdown has all top-level categories. Once the respondent picks one, the next dropdown activates with the relevant sub-categories of that choice, and so forth.
    - **Variations:** The number of levels can vary (commonly 2 or 3 levels, but can be more, up to some practical limit like 4 or 5). The question is set up by importing a file that contains the hierarchy of options. You cannot do multiple independent hierarchies in one question; it’s one drill-down structure per question.
    - **Example:** If asking for a car: First menu = Year (e.g., 2020, 2021, 2022...), Second = Make (filtered to those makes available in that year), Third = Model (filtered by the make and year chosen).
2. **Settings & Features**
    - **Data File Import:** Drill Down requires uploading a CSV or TSV file containing all combinations of the hierarchy. Each column in that file corresponds to one dropdown level. Each row in the file is one complete path. For example:
        ```
        Year,Make,Model
        2020,Ford,F-150
        2020,Ford,Escape
        2020,Toyota,Corolla
        2020,Toyota,Camry
        2021,Ford,F-150
        ... etc.
        ```
      No header row should be included in the file (Qualtrics expects raw data rows).
    - **Groups/Levels:** After importing, the number of columns in the file determines the number of dropdowns that will appear. You should label each level by editing the “choice” text for the group headers in the question editor. For example, set Choice 1 text to “Year”, Choice 2 text to “Make”, Choice 3 text to “Model” to label the dropdowns.
    - **Adjusting Options:** If needed, you can manually edit or add combinations by re-uploading a new file or, before collecting data, by modifying the existing list via export/edit/import. Once data is collected, **do not change the drill-down options** (because it will mess up how stored data corresponds to options).
    - **Validation:** You can force response to ensure a respondent makes a selection at each level (Qualtrics automatically treats an unanswered drilldown as incomplete if Force Response is on). There isn’t a custom validation to ensure logical consistency (because the logic is built-in via the data file).
    - **Behavior:** If a respondent selects a top-level option that has no further subdivisions (maybe a rare case, but suppose a particular Year-Make had only one Model in the list, the third dropdown might auto-select it or just present one choice). If they select an option and then go back and change a higher-level selection, the lower dropdowns reset.
    - **Logic Support:** 
        - *Branch Logic:* Each dropdown selection can be referenced in logic. Qualtrics treats each level as a separate field in conditions. For example, you can have logic: “If DrillDownQuestion (Year) = 2020 and DrillDownQuestion (Make) = Toyota then…” etc. Typically, in the condition builder, you’ll pick the Drill Down question, then it asks which “Group” (level) you mean, and then the specific value.
        - *Piped Text:* You can pipe each part of the answer separately via piped text (each level has its own piped text code). Qualtrics might also have a combined pipe for the full path, but usually you pipe each dropdown’s value if needed.
        - *Carry Forward:* Drill Down questions don’t carry forward choices into another question directly (since they are dynamic), but you can use Embedded Data to capture the selections if needed for later use.
    - **Limitations:** There’s a limit of 10,000 cells in the drill-down file (which is product of rows * columns). And across the whole survey, a limit of 30,000 drill-down cells. If you have a huge hierarchy exceeding that, you’d need to shorten lists or break it into separate questions.
    - **Example Setup:** If you want a respondent to select their location: first dropdown Country, second State, third City – you prepare a file with three columns (Country,State,City) and list each city on its own row along with its state and country. After import, you label the groups as Country, State, City. The survey will then guide the respondent: choose Country first, then State (list filtered to that country’s states), then City (filtered to that state).
3. **Data Export Schema**
    - **CSV Column Header Format:** Each level of the drill down appears as a separate column in the exported data. The columns will be in order of the drill-down hierarchy. If you export with question text headers, you might see the question text repeated with a descriptor. More likely, Qualtrics will use the group labels or just position numbers. For instance, you might get headers like “Q5 (Year)”, “Q5 (Make)”, “Q5 (Model)” if you labeled your dropdowns, or simply the question text with an ordinal.
    - **Data Values:** 
        - If you export **Labels**, each column will contain the text of the option the respondent selected at that level (e.g., “2020” in the Year column, “Toyota” in the Make column, “Corolla” in the Model column).
        - If you export **Values**, Qualtrics will output numeric codes. Drill Down assigns a unique coded value to every possible answer at each level. These values are not simple 1,2,3 in order; rather, Qualtrics essentially flattens all unique entries. The coding scheme often works such that:
            - The first dropdown selection has a code (e.g., maybe 1 for “2020”, 2 for “2021”, etc., in some arbitrary but likely chronological order).
            - The second dropdown’s selection is coded with a number that actually represents the combination of first and second choice. For example, “2020 ~ Toyota” might have a code 37 (completely example), representing that path up to second level.
            - The third dropdown’s value code represents the full combination up to that third level (“2020 ~ Toyota ~ Corolla” might be 45).
          In other words, Qualtrics behind the scenes enumerates every final answer combination and every partial combination and gives them codes “Answer 1, Answer 2, …” in the order they appear in your uploaded list.
        - Because these codes are not human-readable, Qualtrics recommends exporting labels for drill-down or using the translation file method to see the mapping of codes to text.
        - In the data example given in documentation: one respondent’s data might show Year = 28, Make = 29, Model = 30 (values) which correspond to Year=1999, Make=Ford, Model=Taurus in labels. Essentially, those numeric values are references to “Answer28, Answer29, Answer30” which were the sequence numbers of those entries in the master list.
    - **Recode Values:** You cannot manually recode the values for drill-down options in the survey editor. They are determined by the position in the file (and as mentioned, Qualtrics doesn’t show you a recode mapping in the UI for drill downs). The only way to see or change those codes is to change the order in the source file (not practical post-collection) or to download the translation file which lists all “Answer” codes and their text. 
        - Essentially, treat the text as the meaningful data. If you need numeric coding (for analysis outside Qualtrics), you should do the recoding after export (e.g., code each country/state to some numeric scheme in your stats program).
        - If you are running a multi-language survey, note that the drill-down values won’t be easily translatable via the normal translation interface (they are part of that imported file).
    - **Output Example:** If a respondent chose “1999” -> “Ford” -> “Taurus”, your data in label export would have three columns: `1999 | Ford | Taurus`. In numeric export, it might be `28 | 29 | 30` (which correspond internally to those choices). Each of those numeric values is unique to that specific chain up to that point.
