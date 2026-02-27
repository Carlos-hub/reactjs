import { BLOG_API_BASE_URL } from "@/lib/config";
import type { ApiResponse } from "@/lib/Interfaces/ApiResponse";

type Method = "GET" | "POST" | "PUT" | "DELETE";

type BackendRequestOptions = {
  method?: Method;
  token?: string;
  body?: unknown;
};

export async function requestBackend<T>(
  path: string,
  options: BackendRequestOptions = {}
): Promise<{ status: number; payload: ApiResponse<T> }> {
  const { method = "GET", token, body } = options;
  const response = await fetch(`${BLOG_API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = {
      success: false,
      error: {
        message: "Resposta inválida do servidor.",
      },
    };
  }

  return { status: response.status, payload };
}
