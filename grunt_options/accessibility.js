module.exports = {
	defaults: {
		accessibilityLevel: 'WCAG2AA',
		enableBrowser: true,
		enforce: true,
		maxBuffer: '1024*1024',
		outputDir: 'reports',
		outputFormat: 'txt',
		debug: false,
		logLevels: {
			notice: false,
			warning: false,
			error: true,
		},
	},
	checkSite: {
		options: {
			urls: [
				'https://<%= dev.proxy %>',
			],
		},
	},
};
