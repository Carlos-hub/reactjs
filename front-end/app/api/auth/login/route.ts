import { cookies } from "next/headers";
import { ApiResponse } from "../../../../lib/Interfaces/ApiResponse";
import { NextResponse } from "next/server";


const API_BASE_URL = process.env.API_BASE_URL;
export async function POST (request: Request): Promise<NextResponse> {
	const { email, password, role } = await request.json();
	const response = await fetch(`${API_BASE_URL}/auth/${role === "student" ? "student/login" : "login"}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password, role }),
	});

	try {
		const payload = (await response.json()) as ApiResponse<{
			token: string;
		}>;
		if (!response.ok || !payload.success) {
			throw new Error(payload.error?.message ?? "Invalid credentials");
		}
	
		if (payload.data?.token) {
			const cookieStore = await cookies();
			cookieStore.set("token", payload.data.token);
		}
		return NextResponse.json({ success: payload.success, data: payload.data, message: payload.message }, { status: response.status });
	} catch (error) {
		return NextResponse.json({ success: false, error: { message: "Invalid credentials" } }, { status: 500 });
	}
};