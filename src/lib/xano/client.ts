const XANO_BASE_URL = process.env.NEXT_PUBLIC_XANO_BASE_URL;

export class XanoApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown,
  ) {
    super(message);
    this.name = "XanoApiError";
  }
}

interface XanoRequestOptions extends Omit<RequestInit, "body"> {
  token?: string;
  body?: unknown;
}

export async function xanoFetch<T>(
  path: string,
  { token, body, headers, ...init }: XanoRequestOptions = {},
): Promise<T> {
  if (!XANO_BASE_URL) {
    throw new Error("NEXT_PUBLIC_XANO_BASE_URL is not set");
  }

  const res = await fetch(`${XANO_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => undefined);
    throw new XanoApiError(
      `Xano request failed: ${res.status} ${path}`,
      res.status,
      errorBody,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function xanoErrorMessage(err: XanoApiError): string {
  const body = err.body as { message?: string } | undefined;
  return body?.message ?? err.message;
}
