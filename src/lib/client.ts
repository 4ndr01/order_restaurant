export async function api<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      // Un envoi de fichier (FormData) fixe lui-même son type et sa délimitation.
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Une erreur est survenue.");
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
