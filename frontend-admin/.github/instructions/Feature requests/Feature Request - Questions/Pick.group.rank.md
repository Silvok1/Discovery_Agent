# Pick, Group, & Rank Question

1. **Structure**
    - **Visual Elements:** A drag-and-drop sorting task. Respondents are presented with a list of items on one side and one or more group boxes on the other side. They “pick” items from the list, “group” them into categories (the drop areas), and optionally “rank” the items within those groups. Each group is essentially a bucket where items can be placed.
    - **How it Works:** Initially, all choices (items to be sorted) appear in an ungrouped list. There are predefined groups (with names you specify) displayed as empty containers. The respondent drags each item into one of the groups. If ranking within groups is enabled (always on by default), the respondent can also order items by dragging them up or down inside the group.
    - **Variations:** There is essentially one primary format: *Drag and Drop*. (Unlike some question types, Pick, Group, & Rank doesn’t have multiple format options like radio vs text box; it’s inherently a drag and drop interface.) However, you can configure:
        - *Number of Groups:* You decide how many group categories there will be. For example, two groups labeled “Would Want” and “Would Not Want”, or three groups labeled “High Priority”, “Medium Priority”, “Low Priority”, etc.
        - *Stacking Options:* By default, groups are listed vertically. You can choose to display groups in two columns (side by side) for a more compact layout if you have many groups (via the *Add columns* option, which if set to 2 will place groups in two column layout).
        - *Stack Items:* There are format settings to change how items appear when dragged:
            - “Stack items” will visually stack the unpicked items in a pile rather than a list (saving space).
            - “Stack items in groups” will overlay items within the group rather than listing them, which effectively turns off the ranking component (because if items are stacked on top of each other, order isn’t visible or meaningful).
        - Typically, if ranking is not important, you might stack items in groups to just see which items were placed but not care about precise order.
    - This question type allows you to combine a grouping task with an internal ranking task (ranking within each group).
2. **Settings & Features**
    - **Group Options:** In the question editor, under *Groups*, you can:
        - Set the number of groups (the interface will initially show 2 by default, but you can increase that number).
        - Name each group (these names will appear as the headings of the drop zones).
        - Optionally use *Suggested Groups* if you had used Suggested Choices (for example, if the choices themselves came from a library with recommended group names, Qualtrics can auto-fill group names).
    - **Choice Options:** This question uses the list of choices (the items to sort). You add choices just like in a multiple choice list. Each choice will be an item that can be dragged. You can randomize the order of these items when they first appear in the list to avoid order bias.
    - **Validation:** Under *Response Requirements -> Add validation*, you have a few options to control how respondents must sort:
        - *Must select (pick) X to Y items:* You can require that a minimum and/or maximum number of items must be placed into *any* group (total). For example, “Must group at least 5 items” or “Must group between 3 and 5 items in total.” This ensures they don’t leave too many ungrouped or don’t overload all items if not needed.
        - *Each group contains X items:* You can enforce a rule per group. For example, each group must have at least 1 item, or exactly 3 items, etc. You set an exact number or a minimum/maximum for each group. (Qualtrics will then require that for every group.)
        - If neither is set, respondents could theoretically leave some items ungrouped (in the left list) or put all items in one group, etc., depending on your question wording.
    - **Rank Within Groups:** By default, items can be ordered inside the groups by dragging them up or down. This ranking is always captured, but you can decide if you care about it. If you enable “Stack items in groups,” as mentioned, then ranking within that group is effectively disabled (because items just pile, meaning order is not visible or recorded).
    - **Interactivity:** Respondents can drag items back out of a group to the left list or between groups if they change their mind. They can also drag items up and down within a group to adjust rank.
    - **Logic Support:** 
        - *Branch/Skip Logic:* You can use conditions based on whether a certain item ended up in a certain group or not. Qualtrics treats the output of this question in terms of each item’s group and rank. For instance, a logic condition could be “If Q1: Item ‘Phone’ is placed in Group 2… then branch…” or “If Item X’s Group equals ‘Would Not Want’…”. You can also check rank positions: “If Item Y’s Rank = 1 in its group…”. However, setting such logic requires careful use of the data or sometimes using Embedded Data because the interface might not directly present a simple way to pick “group membership” in the condition builder. (Often, it might be easier to use Embedded Data or custom coding to flag such conditions.)
        - *Piped Text:* You can pipe the results, for example listing all items a respondent placed in a particular group or the rank order within a group. This is advanced and usually done by piped text codes or in reports rather than in the survey flow.
        - Keep in mind that because this question is complex, using its data for immediate display logic might require the survey to have the data recorded (which typically means end-of-survey or in a follow-up page, not on the same page).
    - **Appearance:** You can adjust minor things like the height of the group boxes (Qualtrics auto-expands them as items added). Test on desktop vs mobile – on mobile, drag and drop may be replaced with tapping items and tapping target groups.
3. **Data Export Schema**
    - **CSV Column Header Format:** The output is a bit complex. Qualtrics will provide data in multiple columns:
        - For each *item* (choice) in the question, two pieces of data are recorded: the group it was placed in, and the rank order within that group.
        - Typically, the dataset will have a pair of columns for each item. One might be labeled with the item name and “(Group)” and the other with the item name and “(Rank)” (if exporting labels).
        - If looking at raw column names, often the first of the pair is something like `QID1_ChoiceOrder` (which group index it went to) and the second is `QID1_ChoiceRank` for that item. However, in the exported data with choice text, you might see something like “Phone – Group” and “Phone – Rank”.
        - *Group Column:* The value indicates which group the item was sorted into. This is usually numeric (e.g., 0 for Group 1, 1 for Group 2, etc., since internally Qualtrics numbers the groups starting from 0). If an item was not placed into any group (left unpicked), it might have a special code (possibly a blank or some “-99” in older exports, but likely blank). In labeled exports, it might actually show the group name text.
        - *Rank Column:* The value is the position of that item within its group (1 for top of that group, 2 for second, etc.). If the item wasn’t placed in a group, rank might also be blank because it has no rank.
        - **Example:** Suppose there are 3 items (A, B, C) and 2 groups (“Want” and “Don’t Want”). If a respondent puts Item A and C in “Want” (with A ranked 1 and C ranked 2 there), and Item B in “Don’t Want” (rank 1 in that group). The data might look like:
            - Item A – Group: 0 (meaning Group 1, if “Want” is the first group)
            - Item A – Rank: 1
            - Item B – Group: 1 (meaning Group 2)
            - Item B – Rank: 1
            - Item C – Group: 0
            - Item C – Rank: 2
        - If exporting labels, you might see “Want” or “Don’t Want” in the Group column instead of 0/1.
    - **Data Values:** As described, the “Group” value is typically numeric (representing the group index). The “Rank” value is numeric (1 = top rank in that group, etc.). If an item was not placed into any group, by default Qualtrics treats it as if it remained in the list. In data, its Group might be blank and Rank blank. (If you set a validation like “must group all items,” then ideally no item is left ungrouped.)
    - **Recode Values:** There is no direct recoding for the group indices or ranks via the interface. Group names are not numeric, but in the backend data, groups are numbered starting at 0 (as noted). You cannot change that numbering scheme – Qualtrics uses the order of groups as defined. If you export data in “numeric values” format, you’ll see those group numbers. If you export in “choice text” (labels) format, you’ll see the group names instead. The ranking numbers are as given by the respondent and always start at 1 for the highest in each group. They’re not recodable (other than by post-processing the data). In summary, recode settings in the survey editor don’t apply to Pick, Group, & Rank because the “choices” (items) themselves aren’t given recode values; the output is positional.
