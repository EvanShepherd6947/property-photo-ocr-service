import { InfraiClient } from "./infrai_client.js";
import { extractPropertyText } from "./property_ocr.js";

const apiKey = process.env.INFRAI_API_KEY;
if (!apiKey) throw new Error("Set INFRAI_API_KEY before running the example");

const result = await extractPropertyText(new InfraiClient(apiKey), {
  image: process.env.PROPERTY_IMAGE ?? "data:image/jpeg;base64,example",
  propertyId: process.env.PROPERTY_ID ?? "building-12-unit-4",
  source: "maintenance"
});
console.log(JSON.stringify(result, null, 2));
