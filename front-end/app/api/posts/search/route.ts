import { NextResponse } from "next/server";
import { getToken } from "../route";
import { ApiResponse } from "@/lib/Interfaces/ApiResponse";
const API_BASE_URL = process.env.BLOG_API_BASE_URL ?? "http://localhost:3001";

export const SearchPosts = async <T>(term: string): Promise<ApiResponse<T>> => {
	const token = await getToken();
	const response = await fetch(`${API_BASE_URL}/posts/search?q=${encodeURIComponent(term)}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

  return {
    success: (await response.json()) as ApiResponse<T>["success"],
    message: (await response.json()) as ApiResponse<T>["message"],
    data: (await response.json()) as ApiResponse<T>["data"],
    error: (await response.json()) as ApiResponse<T>["error"],
  };
};


const normalizeList = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === "object") {
    const data = payload as { posts?: unknown; data?: unknown };
    if (Array.isArray(data.posts)) {
      return data.posts;
    }
    if (Array.isArray(data.data)) {
      return data.data;
    }
  }
  return [];
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("q")?.trim() ?? "";

    if (!term) {
      return NextResponse.json({ success: true, data: [] });
    }

    const data = await SearchPosts<unknown>(term);
    const items = normalizeList(data);
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: "Erro ao buscar postagens." } }, { status: 500 });
  }
}
