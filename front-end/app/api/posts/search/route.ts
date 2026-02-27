import { NextResponse } from "next/server";
import { requestBackend } from "@/lib/server/backendClient";
import { getTokenFromCookie } from "@/lib/server/session";

export async function GET(request: Request) {
  const token = await getTokenFromCookie();
  if (!token) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const term = searchParams.get("q")?.trim() ?? "";
  if (!term) {
    return NextResponse.json({ success: true, data: [] });
  }

  const { status, payload } = await requestBackend(`/posts/search?q=${encodeURIComponent(term)}`, {
    token,
  });
  return NextResponse.json(payload, { status });
}
