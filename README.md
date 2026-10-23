# Asset Review

MIT-licensed original app; third-party model/runtime licenses remain separate.

A browser-local semantic asset finder and release checklist. Search natural-language descriptions with an actual quantized MiniLM embedding model; separately inspect SHA-256 duplicates, missing metadata, empty/temp files, case collisions and declared references. This is not legal clearance, a game-engine dependency scanner, or image/audio recognition.

## Run

Requirements: Node.js 20+ (tested 24), npm, Python 3.10+, a modern browser supporting WebAssembly. First-time setup needs public npm and Hugging Face downloads; no account/API key or paid inference service.

```sh
npm ci --ignore-scripts
python setup-model.py
python server.py
```

Open **http://127.0.0.1:8765**. Use **Explore the sample folder**, then **Restore health**. The actual model should rank `sprites/item_04.svg`, whose description refers to restorative liquid, above unrelated assets. Sample descriptions are illustrative; sample graphics are original numbered geometric SVG fixtures, not generated art that visually depicts those descriptions.

The model and browser runtime are served locally. There are no runtime remote model calls or user-file uploads. Browser import reads selected files in memory, never executes them, and does not modify originals. Clearing the workspace drops the app's asset references; loaded model weights may remain in browser memory. Exported reports contain filenames and supplied metadata: review them before sharing.

## Bring your own folder

Select up to 250 files, at most 25 MB combined. Optionally put `asset-index.json` in the folder root:

```json
{"assets":[{"path":"sprites/hero.png","description":"An explorer with a lantern","creator":"Your verified creator","license":"Your verified license","source":"Original source URL or note","references":["sprites/lantern.png"]}]}
```

All paths/references are root-relative and case-sensitive. Description, creator, license and source are text. References is an array of strings. Index records are optional, but missing records generate review prompts. The index must be under 1 MB. Invalid records, duplicate indexed paths and traversal paths are rejected. A malformed/new import does not silently erase the previous successful report.

## What the AI does

`semantic.mjs` runs **Xenova/all-MiniLM-L6-v2**, Apache-2.0, with Transformers.js 3.8.1. It embeds filenames + supplied descriptions and a query, then ranks cosine similarity. Inference happens locally on CPU/WASM. Results are not probabilities and can be wrong, especially with sparse metadata or long text (model truncation applies). The app does not invent missing credits. If weights/runtime cannot load, it shows an error, with no fabricated/keyword fallback presented as semantic AI.

Pinned model revision, artifact hashes and model licenses are in `model-manifest.json` and generated `models/`. Runtime licenses accompany generated `vendor/`. See `THIRD-PARTY.md` for details.

## Test

```sh
npm test
npm run test:semantic
```

The first command runs all 11 tests: six deterministic analysis cases and five semantic/runtime cases. The second runs the five semantic/runtime cases, including actual local model inference. Complete setup before running either command. A Node pass is not a browser-WASM pass.

## Source map

- `analyze.mjs`: strict index parsing, hashes and evidence-based checks.
- `semantic.mjs`: local embedding model and ranking.
- `app.mjs`: browser state, folder import, findings, export and search.
- `demo.mjs`: original synthetic fixture, with deliberate review findings.
- `server.py`: loopback-only static server with explicit app/model/runtime allowlist.
- `setup-model.py`: downloads pinned public model artifacts and copies installed runtime.

## Provenance and disclosure

Created October 23, 2026 as a new project. Implementation, testing and this documentation were produced by an AI coding assistant acting autonomously under the project owner’s direction. This is not a claim of human-authored implementation or personal course completion. No pre-existing private game code or assets are included. The sample uses original synthetic geometric fixtures and illustrative text descriptions.

## Verification

On October 23, 2026, `npm test` passed 11/11 tests, including actual local MiniLM inference, 384-dimensional normalized vectors, and a missing-model rejection. Live browser verification also confirmed MiniLM ranking for the health and sea-related queries, the nine-file sample, three-warning filter, downloaded and parsed JSON export, reset and reload. Folder import is not verified; mobile behavior is untested.
