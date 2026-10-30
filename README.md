# FactFlicks AI Studio

A one-topic-to-video Hindi Shorts creator using Gemini research, Sarvam Bulbul voice, and Wikimedia Commons media.

## APIs and media

- Gemini 2.5 Flash with Google Search grounding creates a researched Hindi script and source list.
- Sarvam Bulbul v3 generates Hindi narration.
- Wikimedia Commons search supplies relevant photographs and instrumental audio candidates. The renderer mixes narration with a quieter music track when a compatible Commons track is available.
- Photo and music creator/license details are shown in the rendered video credit panel when available.

## Required Vercel environment variables

Set these under Vercel Project Settings → Environment Variables:

- `GEMINI_API_KEY` — Google AI Studio API key
- `SARVAM_API_KEY` — Sarvam API subscription key

For local development, copy `.env.example` to `.env.local` and add your keys. Never commit real API keys.

## Deploy

Import the repository into Vercel, add both environment variables, and deploy. API routes are `/api/generate`, `/api/voice`, and `/api/media`.

## Workflow

Enter one topic and click Create. The app researches the topic, generates a scene script, creates Hindi narration, searches Commons for photos/music, then renders a vertical MP4 with subtitles and mixed audio.

## Important limitations

- The actual provider APIs are wired into the code, but live generation requires your own valid environment keys and provider quota.
- Free quotas and credits are limited and can change.
- Wikimedia Commons results vary by topic. Some topics may return few/no relevant photos or usable music; music playback can also be blocked by a remote host. The app will still render available photos and narration if no compatible track loads.
- Always review factual claims and the source links before publishing. Check each media file's license and attribution requirements; automated metadata is not a substitute for reviewing the original file page.
- MP4 encoding runs in the browser and can use substantial memory on mobile devices. A recent Chrome browser is recommended.
