import { NextResponse } from "next/server";
import { getSessionUserFromCookie } from "@/lib/server/session";

export async function GET() {
  const user = await getSessionUserFromCookie();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized" } },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true, data: user });
}
