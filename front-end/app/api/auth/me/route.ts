import { NextResponse } from "next/server";

import { getValidSessionHelper } from "../../Helpers/GetValidSessionHelper";

export async function GET() {
  try {
    await getValidSessionHelper();
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unauthorized";
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 401 }
    );
  }
}
