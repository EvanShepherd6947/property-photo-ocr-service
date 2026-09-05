import { z } from "zod";
import type { InfraiClient } from "./infrai_client.js";

export const photoRequestSchema = z.object({
  image: z.string().min(1),
  propertyId: z.string().min(1),
  source: z.enum(["maintenance", "tenant_document", "inspection"])
});

export type PhotoRequest = z.infer<typeof photoRequestSchema>;
export type ClassifiedRequest = PhotoRequest & { text: string; decision: "maintenance_request" | "tenant_document" | "inspection_reminder" };

export async function extractPropertyText(client: InfraiClient, raw: unknown): Promise<ClassifiedRequest> {
  const input = photoRequestSchema.parse(raw);
  const result = await client.ocr({ image: input.image, language: "eng", vendor: "auto" });
  const decision = input.source === "maintenance" ? "maintenance_request" : input.source === "tenant_document" ? "tenant_document" : "inspection_reminder";
  return { ...input, text: result.text, decision };
}
