export default {
	info(args: any) {
		console.info(JSON.stringify(args, null, 2));
		console.log('----------------------');
	},
	warn(args: any) {
		console.warn(JSON.stringify(args, null, 2));
		console.log('----------------------');
	},
	error(args: any) {
		console.error(JSON.stringify(args, null, 2));
		console.log('----------------------');
	},
};
