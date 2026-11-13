# Readmory introduction

`readmory-introduction.mp4` is a complete 56-second landscape introduction, 1920×1080 at 30 fps, H.264/AAC, with English synthetic narration and burned-in captions. `readmory-introduction.srt` contains separate captions, and `script.md` contains the narration. The voice is macOS Samantha; no music is included.

All application footage was captured from the real local app with the repository's authored synthetic Kobo, KOReader and Kobalt fixtures, in a new isolated Chrome context. No existing launch-kit footage, personal library, real book passages, private backup, or everyday browser profile is used. The original Readmory icon is used unchanged.

## Recreate

Requires Node 24, pnpm, installed Chrome, Playwright's video helper, macOS `say`, and FFmpeg with libass. From the repository root:

```sh
pnpm fixtures
pnpm build
PORT=4318 pnpm start
# In a separate terminal:
node marketing/intro/create-intro.mjs
```

The generator overwrites only its own introduction outputs. Temporary browser recordings and intermediate renders stay in the OS temporary directory. Override `CAPTURE_URL` when using a different isolated preview server. The script blocks external network requests during app capture.

The file is delivered locally; it has not been published or deployed.
