# Luminary: finish checklist

Status checked on 26 September 2026. This list distinguishes implemented UI from flows that still need a real end-to-end check.

## Done in the current cleanup

- SAT mock pages, navigation, bundled data, and Admin management removed. SAT Question Bank remains usable.
- Ten bundled IELTS Reading and Writing practice tests pass strict schema validation. Missing Listening audio is shown as pending.
- IELTS Reading answer controls and Writing reference layout improved.
- SAT Math Question Bank now has an embedded Desmos graphing calculator; the API script loads only when opened. The calculator was opened and used in the local browser.
- The mobile exam switch is in the left part of the header.
- IELTS Speaking briefing and three scripted test sets reviewed. Browser voice falls back to an available English voice instead of silently skipping questions when a preferred voice is absent.
- SAT now has explicit Overview → section → topic → lesson routes, with 29 short lessons, a quick check, saved lesson completion, and a return path from practice. Home is a separate canonical route.
- SAT Question Bank now offers the eight topic groups actually present in the remote data. Practice sets are limited to 10 questions; the old skill-level filter was removed because the source questions do not contain skill tags.
- SAT Question Bank now runs a content-quality gate. On the 26 September 2026 database snapshot, it excludes 241 of 3,176 records with duplicate answers, missing graph/table material, unavailable image filenames, broken prompts, or clear OCR noise. It infers a skill for 2,075 of the 2,935 available questions using narrow wording rules; other questions stay at topic level. Both Admin variants can edit records and replace missing illustrations. Re-run `node scripts/audit_sat_question_bank.cjs` after content changes.

## Required before calling the site finished

1. **Provide IELTS Listening recordings.** All 10 bundled tests have 40 Listening questions but no audio. Add recordings with correct section timing, then test playback, seeking policy, interruption, submission, and review on desktop and mobile.
2. **Review every exam question against its source.** The SAT quality gate prevents clearly unusable records from reaching students, but it cannot verify every equation, answer key, explanation, or inferred skill. Review the remaining questions and all IELTS Reading headings, prompts, answers, and Writing tables or images against source material before using scores as study advice.
   - Restore the source graphs, tables, and diagrams for the 126 SAT records that contain only filenames such as `sat_rw_001.png`; those files are not in this repository and their Firebase Storage paths could not be resolved. Also supply images for other records that refer to a missing visual. Edit the flagged records in Admin and rerun the audit.
   - Confirm inferred skill labels against the source and add explicit `skill` metadata for questions that need exact lesson-level practice. Questions without a reliable skill remain available at topic level.
3. **Run a complete IELTS Speaking session with a real microphone.** Verify permission denial, speech recognition, silence handling, Part 2 preparation, answer limits, browser voice, recording, final submission, and score feedback. Decide how completed Speaking results should be saved in progress; currently the assessment is shown only in the session. The briefing and code path were inspected; a full live recording was not completed.
4. **Verify and deploy the AI Worker.** The currently published Worker responds, but its status response differs from the repository's Worker. Confirm deployment version, `GEMINI_API_KEY`, allowed origins, and successful `/speaking/analyze`, `/questions/analyze`, and `/mocks/analyze` requests. Test useful error messages when the service is unavailable.
5. **Make signed-in progress available on another computer.** Authentication exists, but learner state is stored in an account-named browser `localStorage` key. A Firebase sign-in alone does not sync study history, goals, or IELTS sessions across devices. Implement authenticated cloud persistence with merge and conflict rules.
6. **Test authentication and Admin with real accounts.** Complete registration, login, Google sign-in, password recovery if offered, sign-out, session restore, and permission boundaries. Create/edit/delete Question Bank and IELTS content in Admin. The local browser could not open Admin, so only its script syntax and markup were checked.
7. **Complete IELTS result quality.** Check Reading scoring against answer keys, Writing submission and review, unscored Listening handling, progress charts, and resume behavior. Do not present automated estimates as official IELTS bands.
8. **Finish responsive and accessibility QA.** Walk through desktop, laptop, tablet, and narrow mobile widths for the home page, Question Bank, IELTS test runner, Speaking room, Settings, Admin, dialogs, keyboard focus, and screen readers.
9. **Run the published-site walkthrough.** On the deployed site, start as a new learner, use SAT Math and Reading & Writing, complete IELTS Reading/Writing/Speaking, inspect results, change settings, sign in on a second computer, and manage content in Admin. Fix all broken links and stale caches found there.

## Lower priority polish

- Simplify overlapping IELTS skill navigation and remove labels that imply a live AI interviewer; Speaking currently uses scripted questions with AI assessment at the end.
- Decide whether the separate daily-question feature has reliable content; it is hidden when no question is published.
- Confirm third-party asset attribution and production terms for audio, images, and the embedded calculator.
