# Contributing

Help keep this a useful reference for engineers choosing or running realtime speech models.

## The rule

Every capability, price, or comparison needs evidence that supports the exact claim. Link to the relevant documentation or a reproducible observation. A product homepage alone is not evidence for a specific capability.

## Before adding a resource

- Keep it about the model layer: conversation controls, audio input/output, tool use, context, pricing, evaluation, or a working model integration.
- Send general STT, TTS, telephony, and framework resources to [voiceai](https://github.com/mahimairaja/voiceai).
- Prefer public official docs, maintained code, and practitioner reports with code or recorded evidence.
- Disclose if you maintain, sell, or work on the resource.
- For research models, require inference code and released weights. Paper-only projects belong in the linked research indexes.

## Changing a comparison

Include these in the pull request or a [matrix correction](.github/ISSUE_TEMPLATE/matrix-correction.md):

1. Exact model ID and the affected statement or table cell.
2. Current value and proposed replacement.
3. Source URL and the short passage that supports the replacement.
4. Scope: native API, hosted service, or framework integration. Name the transport and configuration when they change the result.
5. Date checked. For framework behavior, include the package version or a commit permalink.

Use **documented** for an explicit source claim, **tested** for a reproducible observation, **unverified** when evidence is missing or conflicting, and **unsupported** only when a source explicitly rules something out. Missing documentation does not mean unsupported.

For observed behavior, include the prompt, relevant settings, SDK version, expected result, actual result, and number of trials. Audio and timestamped events are needed to support timing or interruption claims. A transcript alone cannot show whether playback stopped. Remove credentials and personal information from evidence.

If sources disagree, preserve the disagreement with both links and their scope. Do not silently turn a plugin limitation into a model limitation. Refresh a last-verified date only after reviewing all claims it covers.

## House style

- Resource bullets use `- 🟢 [Title](URL): One-line description.` Replace `URL` with the actual destination.
- Tags describe the resource's prerequisites: 🟢 beginner, 🟡 intermediate, 🔴 advanced. They are not quality scores or model rankings.
- Use short sentences, colons, and periods. No em dashes or marketing language.
- Keep comparison tables to five columns where practical. Put long qualifications in model notes.
- Keep prices in the pricing section. Include currency, metering unit, serving route, source, date, and assumptions for any calculation.
- Add a concise entry to [CHANGELOG.md](CHANGELOG.md) for a meaningful model, capability, price, or scope change. Record what changed in this repository; link vendor release notes separately.

## Check before submitting

Run the same link checker as CI from the repository root:

```sh
lychee --config .lychee.toml README.md CONTRIBUTING.md CHANGELOG.md .github/ISSUE_TEMPLATE/matrix-correction.md
```

CI uses [lychee](https://github.com/lycheeverse/lychee) 0.24.2 on pushes, pull requests, and Mondays. Link checks test reachability, not factual accuracy. Re-read changed sources and inspect the README on GitHub, including its tables on a narrow screen.

If a site blocks automated requests, verify it manually and document any narrowly scoped exception in `.lychee.toml`. Do not accept every 403 or 429 response as a working link. Retain an unresolved check as a reported limitation until it is verified.
