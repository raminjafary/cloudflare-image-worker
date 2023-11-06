import { createInterface } from 'node:readline';
import { rmdirSync, existsSync, mkdirSync } from 'node:fs';

export function readLineAsync(message: string) {
	const rl = createInterface(process.stdin, process.stdout);
	return new Promise((resolve) => {
		rl.question(message, (answer) => {
			resolve(answer);
			rl.close();
		});
	});
}

export function exit(msg: string) {
	console.error(msg);
	process.exit(1);
}

export function createOutputDir(outDir: string) {
	if (existsSync(outDir)) {
		console.log('🗑️  Removing stale files');
		rmdirSync(outDir, { recursive: true });
		console.log('✔️  Removed stale files');
	}
	mkdirSync(outDir);
	console.log(`✔️  Created ${outDir} directory`);
}
