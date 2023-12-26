import config from './config.js';

export function extractVariant(url: string) {
	const paramsIndex = url.indexOf('?');
	const parts = paramsIndex > -1 ? url.slice(0, paramsIndex).split('/').filter(Boolean) : url.split('/').filter(Boolean);

	let variant = '';
	let imageName = '';

	if ([config.variants.public, config.variants.small, config.variants.thumbnail].includes(parts[parts.length - 1])) {
		variant = parts.pop() || '';
	}

	const maybeImageName = parts[parts.length - 1];

	if (isValidImageName(maybeImageName)) {
		imageName = maybeImageName;
	}

	return {
		url,
		variant: variant || config.variants.public,
		imageName,
	};
}

function isValidImageName(filename: string) {
	return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(filename.split('.').pop()?.toLocaleLowerCase() ?? '');
}
