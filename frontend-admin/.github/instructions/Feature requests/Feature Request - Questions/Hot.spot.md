# Hot Spot Question

1. **Structure**
    - **Visual Elements:** An image with predefined regions that respondents can click on. Each region is an area drawn by the survey designer (such as rectangles or custom shapes) on top of the image. The respondent indicates their answer by clicking one or more of these highlighted regions of the image.
    - **Interaction:** The question can be set so that clicking a region toggles it on/off (select/deselect) or allows positive/negative marking:
        - *On/Off Mode:* Regions are either selected (clicked, typically highlighted in a color) or not selected.
        - *Like/Dislike Mode:* Each region can be marked in one of three states – not clicked (neutral), marked positively (“Like”, often highlighted in green), or marked negatively (“Dislike”, often highlighted in red). The respondent could, for example, click once to “like” an area, click again to “dislike” it, and a third click might cycle it back to neutral.
    - **Regions:** You (the designer) add regions by drawing shapes on the image. Common shapes are rectangles by default, but you can create custom polygon shapes if needed (for irregular areas). These regions are invisible or semi-transparent to the respondent until interacted with (unless you choose to show outlines).
    - **Use Cases:** Often used for identifying areas of a concept (e.g., “Click the parts of the ad you find most appealing” or in Like/Dislike mode “Green = parts you like, Red = parts you dislike”). Another example: clicking on parts of a product image to signal interest or problems.
2. **Settings & Features**
    - **Adding Regions:** In the Qualtrics editor, after uploading the image for a Hot Spot question, you use the “Add Region” button. Each region can be resized and moved to cover the desired area on the image. You also give each region a name (for internal reference and for data reporting – these names are not shown to respondents on the survey).
    - **Custom Shapes:** By default, new regions are rectangular. If an area of interest is not rectangular, you can select a region and choose “Edit Shape” to add vertices and create a polygon that outlines the exact shape needed (e.g., outline a specific object in the image). This allows fine-grained regions, like circling an irregular logo or object.
    - **Interaction Mode:** Under Hot Spot Options, choose between:
        - *On/Off:* A simple toggle – each region is either selected (ON) or not (OFF). Only one click needed to select or unselect.
        - *Like/Dislike:* A three-state toggle – first click marks a region “Like”, second click marks it “Dislike”, third click returns it to neutral (no selection). On the respondent side, typically a “Like” highlights the region in one color (e.g., green) and “Dislike” in another (e.g., red).
    - **Target Visibility:** You can control whether regions are visible to the respondent by default. By default (Hover mode), regions are hidden until the respondent moves their mouse over the image, at which point the region outlines might highlight as they hover. Alternatively, you can set regions to “Always Visible,” meaning the clickable areas are outlined from the start (which can help users know where they can click, at the risk of potentially biasing by showing the defined areas).
    - **Response Requirements:** You can require a certain number of regions to be selected. Options include:
        - *Minimum regions selected:* e.g., “Please select at least 1 area” – the survey will not continue until the respondent clicks at least that many regions.
        - *Answer Range:* define a minimum and maximum number of regions that can be selected (e.g., “Select up to 3 regions” by setting min=0, max=3, or “Select between 2 and 5 regions”).
        - If Like/Dislike is used, these requirements typically count any marking (like or dislike) as a “selection.” There isn’t a direct way to require a certain number of likes vs dislikes using built-in settings (that would need custom validation), but you can require total markings.
    - **Hover Text & Feedback:** By default, when the respondent clicks a region, it changes color. There is no default tooltip or text feedback to respondent other than the highlight. (Qualtrics does not display the region name to the respondent; naming is just for data.)
    - **Logic Support:** 
        - *Branch Logic:* You can branch based on whether a particular region was selected (or liked/disliked). For instance, “If Region A is Selected” or in Like/Dislike mode, “If Region B is marked Dislike”. Qualtrics in the condition builder will list the Hot Spot question, and likely something like “Region A (Hot Spot) Is Selected” as a condition option. Similarly for Like/Dislike, it might allow “Region A Is Liked” or “Is Disliked”.
        - *Piped Text:* You can pipe which regions were selected by using piped text codes. For example, inserting a list of all selected region names in an email or later question. 
        - Note: Hot Spot data (especially with Like/Dislike) might be easier to interpret via branches or in reports rather than piping raw, because piping might give you the state values.
    - **Mobile Consideration:** Hot Spot questions may not be ideal on small mobile screens if precision is needed. The New Survey Experience might not support Hot Spot, or will allow it but with caution (Qualtrics notes some question types aren’t mobile compatible; hot spots typically work on mobile by tapping, but very small regions could be hard to tap).
3. **Data Export Schema**
    - **CSV Column Header Format:** The dataset includes one column for each defined region. Each region’s column header will likely be the region name (or a combination of the question and region name). For example, if your Hot Spot question is Q1 and you named a region “Logo”, you might see a column header like “Q1_Logo” or “Logo (Q1)”.
    - **Data Values:** The values depend on the Interaction mode:
        - In *On/Off* mode: Each region’s column will contain either “On” or “Off” (if exporting labels) indicating whether that region was clicked (selected) or not. If exporting numeric values, Qualtrics may use 1/0 or some coding (often “On” might be stored as a 1, “Off” as 0, or sometimes “Selected”/“Not Selected”). By default, an unclicked region is “Off”.
        - In *Like/Dislike* mode: Each region’s column can have three possible outputs:
            - “Like” (if the respondent marked that region positively),
            - “Dislike” (if marked negatively),
            - “Neutral” or blank (if not clicked at all in that region).
          In exports, Qualtrics often uses the words as seen. If numeric values are exported, possibly 1 for Like, -1 for Dislike, 0 for neutral, **or** it may use 2/1/0 or similar. However, generally the safest is to interpret string values: e.g., “Like” vs “Dislike”. In the documentation, it indicates values will literally be “Like”, “Dislike”, or for unselected On/Off it said “Off”.
        - Note that if a respondent didn’t interact with any region and the question was optional, all region columns could be “Off” or blank.
    - **Recode Values:** There is no manual recoding for Hot Spot region outputs in the Survey editor. The outputs are predetermined strings (“On/Off” or “Like/Dislike/Neutral”). If you choose to export numeric data:
        - For On/Off, Qualtrics will likely output 1 for On and 0 for Off (this is common in their binary scoring).
        - For Like/Dislike, Qualtrics might output 1 for Like, -1 for Dislike, 0 for Neutral in numeric mode. (This is inferred; the documentation explicitly says how they appear in label form: “Dislike”, “Neutral”, “Like”.)
        - Regardless, you cannot change those values within Qualtrics – you would adjust in analysis if needed. 
      So, for interpretation:
        - Selected region (On) = typically coded as 1; Not selected (Off) = 0.
        - Liked region = maybe 1, Disliked = -1, Neutral = 0 (if numeric). In label form, the words themselves are the values.
