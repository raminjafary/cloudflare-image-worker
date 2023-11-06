const allowedMethods = 'GET, HEAD, POST, PUT, DELETE, TRACE, PATCH, OPTIONS';

export function handleOptions(request: Request) {
	if (
		request.headers.get('Origin') !== null &&
		request.headers.get('Access-Control-Request-Method') !== null &&
		request.headers.get('Access-Control-Request-Headers') !== null
	) {
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': allowedMethods,
				'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || '',
			},
		});
	} else {
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Methods': allowedMethods,
			},
		});
	}
}
