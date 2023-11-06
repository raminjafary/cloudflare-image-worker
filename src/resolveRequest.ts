import config from './config';
import { extractVariant } from './extractVariant';
import logger from './log';
import { normalizeUrl } from './normalizeUrl';

export async function resolveRequest(request: Request) {
	let sourceURL = config.debug ? config.images.cfImage : request.url;

	const { variant, imageName, url } = extractVariant(normalizeUrl(sourceURL));

	sourceURL = url;

	let destinationURL = createDestinationUrl(imageName, variant);

	const sourceSearchParams = new URL(url).searchParams;

	if (sourceSearchParams.size) {
		destinationURL = destinationURL.concat(`?${sourceSearchParams.toString()}`);
	}

	const originReq = new Request(destinationURL, request);
	const fallbackReq = new Request(sourceURL, request);

	logger.info({
		requestUrl: request.url,
		sourceURL,
		variant,
		imageName,
		destinationURL,
	});

	return {
		originReq,
		fallbackReq,
		variant,
		imageName,
	};
}

function createDestinationUrl(imageName: string, variant: string) {
	return `${config.defaultDomain}/${config.cloudflare_images_account_hash}/${imageName}/${variant}`;
}
