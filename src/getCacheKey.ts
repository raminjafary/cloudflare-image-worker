import { normalizeUrl } from './normalizeUrl';
import logger from './log';

export async function getRequestCacheKey(request: Request) {
	try {
		const pragma = request.headers.get('pragma');
		if (pragma === 'no-cache') {
			return undefined;
		}

		if (request.method !== 'GET' && request.method !== 'HEAD') {
			return undefined;
		}

		const cacheControl = request.headers.get('cache-control');
		if (cacheControl) {
			const directives = new Set(cacheControl.split(',').map((s) => s.trim()));
			if (directives.has('no-store') || directives.has('no-cache')) {
				return undefined;
			}
		}

		const url = request.url;
		const normalizedUrl = normalizeUrl(url);

		if (url !== normalizedUrl) {
			return normalizeRequestHeaders(new Request(normalizedUrl, { method: request.method }));
		}

		return normalizeRequestHeaders(new Request(request));
	} catch (err: any) {
		logger.error({
			messsage: 'Error computing cache keye',
			method: request.method,
			url: request.url,
			err: err.toString(),
		});
		return undefined;
	}
}

const requestHeaderWhitelist = new Set(['cache-control', 'accept', 'accept-encoding', 'accept-language', 'user-agent']);

function normalizeRequestHeaders(request: Request) {
	const headers = Object.fromEntries(request.headers.entries());
	const keys = Object.keys(headers);

	for (const key of keys) {
		if (!requestHeaderWhitelist.has(key)) {
			request.headers.delete(key);
		}
	}

	return request;
}
