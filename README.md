# FactFlicks AI Studio

One-topic Hindi Shorts creator built with React + Vite, Gemini research, and Sarvam Bulbul Hindi text-to-speech.

## Connected APIs

- **Gemini 2.5 Flash + Google Search grounding**: researches a topic and returns a structured Hindi short script with source links.
- **Sarvam Bulbul v3**: converts the narration to Hindi speech (Shubh voice).
- API keys stay on the server in environment variables. They are never included in frontend code.

## Required environment variables

Set these in your Vercel project settings (Project → Settings → Environment Variables):

- `GEMINI_API_KEY` — Google AI Studio API key
- `SARVAM_API_KEY` — Sarvam API subscription key

For local development, copy `.env.example` to `.env.local` and add your own keys. Never commit real keys or share them in chat.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Import this repository into Vercel. Add both environment variables, then deploy. The Vercel serverless endpoints are `/api/generate` and `/api/voice`.

## Current workflow

1. Enter a topic.
2. Gemini researches it and creates a Hindi scene script with source links.
3. Sarvam generates a Hindi narration audio file.
4. Preview the voice and render a narrated vertical MP4 with scene headings and subtitles.

## Notes and limitations

- Gemini Search grounding and Sarvam usage are subject to each provider's quotas, account eligibility, and pricing. Free usage is limited, not unlimited.
- The current MP4 renderer uses designed text scenes and subtitles with the generated narration. Automatic licensed photo selection and a music track are not yet included.
- The browser MP4 encoder can use substantial memory on phones; a recent Chrome browser is recommended.
- Verify source links and facts before publishing.
