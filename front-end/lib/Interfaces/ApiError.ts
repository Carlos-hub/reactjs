export interface ApiError {
	message: string;
	details?: Record<string, unknown>;
}