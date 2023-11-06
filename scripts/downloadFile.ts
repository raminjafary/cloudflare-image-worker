import { createWriteStream } from 'node:fs';
import axios from 'axios';

export function downloadFile(url: string, path: string) {
	return new Promise((resolve, reject) => {
		axios({
			url,
			responseType: 'stream',
		})
			.then((response) =>
				new Promise((resolve, reject) => {
					response.data
						.pipe(createWriteStream(path))
						.on('finish', () => resolve(true))
						.on('error', (e: any) => reject(e));
				})
					.then(() => {
						resolve(true);
					})
					.catch((e) => {
						reject(e);
					}),
			)
			.catch((e) => {
				reject(e);
			});
	});
}
