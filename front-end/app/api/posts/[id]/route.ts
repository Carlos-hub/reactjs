import { NextResponse } from "next/server";
import { getToken } from "../route";

const API_BASE_URL = process.env.API_BASE_URL;
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	console.log(id);
	if (!id || !id.trim()) {
		return NextResponse.json({ error: "ID is required" }, { status: 400 });
	}
	const token = await getToken();
	const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});
	const result = await response.json();
	console.log(result);
	return NextResponse.json(result);
}