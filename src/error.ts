import { globalResHeaders } from './globalResponseHeaders';

export function errorResponse(err: any, { status = 500 }) {
	return new Response(
		JSON.stringify({
			error: err.message,
			type: err?.type,
			code: err?.code,
		}),
		{ status, headers: globalResHeaders },
	);
}
