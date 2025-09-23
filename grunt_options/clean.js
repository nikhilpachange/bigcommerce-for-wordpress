/**
 * Grunt Task: Clean
 * Reference: https://npmjs.org/package/grunt-contrib-clean
 */

module.exports = {
	iconCleanupTemp: [
		'<%= pkg._component_path %>/theme/icons/bigcommerce',
		'<%= pkg._bc_public_fonts_path %>icons-bigcommerce',
		'<%= pkg._bc_public_pcss_path %>base/_icons.pcss',
		'<%= pkg._bc_public_pcss_path %>utilities/variables/_icons.pcss',
	],

	iconCleanupZip: [
		'<%= pkg._component_path %>/bigcommerce-icons.zip',
	],

	cssDistClean: [
		'<%= pkg._bc_css_dist_path %>*.css',
	],

	jsDistClean: [
		'<%= pkg._bc_public_js_dist_path %>*.min.js',
		'<%= pkg._bc_admin_js_dist_path %>*.min.js',
	],

	vendorBundleClean: [
		'<%= pkg._bc_public_js_dist_path %>vendorWebpack.min.js',
	],
};
