import logger from './log';

type FtechCacheOptions = {
	cacheKey?: Request;
	fetch: () => Promise<Response>;
};

const cache = caches.default;

export async function fetchCache(options: FtechCacheOptions) {
	const { cacheKey, fetch: fetchResponse } = options;

	let response: Response | undefined = undefined;

	if (cacheKey) {
		logger.info({
			cacheKey: cacheKey.url,
		});
		response = await cache.match(cacheKey);
	}

	if (!response) {
		response = await fetchResponse();
		response = new Response(response.body, response);

		if (cacheKey) {
			if (response.headers.has('Cache-Control')) {
				cache.put(cacheKey, response.clone()).catch((err) => {
					logger.warn({
						messsage: 'Error caching response',
						cacheKey,
						err: err.toString(),
					});
				});
			}

			response.headers.set('cf-cache-status', 'MISS');
		} else {
			response.headers.set('cf-cache-status', 'BYPASS');
		}
	}

	return response;
}
