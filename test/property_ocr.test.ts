import assert from "node:assert/strict";
import { extractPropertyText } from "../src/property_ocr.js";

const fakeClient = { ocr: async () => ({ text: "Leaking faucet in kitchen" }) } as never;
const result = await extractPropertyText(fakeClient, { image: "data:image/jpeg;base64,x", propertyId: "p-7", source: "maintenance" });
assert.equal(result.decision, "maintenance_request");
assert.equal(result.text, "Leaking faucet in kitchen");
console.log("property OCR decision test passed");
