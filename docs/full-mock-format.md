# IELTS Academic full mock format

Full IELTS Academic mocks are stored under `full-mocks/ielts-academic/{mock-id}` in Firebase. The bundled catalog is `data/full-mocks/ielts-academic.json`. The Admin panel accepts one complete exam JSON object at a time and validates it before saving.

Each exam has `schemaVersion: 1`, a unique `id`, `exam: "ielts-academic"`, a title, a `published` flag, and Listening, Reading, and Writing sections. Each section contains modules. A module contains parts with questions, or Writing tasks. Question types include `single_choice`, `multiple_choice`, `text`, `numeric`, `matching`, and `writing`.

Reading passages and question prompts should be authored separately so students can read the passage alongside the active question. Writing tasks need clear instructions and any required chart image. Listening parts require an `audioUrl` before they can be scored as a listening test; the UI identifies missing recordings. Images and audio should use HTTPS URLs. Large data URLs should not be embedded in exam JSON.

Published admin records override bundled mocks with the same ID. Unpublished admin records hide the corresponding bundled mock. The student runner saves an in-progress exam in the browser tab and shows practice estimates, not official IELTS scores.
