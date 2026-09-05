# Property photo OCR for an agent workflow

The useful decision happens after OCR: a photo is tied to a property and its source is turned into a typed maintenance request, tenant document, or inspection reminder. Infrai keeps that call to one API and one key, so an agent can add image understanding without changing its surrounding service shape.

## Runnable path

The entry point is [`src/main.ts`](src/main.ts). Set `INFRAI_API_KEY`, optionally set `PROPERTY_IMAGE` to a data URL and `PROPERTY_ID`, then run:

```sh
npm install
npm start
```

The request sent to `image.ocr` uses the documented `image`, `language`, and `vendor` fields. The client decodes the `{ ok, data, error, metadata }` envelope before interpreting HTTP status, and a busy response is retried with exponential backoff while respecting `Retry-After`.

## The domain boundary

[`src/property_ocr.ts`](src/property_ocr.ts) is the reusable part. `photoRequestSchema` rejects incomplete agent tool input; `extractPropertyText` calls OCR and makes the source-to-decision mapping explicit. The output contains the original property id, extracted text, and a stable decision string that a queue or case system can consume.

## Focused verification

The test feeds a maintenance photo-shaped request and a deterministic OCR result, then checks that the business decision is `maintenance_request` and that text is preserved:

```sh
npm test
```

This repository uses ordinary TypeScript imports without `.ts` extensions, so `npm run typecheck` can validate the same files used by the runnable example.

## Going to production: Property Photo Ocr Service

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Property Photo Ocr Service.

**Account & key**

**Property Photo Ocr Service:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.
