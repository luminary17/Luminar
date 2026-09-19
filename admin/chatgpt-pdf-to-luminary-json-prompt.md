# Prompt: College Board files to Luminary JSON

I am attaching one or more College Board SAT question-bank files (PDF, DOCX, images, or exported documents). Extract every complete question and convert the files into JSON that can be imported into the Luminary Admin Panel.

Return raw JSON only. Do not use Markdown fences. Do not add an introduction, comments, notes, or a summary.

The root must be one JSON array. Use exactly this object structure for every question:

```json
{
  "exam": "sat",
  "section": "math",
  "theme": "Algebra",
  "skill": "Linear equations in one variable",
  "difficulty": "Hard",
  "passage": "",
  "question": "Complete question prompt",
  "answers": ["Choice A", "Choice B", "Choice C", "Choice D"],
  "correct": 0,
  "explanation": "Complete official rationale",
  "sourceId": "original College Board question ID"
}
```

Mandatory extraction rules:

1. Extract every question exactly once and preserve the original order.
2. Copy the complete wording faithfully. Do not summarize, paraphrase, simplify, translate, or invent content.
3. Set `exam` to `sat`.
4. Set `section` to exactly `rw` or `math`.
5. `difficulty` is required for every question and must be exactly one of `Easy`, `Medium`, or `Hard`.
6. Read the difficulty from the College Board question label or metadata. Never assign difficulty from the question’s position on a page. If the source truly contains no difficulty label, infer the most likely level from the mathematical or reading complexity, but add `"difficultyInferred": true` to that record. Do not leave `difficulty` empty.
7. For SAT Math, `theme` must be exactly one of `Algebra`, `Advanced Math`, `Problem-Solving and Data Analysis`, or `Geometry and Trigonometry`.
8. For SAT Reading and Writing, `theme` must be exactly one of `Information and Ideas`, `Craft and Structure`, `Expression of Ideas`, or `Standard English Conventions`.
9. Preserve the College Board skill name exactly in `skill`. Do not replace it with a broader theme.
10. Put supporting text, quotations, tables represented as text, and reading passages in `passage`. Put only the actual task or question stem in `question`.
11. `answers` must contain exactly four non-empty strings in A, B, C, D order. Remove the `A.`, `B.`, `C.`, and `D.` prefixes.
12. `correct` must be a zero-based integer: A = 0, B = 1, C = 2, D = 3.
13. Copy the complete official answer rationale into `explanation`. Do not shorten it.
14. Copy the original item identifier into `sourceId`. If no identifier is printed, create a stable ID in the form `cb-file-001`, `cb-file-002`, and so on.
15. If a question requires a graph, chart, diagram, or image, add `"imageRequired": true` and an exact `imageDescription`. Add `image` only when the source provides a usable URL or data URL. Never invent values visible only in a missing image.
16. Preserve mathematical notation, fractions, exponents, radicals, inequalities, degree symbols, Greek letters, tables, and units using valid UTF-8 text. Use clear plain-text notation when necessary, for example `x²`, `√x`, `(x + 1)/3`, and `≤`.
17. Escape double quotes inside JSON strings as `\"`. Encode meaningful line breaks inside fields as `\n`.
18. Do not include duplicate questions, page headers, footers, copyright notices, navigation text, or answer-key index pages as questions.
19. If the files contain a separate answer key or rationale section, match it to the correct question using the printed question ID first and the question number second.
20. If any field is unclear, re-check all attached pages before making a decision. Do not silently omit the question.

Before responding, validate the entire result internally:

- the root is one valid JSON array;
- every object contains `exam`, `section`, `theme`, `skill`, `difficulty`, `question`, `answers`, `correct`, `explanation`, and `sourceId`;
- every `difficulty` is exactly `Easy`, `Medium`, or `Hard`;
- every `answers` array has exactly four non-empty strings;
- every `correct` value is an integer from 0 through 3;
- every SAT theme is from the allowed list for its section;
- source IDs are unique;
- the output contains no Markdown and no text outside the JSON array;
- the JSON parses successfully;
- the output contains no corrupted characters such as `â€™`, `â€œ`, `â€`, `Ã©`, or `â€”`.

If the result is too large for one response, split it into files named `luminary-questions-part-001.json`, `luminary-questions-part-002.json`, and so on. Every file must independently contain a valid JSON array. Never split a question object between files.

Now process all attached files and return the validated Luminary JSON.
