# Luminary full mock format

Full exams are stored in Firebase under:

- `full-mocks/sat/{mock-id}`
- `full-mocks/ielts-academic/{mock-id}`

The current `schemaVersion` is `1`. Import one complete exam object at a time in the Admin Panel. Production import uses strict official item counts.

## Common structure

```json
{
  "schemaVersion": 1,
  "id": "sat-mock-01",
  "exam": "sat",
  "title": "Digital SAT Mock 01",
  "description": "Original full-length adaptive practice test.",
  "published": true,
  "sections": []
}
```

Every section contains one or more modules. Every module contains either `questions` or `parts`; parts are useful when several questions share a passage, image, or audio recording.

Every question needs a unique `id`, `type`, and `prompt`. Supported types:

- `single_choice`: `options` plus zero-based `correct`, or answer letter such as `"B"`.
- `multiple_choice`: `options` plus an array in `correct`.
- `text`: `acceptedAnswers`; optional `wordLimit` and `caseSensitive`.
- `numeric`: `acceptedAnswers`, including alternative valid representations.
- `matching`: `prompts`, `options`, and a `matches` object keyed by prompt ID.
- `writing`: optional `minWords`, `recommendedMinutes`, passage, and image.

Images and recordings should normally use HTTPS Firebase Storage URLs. Data URLs are supported by the student runner, but large data URLs should not be stored inside exam JSON.

## Digital SAT

SAT must contain `rw` and `math` sections. Each section needs three modules with stages `routing`, `lower`, and `higher`. Reading and Writing modules contain 27 questions and last 32 minutes. Math modules contain 22 questions and last 35 minutes.

The student completes the routing module and then receives the lower or higher second module. `threshold` is a practice routing rule, not College Board's proprietary scoring algorithm.

```json
{
  "id": "rw",
  "title": "Reading and Writing",
  "breakMinutes": 10,
  "route": {
    "threshold": 0.6,
    "lowerModuleId": "rw-m2-lower",
    "higherModuleId": "rw-m2-higher"
  },
  "modules": [
    {
      "id": "rw-m1",
      "stage": "routing",
      "title": "Module 1",
      "durationMinutes": 32,
      "questions": [
        {
          "id": "sat01-rw-m1-q01",
          "type": "single_choice",
          "domain": "Information and Ideas",
          "skill": "Inferences",
          "difficulty": "medium",
          "passage": "Original passage text.",
          "prompt": "Which choice most logically completes the text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct": "B",
          "explanation": "Explanation for review after the test."
        }
      ]
    },
    {
      "id": "rw-m2-lower",
      "stage": "lower",
      "title": "Module 2",
      "durationMinutes": 32,
      "questions": []
    },
    {
      "id": "rw-m2-higher",
      "stage": "higher",
      "title": "Module 2",
      "durationMinutes": 32,
      "questions": []
    }
  ]
}
```

Use `numeric` for Math student-produced responses. Include every mathematically equivalent response that the engine should accept.

## IELTS Academic

IELTS Academic must contain `listening`, `reading`, and `writing` sections. Listening and Reading each contain 40 questions. Writing contains two tasks.

Listening should use four parts. Set `audioUrl` on each part:

```json
{
  "id": "listening",
  "title": "Listening",
  "modules": [{
    "id": "listening-main",
    "title": "Listening",
    "durationMinutes": 30,
    "parts": [{
      "id": "listening-part-1",
      "title": "Part 1",
      "audioUrl": "https://example.com/recording.mp3",
      "instructions": "Write no more than two words and/or a number.",
      "questions": [{
        "id": "ielts01-l-q01",
        "type": "text",
        "prompt": "Date of visit",
        "acceptedAnswers": ["14 May", "May 14"]
      }]
    }]
  }]
}
```

Reading normally uses three parts, one per passage. Put the shared text in the part's `passage` field. Matching headings and matching features use `matching`:

```json
{
  "id": "ielts01-r-q15-18",
  "type": "matching",
  "prompt": "Match each paragraph with the correct heading.",
  "prompts": [
    { "id": "A", "text": "Paragraph A" },
    { "id": "B", "text": "Paragraph B" }
  ],
  "options": ["i. Early experiments", "ii. A disputed result", "iii. Future applications"],
  "matches": { "A": "ii. A disputed result", "B": "i. Early experiments" }
}
```

Writing uses two `writing` questions. Task 1 should include a chart, table, map, process, or diagram in `image` or a complete textual reference in `passage`.

```json
{
  "id": "writing",
  "title": "Academic Writing",
  "modules": [{
    "id": "writing-main",
    "title": "Writing",
    "durationMinutes": 60,
    "questions": [
      {
        "id": "ielts01-w-task1",
        "type": "writing",
        "prompt": "Summarise the information by selecting and reporting the main features.",
        "image": "https://example.com/original-chart.png",
        "minWords": 150,
        "recommendedMinutes": 20
      },
      {
        "id": "ielts01-w-task2",
        "type": "writing",
        "prompt": "Write about the following topic…",
        "minWords": 250,
        "recommendedMinutes": 40
      }
    ]
  }]
}
```

## Result limits

The engine reports raw SAT section accuracy and the adaptive route. It does not invent an official 400–1600 score because College Board scoring uses calibrated item parameters and a proprietary model.

IELTS Listening and Academic Reading bands are labelled as estimates because exact conversions vary by test form. Writing is saved for human or rubric-based assessment and is not automatically assigned a band.
