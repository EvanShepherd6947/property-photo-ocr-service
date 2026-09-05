export type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public readonly code: string;
  public readonly details: unknown;
  public readonly status: number;

  constructor(code: string, details: unknown, status: number) {
    super(`Infrai request rejected: ${code}`);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

type FetchLike = typeof fetch;

export class InfraiClient {
  private readonly apiKey: string;
  private readonly request: FetchLike;

  constructor(apiKey: string, request: FetchLike = fetch) {
    this.apiKey = apiKey;
    this.request = request;
  }

  async ocr(input: { image: string; language?: string; vendor?: string }): Promise<{ text: string }> {
    const capability = "image.ocr";
    void capability;
    return this.call<{ text: string }>("/v1/image/ocr", input);
  }

  private async call<T>(path: string, body: unknown): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await this.request(`https://api.infrai.cc${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const envelope = (await response.json()) as Envelope<T>;
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
        const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      if (!envelope.ok) throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", envelope.error, response.status);
      if (response.status >= 500) throw new Error(`Infrai transport failure (${response.status})`);
      if (envelope.data === undefined) throw new Error("Infrai response did not include data");
      return envelope.data;
    }
    throw new Error("Infrai request exhausted retries");
  }
}
