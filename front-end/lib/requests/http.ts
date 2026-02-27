import type { ApiResponse } from "@/lib/Interfaces/ApiResponse";

type JsonLike = Record<string, unknown>;

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOptions = {
  method?: RequestMethod;
  body?: JsonLike;
};

export async function requestAppApi<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body } = options;
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || "Falha na requisição.");
  }
  return payload;
}
