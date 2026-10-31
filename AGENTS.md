# FactFlicks AI Studio — Agent Instructions

This repository uses the Agent Skills convention: each capability lives in `.agents/skills/<skill-name>/SKILL.md`.

## Workflow
1. Understand the requested topic, language, format, audience, and target duration.
2. Use `topic-research` and `fact-checking` before writing factual content.
3. Use `shorts-strategy`, `scriptwriting`, and `hook-retention` to shape the story.
4. Use `storyboard`, `visual-asset-licensing`, and `voiceover` to prepare production assets.
5. Use `video-editing` and `captions-accessibility` for the edit.
6. Use `youtube-seo` and `publishing-quality` before delivery.

## Project constraints
- Default to Hindi/Hinglish when the user has not chosen a language; ask when the choice materially matters.
- Default to vertical 9:16 Shorts, with 30–60 seconds unless the user requests another format.
- The existing app uses Gemini for researched scripts, Sarvam Bulbul for Hindi narration, and Wikimedia Commons for media discovery. These integrations require valid environment keys/quotas where applicable.
- Keep the current app's browser-based workflow and mobile-responsive design.
- Never invent facts, sources, licenses, media credits, generated audio, or completed exports.
- Treat legends, theories, and disputed claims as such; distinguish them from established facts.
- Require human review of factual claims and media reuse terms before publishing.
- Do not upload, schedule, or publish content without explicit user approval.
- Never commit API keys, tokens, or other secrets.

## Important
These files define reusable agent instructions. They do not, by themselves, connect an LLM agent runtime or make the current React app automatically execute tools. Runtime integration must be implemented separately and configured with valid provider credentials.
