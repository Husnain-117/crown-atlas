# Shared master prompts for county SEO (Schools & Education, Lifestyle & Amenities)
# Same as orange/sandiego/santa-clara configs

SCHOOLS_EDUCATION_MASTER_PROMPT = """
Write a premium Schools and Education section for a Crown Coastal Homes real estate landing page. Crown Coastal Homes must read as a knowledgeable California guide with strong local credibility and a calm, helpful tone.

Inputs
Place: {PLACE}
State: {STATE}
Page type: {PAGE_TYPE} City or County
Optional education data that may be empty
School districts: {SCHOOL_DISTRICTS}
Colleges and universities: {UNIVERSITIES}
Education notes: {EDU_NOTES}
Optional focus keyword: {FOCUS_KEYWORD}

Non negotiable rules
Return only the finished section text.
Do not use underscores.
Do not use any quotation marks.
Do not use any hyphens or dash characters.
Do not invent school names, district names, campuses, programs, awards, rankings, ratings, or numbers.
If lists are empty, stay general and do not name institutions.
Avoid salesy language and avoid superlatives such as best, top, elite, safest.
Fair Housing compliance is mandatory. Do not target or exclude any protected group and do not write lifestyle targeting. Keep the information neutral and buyer helpful.
No guarantees and no promises.

Writing goals
Natural American English that feels written by a human editor.
Mention {PLACE}, {STATE} within the first two sentences.
Show expertise through practical guidance, not through claims. Use concrete topics such as school districts, attendance boundaries, enrollment steps, school choice policies, charter schools, private schools, early education, libraries, community colleges, universities, continuing education, and after school activities.
If {SCHOOL_DISTRICTS} is provided, weave in district names naturally, one time each, with no judgments.
If {UNIVERSITIES} is provided, mention them briefly as nearby education options without hype.
If {EDU_NOTES} is provided, integrate only what is given and keep it factual.
If {FOCUS_KEYWORD} is provided, include it no more than once and only if it fits smoothly.
Include one short sentence that school assignments and programs can change and readers should verify with official district and state sources.

Structure
Length 180 to 230 words.
Start with a short bold title line.
Then two short paragraphs.
Then exactly three bullets using the symbol •
Each bullet must be a practical buyer action, for example how to verify boundaries, what to ask, and where to confirm enrollment rules.
End with one gentle call to action that mentions Crown Coastal Homes and offers help comparing areas and school options.

Output format (optional for future runs): Return content as clean HTML only. Use <h3> for the section title, <p> for paragraphs, <ul><li> for bullet points. Do NOT use markdown formatting like **bold**, *italic*, or • bullet characters. Do NOT include any markdown syntax whatsoever.

Before writing, silently check
No forbidden characters used.
No invented facts.
Word count within range.
Now write the section.
"""

LIFESTYLE_AMENITIES_MASTER_PROMPT = """
Write a premium Lifestyle and Amenities section for a Crown Coastal Homes real estate landing page. Crown Coastal Homes must read as a knowledgeable California guide with strong local credibility and a calm, helpful tone.

Inputs
Place: {PLACE}
State: {STATE}

Non negotiable rules
Return only the finished section text.
Do not use underscores.
Do not use any quotation marks.
Do not use any hyphens or dash characters.
Do not invent specific business names, event names, or statistics.
Avoid salesy language and avoid superlatives such as best, top, premier.
Fair Housing compliance is mandatory. Do not target or exclude any protected group. Keep the information neutral and buyer helpful.
No guarantees and no promises.

Writing goals
Natural American English that feels written by a human editor.
Mention {PLACE}, {STATE} within the first two sentences.
Cover practical lifestyle topics such as restaurants, parks, beaches, shopping, everyday conveniences, recreation, and community amenities in a general way without inventing specifics.
One short bold title line, then two short paragraphs.
Length 180 to 230 words.
End with one gentle call to action that mentions Crown Coastal Homes and offers help exploring neighborhoods and lifestyle options in {PLACE}.

Output format (optional for future runs): Return content as clean HTML only. Use <h3> for the section title, <p> for paragraphs, <ul><li> for bullet points. Do NOT use markdown (**bold**, *italic*, • bullets). Do NOT include any markdown syntax.

Before writing, silently check
No forbidden characters used.
No invented facts.
Word count within range.
Now write the section.
"""
