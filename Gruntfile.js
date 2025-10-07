/**
 * Temporary SSL workaround
 * https://github.com/mzabriskie/axios/issues/535#issuecomment-262299969
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = function (grunt) {
	const glob = require('glob');
	const loadConfig = path => {
		const obj = {};
		glob.sync('*', { cwd: path }).forEach(file => {
			obj[file.replace(/\.js$/, '')] = require(path + file);
		});
		return obj;
	};

	const dev = grunt.file.exists('local-config.json')
		? grunt.file.readJSON('local-config.json')
		: { proxy: 'square1.tribe', certs_path: '' };

	const config = {
		pkg: grunt.file.readJSON('package.json'),
		dev,
		...loadConfig('./grunt_options/'),
	};

	grunt.initConfig(config);
	require('load-grunt-tasks')(grunt);

	const le = grunt.option('le') || 'mac';

	// Task registration
	grunt.registerTask('default', ['dist']);
	grunt.registerTask('amp', [
		'postcss:themeAMP', 'postcss:themeAMPMin',
		'postcss:themeCartAMP', 'postcss:themeCartAMPMin'
	]);
	grunt.registerTask('wp-admin', [
		'postcss:themeWPAdmin', 'postcss:themeWPAdminMin'
	]);
	grunt.registerTask('wp-gutenblocks', [
		'postcss:themeGutenbergBlocks', 'postcss:themeGutenbergBlocksMin'
	]);
	grunt.registerTask('build', [
		'clean:themeMinCSS', 'postcss:theme', 'postcss:themeMin', 'header:theme',
		'postcss:themeAMP', 'postcss:themeAMPMin', 'header:themeAMP',
		'postcss:themeWPAdmin', 'postcss:themeWPAdminMin', 'header:themeWPAdmin',
		'postcss:themeGutenbergBlocks', 'postcss:themeGutenbergBlocksMin', 'header:themeGutenberg',
		'clean:themeMinJS', 'webpack', 'concat:themeMinVendors',
		'clean:themeMinVendorJS', `lineending:${le}`, 'buildTimestamp', 'setPHPConstant'
	]);
	grunt.registerTask('test', ['shell:test']);
	grunt.registerTask('lint', ['eslint', 'postcss:themeLint']);
	grunt.registerTask('cheat', ['shell:install', 'concurrent:dist', `lineending:${le}`]);
	grunt.registerTask('dist', [
		'shell:install', 'shell:test',
		'concurrent:preflight', 'concurrent:dist',
		`lineending:${le}`
	]);
	grunt.registerTask('dev', ['browserSync:dev', 'watch']);
	grunt.registerTask('devDocker', ['browserSync:devDocker', 'watch']);
	grunt.registerTask('icons', [
		'clean:coreIconsStart', 'unzip:coreIcons', 'copy:coreIconsFonts',
		'copy:coreIconsStyles', 'copy:coreIconsVariables', 'replace:coreIconsStyle',
		'replace:coreIconsVariables', 'header:coreIconsStyle', 'header:coreIconsVariables',
		'footer:coreIconsVariables', 'concurrent:dist', 'clean:coreIconsEnd', `lineending:${le}`
	]);

	grunt.registerTask('buildTimestamp', 'Create PHP build timestamp file', () => {
		grunt.file.write('build-timestamp.php', "<?php\ndefine('BIGCOMMERCE_ASSETS_BUILD_TIMESTAMP', '');\n");
	});
};
