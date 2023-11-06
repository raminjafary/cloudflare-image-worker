import { type RequestInitCfProperties } from '@cloudflare/workers-types';

export default {
	cloudflare_images_account_hash: '',
	defaultDomain: 'https://imagedelivery.net',
	customDomain: '<YOUR_DOMAIN>/cdn-cgi/imagedelivery',
	domain: '<YOUR_DOMAIN>',
	debug: false,
	accountID: '',
	apiToken: '',
	images: {
		cfImage: '',
		noCfImage: '',
	},
	variants: {
		public: 'public',
		small: 'small',
		thumbnail: 'thumbnail',
	},
	cfOptions: {
		cacheEverything: true,
		polish: 'lossy',
		image: {
			compression: 'fast',
		},
	} as RequestInitCfProperties,
};
