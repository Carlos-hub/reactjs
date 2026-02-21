import { cookies } from "next/headers";

export const getValidSessionHelper = async (): Promise<string> => {
	const cookieStore = await cookies();
	const token = cookieStore.get("token");
	if (!token) {
		throw new Error("Unauthorized");
	}
	return token.value;
};