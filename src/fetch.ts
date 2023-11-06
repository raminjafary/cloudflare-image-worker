import config from './config';
import { errorResponse } from './error';
import { globalResHeadersKeys, globalResHeaders } from './globalResponseHeaders';
import logger from './log';

const headerWhitelist = new Set([
	'connection',
	'content-disposition',
	'content-type',
	'content-length',
	'cf-polished',
	'date',
	'status',
	'transfer-encoding',
]);

export async function fetchRequest(request: Request, fallbackReq: Request) {
	const originResponse = await fetch(request, { headers: request.headers, cf: config.cfOptions });

	logger.info({
		CloudflareResponseStatus: originResponse.status,
	});

	let response = new Response(originResponse.body, originResponse);

	normalizeResponseHeaders(response);

	response.headers.set('cache-control', 'public, immutable, s-maxage=31536000, max-age=31536000, stale-while-revalidate=60');

	for (const header of globalResHeadersKeys) {
		response.headers.set(header, globalResHeaders[header]);
	}

	if (response.status === 404) {
		response = await fetch(fallbackReq, { headers: request.headers });

		logger.info({
			CDNResponseStatus: response.status,
		});

		if (response.status === 404) {
			return errorResponse({ message: 'Not Found' }, { status: 404 });
		}

		return response;
	}

	return response;
}

function normalizeResponseHeaders(res: Response) {
	const headers = Object.fromEntries(res.headers.entries());
	const keys = Object.keys(headers);

	for (const key of keys) {
		if (!headerWhitelist.has(key)) {
			res.headers.delete(key);
		}
	}

	return res;
}
