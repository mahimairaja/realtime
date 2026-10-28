# Changelog

Changes to this reference. Dates record repository reviews, not inferred model release dates.

## 2026-10-28

- Renamed the Grok row to Grok Voice 3.0 (`grok-voice-3.0`, now behind `grok-voice-latest`; `grok-voice-2.0` is deprecated) and updated its billing meter: server VAD sessions bill full duration.
- Added Eleven Realtime v1 (Mini and Max) to the matrix, controls, model notes, transport, and pricing, with unknown cells marked `?`.
- Noted GPT-Live’s October additions: native Decisions API delegation and prompt-to-voice voices.
- Added NemotronLabs VoiceChat 11B to open weights, and Block Dessa as related work without public weights.
- Listed PolyAI Dialog-RSN-1 as a candidate pending documented pricing and controls.

Only the Grok and Eleven rows were re-reviewed; other rows keep their 2026-09-15 dates.

## 2026-09-27

- Added a website at realtime.mahimai.ca, built from this README by `site/`. The README stays the source; the site renders its sections, control matrix, and pricing estimates.

## 2026-09-15

- Added the initial reference for hosted realtime speech APIs and selected open-weight models.
- Separated native API controls from framework integration behavior, including documented disagreements.
- Added dated pricing sources, explicit cost assumptions, evaluation resources, and runnable examples.
- Added a scannable control matrix before the detailed model comparison.
- Replaced pricing algebra with sourced five-minute starting estimates and provider-specific assumptions.
- Collapsed detailed notes, integrations, benchmarks, and maintenance material for faster scanning.
- Added contribution evidence requirements, a matrix correction template, and weekly link checks.

The initial review is based on documentation and source inspection. It does not claim runtime validation of model behavior.
