import { fetchCache } from './cache';
import config from './config';
import { fetchRequest } from './fetch';
import { getRequestCacheKey } from './getCacheKey';
import { handleOptions } from './handleOptions';
import { errorResponse } from './error';
import { resolveRequest } from './resolveRequest';

export async function handleRequest(request: Request) {
	config.debug = request.url.includes('debug');

	const gatewayStartTime = Date.now();
	let gatewayTimespan = 0;

	function recordTimespans() {
		const now = Date.now();
		gatewayTimespan = now - gatewayStartTime;
	}

	try {
		if (request.method === 'OPTIONS') {
			return handleOptions(request);
		}

		const { originReq, fallbackReq, imageName, variant } = await resolveRequest(request);

		if (!variant || !imageName) {
			return errorResponse({ message: 'Not Found' }, { status: 404 });
		}

		const cacheKey = await getRequestCacheKey(originReq);

		const originRes = await fetchCache({
			cacheKey,
			fetch: () => fetchRequest(originReq, fallbackReq),
		});

		const response = new Response(originRes.body, originRes);

		recordTimespans();

		response.headers.set('x-proxy-response-time', `${gatewayTimespan}ms`);

		return response;
	} catch (error) {
		return errorResponse(error, { status: 500 });
	}
}
