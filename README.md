# FactFlicks AI Studio

A responsive React + Vite starter for a Hindi/English video-creation workspace.

## Current stage — Phase 2 beta
- Responsive creator dashboard
- Topic, style, language, duration and voice selections
- Template-based script draft
- Browser-native speech preview (uses voices installed on the user's device/browser)
- Microphone narration recording, mixed into the exported MP4 when supported
- Animated vertical 720×1280 scene-card video export
- MP4 conversion in the browser using FFmpeg.wasm
- Copy script and download MP4

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Important limitations
- Script writing is currently a template, not live AI research. Verify all factual claims using reliable sources before publishing.
- Voice preview uses the browser's built-in speech synthesis. Voice availability and quality depend on the device and browser.
- The exported MP4 currently contains animated title/caption cards and is **silent**. Voice preview is separate and is not mixed into the MP4 yet.
- The export is a short proof-of-concept render (roughly 8–12 seconds), not the selected full-length 45-second to 10-minute video duration.
- This is not yet an automatic stock-footage or AI-image generator.
- FFmpeg.wasm conversion can be memory-intensive, especially on phones. A recent Chromium browser is recommended.
- Free browser features do not mean unlimited free AI generation or hosting.

## Next phases
1. Generate researched scripts with source links
2. Mix generated narration into the MP4
3. Add user-uploaded visuals and copyright-safe stock media
4. Build a real timeline, subtitles and selectable output durations
5. Test mobile performance and deployment
