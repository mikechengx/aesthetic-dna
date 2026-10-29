# Architecture

Aesthetic DNA is a client-side React + TypeScript app built with Vite. It needs no server, API key or runtime model service.

## Data flow

```text
Questions + official poster catalog
        ↓
Feature screens → editor drafts
        ↓ explicit confirmation
Session.answers
        ↓
Canonical evidence + preference analysis
        ├─ localized report presentation → report UI / Markdown
        └─ card profile + original SVG layouts → preview / PNG
```

`App.tsx` owns the latest session and hash navigation. Feature screens receive narrow callbacks. The four making studios keep recoverable drafts with `useDraft`; a draft enters `answers` only after confirmation. Report analysis reads `answers`, never unfinished drafts. Optional question-specific reasons are stored on confirmed pair answers; choosing another visual clears its previous reason.

## Module boundaries

| Module                | Responsibility                                                                          |
| --------------------- | --------------------------------------------------------------------------------------- |
| `features/home`       | Landing story and curated poster shelf                                                  |
| `features/posters`    | Remote image fallback, style filters, stable session shuffle and capped picks           |
| `features/experiment` | Question routing, two-choice/four-choice screens, crop/palette/poster/outfit tools      |
| `features/report`     | Evidence navigation, artwork wall, creative portrait and share card                     |
| `components`          | Reusable visual controls and language navigation                                        |
| `content.ts`          | Question definitions, axis endpoints, canonical intentions, colors and presets          |
| `core.ts`             | Typed session, crop geometry, migration, evidence extraction and deterministic analysis |
| `cardProfile.ts`      | Evidence-based card family and expressive/quiet presentation decisions                  |
| `cardDesigns.ts`      | Herbarium, Private View and Taste Manifesto SVG layouts                                 |
| `art.ts`              | Original scene and stimuli; crop, palette, poster, outfit and result-card SVGs          |
| `i18n`                | Locale context, source-copy dictionary, SVG labels and report presentation model        |
| `storage.ts`          | Session validation, IndexedDB, synchronous recovery backup and deletion                 |
| `export.ts`           | Browser PNG rendering and Markdown report creation                                      |
| `dialog.ts`           | Modal focus management and Escape behavior                                              |

## Stable state and bilingual presentation

English is the default. `LocaleProvider` persists `en` or `zh` under a separate localStorage key and updates document language and title. The top-right control changes only presentation; it never remounts a question or resets the session.

The inherited question bank and semantic intent strings remain canonical Chinese values. They are internal identifiers, not the display language. `i18n/en.ts` translates display copy; `localizedReport` reconstructs dynamic English evidence from typed answers and the same IDs and scores. Domain functions remain independent of React and browser locale. User-entered names are retained as entered.

`reportInsights.ts` compares the actual four-way color variants by context, rather than flattening different settings into the same average. At least two explanations with a shared interest can support a recurring self-reported motive; ties do not declare a dominant motive. Their descriptive evidence has no axis value. New headlines cite the corresponding context or reason evidence. Creation observations use the exact confirmed camera, frame geometry and palette proportions. These observations and tailored exercises are included in both Markdown exports.

The result SVG receives an explicit locale. The expressive card has an English `IDEAS / OFF SCRIPT` typographic treatment, English paragraphs wrap at word boundaries, and generated labels remain XML-escaped. Third-party film poster artwork is never translated or modified.

## Evidence rules

- One directional choice is one observation; presentation order does not change meaning.
- “Both,” “neither,” missing answers and skips do not become neutral preference scores.
- Whole-poster choices and self-reported reasons describe that selection; they do not add color, composition-skill or nationality scores.
- Repeated evidence can support a cross-question observation. Mixed directions stay explicit.
- Single-question shape and texture results remain exploratory.
- Default templates and inherited palette values are not independent direction evidence.
- An expressive card needs substantive changes in multiple creations plus relevant expressive preferences. Bright colors alone do not imply creativity.
- Decorative botanical graphics are original editorial motifs, not biological or image-recognition results.

## Persistence and migration

A session stores an ID, timestamps, version metadata, current step, fixed choice presentation order, confirmed answers and recoverable drafts. IndexedDB is the primary store. A lightweight localStorage backup is written synchronously to protect edits around immediate refresh; queued writes preserve ordering. No remote images are saved in the session.

Existing question-set migrations preserve prior artwork and a legacy answer snapshot. The expanded poster wall retains existing poster IDs. Locale is deliberately separate, so changing it does not require rewriting or migrating answers.

Only the latest experiment is saved. Deleting a session clears both local stores; the language preference can remain. A practice crop is a separate copy and never changes confirmed answers.

## Poster references

`posters.ts` stores official publisher page URLs, image URLs, film origin, credits and overlapping editorial style tags. Tags power browsing only. A deterministic seeded shuffle varies by session and stays stable on reload; switching filters never removes selected posters. The fourth pick replaces the oldest; clicking a selected pick removes it.

Publisher images are remote, lazy-loaded and requested with `no-referrer`. Failed previews show a clear fallback; official source links stay available. Browser test flows intercept those image requests with an original labeled fixture. Publisher artwork is absent from the repository, standalone package and documentation previews.

## Exports and deployment

PNG export rasterizes original SVG work in a browser canvas after fonts are ready. Bundled photographic sources are embedded as image data URIs inside the original crop SVG. No external poster images enter the canvas, preventing cross-origin contamination. The editorial card is an interpretation; original work and colors remain independently downloadable from the report.

Markdown receives the current locale and includes all evidence IDs, conclusions, exercises and artwork download names. The app remains a static bundle. Vite uses relative asset paths; `scripts/standalone.mjs` additionally embeds the compiled application into one HTML file. This file still references remote movie posters and needs network access for them.

## Validation

Domain tests cover geometric bounds, skipped/default behavior, evidence integrity, card decisions, deterministic catalog order and English report parity. Browser tests exercise both languages, mobile overflow, refresh recovery, live language changes during editing, downloads and deletion. CI runs formatting, unit tests, a production build and both browser flows, then uploads build and test artifacts.

## Extending the app

Add a poster by supplying official URLs and credits in `posters.ts`. Add a question in `content.ts` together with explicit evidence rules and English copy. Changing the semantic question structure requires a migration. New card treatments belong in `cardDesigns.ts`, with their palette decisions in `cardProfile.ts`. Keep report interpretation traceable to existing evidence; avoid inferring abilities from color preference or a missing answer.

## Photography compatibility

New crop records carry optional `scene` and `camera` IDs. Missing scene IDs explicitly select the legacy illustrated scene; upgrading never injects a new image into an old frame. New framing defaults use the Shanghai eye-level source. Camera or scene changes reset the frame and require confirmation; crop edits also unfreeze it. Prepared framing presets preserve the chosen scene and camera. Reference crops and practice copies derive from the submitted source rather than a global default. The normalized geometry remains 1200 × 900 for all four sources.
