import "server-only";

export type OmniwebReadiness = {
  ok: boolean;
  service?: string;
  database_ok?: boolean;
  database_error?: string;
};

export type OmniwebProfile = {
  client_id: string;
  name: string;
  email: string;
  plan: string;
  role: string;
  crm_webhook_url?: string | null;
  notification_email?: string | null;
  business_name?: string | null;
  business_type?: string | null;
  created_at?: string | null;
};

export type OmniwebTokenResponse = {
  access_token: string;
  token_type: string;
  client_id: string;
  email: string;
  plan: string;
  role: string;
};

export type OmniwebLivekitTokenResponse = {
  token: string;
  room_name: string;
  livekit_url: string;
};

export class OmniwebEngineError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "OmniwebEngineError";
    this.status = status;
    this.payload = payload;
  }
}

export function normalizeOmniwebBaseUrl(value: string) {
  const url = new URL(value);
  url.pathname = url.pathname.replace(/\/$/, "");
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

type OmniwebRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function omniwebRequest<T>(
  baseUrl: string,
  path: string,
  options: OmniwebRequestOptions = {},
): Promise<T> {
  const normalizedBaseUrl = normalizeOmniwebBaseUrl(baseUrl);
  const url = new URL(path.replace(/^\//, ""), `${normalizedBaseUrl}/`);
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? String(payload.detail)
        : `Omniweb engine request failed with status ${response.status}.`;

    throw new OmniwebEngineError(message, response.status, payload);
  }

  return payload as T;
}

export function getOmniwebReadiness(baseUrl: string) {
  return omniwebRequest<OmniwebReadiness>(baseUrl, "/readyz");
}

export function getOmniwebProfile(baseUrl: string, token: string) {
  return omniwebRequest<OmniwebProfile>(baseUrl, "/api/auth/profile", {
    token,
  });
}

export function exchangeClerkForEngineSession(baseUrl: string, clerkToken: string) {
  return omniwebRequest<OmniwebTokenResponse>(baseUrl, "/api/auth/clerk-session", {
    method: "POST",
    token: clerkToken,
  });
}

export function createOmniwebLivekitToken(
  baseUrl: string,
  token: string,
  input: {
    clientId: string;
    channel?: string;
    language?: string;
  },
) {
  return omniwebRequest<OmniwebLivekitTokenResponse>(baseUrl, "/api/livekit/token", {
    method: "POST",
    token,
    body: {
      client_id: input.clientId,
      channel: input.channel ?? "web",
      language: input.language ?? "en",
    },
  });
}
