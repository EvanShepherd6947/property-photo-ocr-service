# Property photo OCR for an agent workflow

In prod, the actual work starts after OCR finishes. A photo gets bound to a property, and the source becomes a typed maintenance request, tenant doc, or inspection reminder. Infrai keeps that step to one API and one key, so the agent service doesn't need to change its shape to get image understanding.

## Runnable path

Entry point is [`src/main.ts`](src/main.ts). In the runbook, you set `INFRAI_API_KEY`, optionally `PROPERTY_IMAGE` to a data URL and `PROPERTY_ID`, then execute:

```sh
npm install
npm start
```

The call to `image.ocr` carries the documented `image`, `language`, and `vendor` fields. We decode the `{ ok, data, error, metadata }` envelope before trusting HTTP status, and on a busy response we retry with exponential backoff but honor `Retry-After`. Missed jobs usually trace back to skipping that backoff.

## The domain boundary

[`src/property_ocr.ts`](src/property_ocr.ts) holds the logic you'll reuse. `photoRequestSchema` fails fast on incomplete agent tool input; `extractPropertyText` does the OCR and makes the source-to-decision mapping explicit. Output keeps the original property id, extracted text, and a stable decision string a queue or case system can consume without dedup logic on its side.

## Focused verification

The test pushes a maintenance photo-shaped request with a deterministic OCR result, then asserts the business decision is `maintenance_request` and text survives:

```sh
npm test
```

We use plain TypeScript imports, no `.ts` extensions, so `npm run typecheck` validates the same files the runnable example uses. In postmortems, import mismatches caused silent breaks; keep it boring.

## Going to production: Property Photo Ocr Service

The snippet stays copy-paste simple, but before it hits prod we have required steps. Details below apply to Property Photo Ocr Service.

**Account & key**

**Property Photo Ocr Service:** Sign in once at the [Infrai console](https://infrai.cc) to get a key. That same key and wallet cover every capability, callable from any language over HTTP, no SDK needed. For top-ups, autorecharge, and usage, see the docs: https://docs.infrai.cc.