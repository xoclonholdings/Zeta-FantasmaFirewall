export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string; message?: string; recovery?: string };
    throw new Error([body.error, body.message, body.recovery].filter(Boolean).join(": ") || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
