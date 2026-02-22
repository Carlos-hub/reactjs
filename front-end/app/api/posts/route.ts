import { NextResponse } from "next/server";
import { ApiResponse } from "../../../lib/Interfaces/ApiResponse";
import { getValidSessionHelper } from "../Helpers/GetValidSessionHelper";
const API_BASE_URL = process.env.API_BASE_URL;

type RequestOptions = {
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
};

export const getToken = async (): Promise<string> => {
	return await getValidSessionHelper();
};

export async function GET(): Promise<NextResponse> {
	const token = await getToken();
	const response = await fetch(`${API_BASE_URL}/posts`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});
	const result = (await response.json()) as ApiResponse<unknown>;
	if (
		result.error?.message === "Unauthorized" ||
		result.error?.message === "Forbidden"
	) {
		return NextResponse.json(
			{ success: false, error: { message: "Unauthorized" } },
			{ status: 401 }
		);
	}
  return NextResponse.json(result);
}

export const GetPostById = async <T>(id: string): Promise<T> => {
	const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
		},
	});

  const payload: ApiResponse<T> = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || "Erro ao consumir a API de posts.");
  }

  return payload.data as T;
};

export const SearchPosts = async <T>(term: string): Promise<ApiResponse<T>> => {
	const token = await getToken();
	const response = await fetch(`${API_BASE_URL}/posts/search?q=${encodeURIComponent(term)}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

  const payload = (await response.json()) as ApiResponse<T>;
  return payload;
};


export async function POST(request: Request): Promise<NextResponse> {
	const token = await getToken();
	const RequestBody = await request.json();
	console.log(RequestBody?.title, RequestBody?.content, RequestBody?.author);
	const response = await fetch(`${API_BASE_URL}/posts`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(RequestBody),
	});
	return NextResponse.json(await response.json());
}
