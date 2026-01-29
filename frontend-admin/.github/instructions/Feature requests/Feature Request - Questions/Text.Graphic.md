# Text / Graphic Question

1. **Structure**
    - **Visual Elements:** Displays static content (text, images, or file links) in the survey without an input field for the respondent. It can serve as introductory text, instructions, or to show an image or file for download.
    - **Variations:** Three content types:
        - *Text:* Just text (e.g. instructions or disclaimers).
        - *Graphic:* A single image (with optional caption text).
        - *File:* A downloadable file link (with optional link text).
2. **Settings & Features**
    - **Validation:** No response is collected, so there is no response validation (no Force/Request Response since nothing to answer).
    - **Display Options:** You can add formatting to text via the Rich Content Editor, or include media (images can also be added in any question using the editor). For the Graphic and File types, options exist to show accompanying text (e.g., a caption) and to control how the file link behaves (open or download).
    - **Logic Support:** Can be shown or hidden using Display Logic (as it’s treated like a question element), but cannot be used in Skip Logic or branch conditions (since it doesn’t produce an answer). (Note: This type does not generate data, but you could use Survey Flow techniques if you need to flag that a participant saw this content.)
3. **Data Export Schema**
    - **CSV Column Header Format:** *No data column.* Text/Graphic elements do not produce an output column in the dataset (they are for display only).
    - **Data Values:** N/A – respondents do not provide an answer, so nothing is recorded.
    - **Recode Values:** N/A – since no values are captured, there are no recode values to manage.
