import { basename, resolve } from 'node:path';
import { readFileSync, existsSync, lstatSync } from 'node:fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import config from '../src/config.js';
import { exit } from './utils.js';

type UploadPayload = {
	url?: string;
	file?: string;
	id?: string;
	metadata?: Record<string, any>;
};

export async function upload({ url, file, id, metadata }: UploadPayload) {
	if (!config.apiToken) {
		exit('Consider settign apiToken in the config file');
	}

	const body = new FormData();

	if (id) {
		body.append('id', id);
	}

	if (url) {
		body.append('url', url);
	}

	if (file) {
		try {
			const fileContent = readFileSync(file);
			body.append('file', new Blob([fileContent]), basename(file));
		} catch (error) {
			exit('Error while reading file: ' + file + '; ' + error);
		}
	}

	if (metadata) {
		body.append('metadata', JSON.stringify(metadata));
	}

	try {
		console.log('\nUploading ...\n');

		const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.accountID}/images/v1`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${config.apiToken}` },
			body,
		});

		if (res.status !== 200) {
			exit('HTTP ' + res.status + ' : ' + (await res.text()));
		}

		console.log(await res.json());
	} catch (error) {
		exit('ERROR:' + error);
	}
}

function parseCommandLineArgs() {
	const argv = yargs(hideBin(process.argv)).argv as unknown as UploadPayload & { metadata: string };

	if (!argv.url && !argv.file) {
		exit('Please provide one of `--url https://example.com/image.png` or `--file=/path/to/file.jpg` is required');
	}

	if (argv.url && argv.file) {
		exit('Cannot specify both `--url` and `--file` at the same time');
	}

	let file = '';

	if (argv.file) {
		const absFile = resolve(argv.file);
		try {
			if (!existsSync(absFile) || !lstatSync(absFile).isFile()) {
				exit('File does not exist or is not a valid file: ' + absFile);
			}
		} catch (err: any) {
			exit(`Error while looking for file ${absFile}: ` + err.toString());
		}

		file = absFile;
	}

	let url = '';

	if (argv.url) {
		try {
			const parsedURL = new URL(argv.url);
			if (!['http:', 'https:'].includes(parsedURL.protocol)) {
				exit(`Invalid url protocol ${parsedURL.protocol}`);
			}
			url = argv.url;
		} catch (err: any) {
			exit(`Invalid url ${argv.url}: ` + err.toString());
		}
	}

	let metadata = {};

	if (argv.metadata) {
		try {
			const parsedMetadata = JSON.parse(argv.metadata);
			if (typeof parsedMetadata !== 'object') {
				exit('--metadata should be a valid JSON object');
			}

			metadata = parsedMetadata;
		} catch (error: any) {
			exit('Invalid JSON metadata: ' + error.toString());
		}
	}

	return { url, file, id: argv.id, metadata };
}

function main() {
	upload(parseCommandLineArgs());
}

main();
