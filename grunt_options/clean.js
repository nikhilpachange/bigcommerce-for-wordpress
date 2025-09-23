/**
 * Grunt Clean Task Configurations
 * Reference: https://npmjs.org/package/grunt-contrib-clean
 */

module.exports = {
	removeCoreIconsTemp: [
		'<%= pkg._component_path %>/theme/icons/bigcommerce',
		'<%= pkg._bc_public_fonts_path %>icons-bigcommerce',
		'<%= pkg._bc_public_pcss_path %>base/_icons.pcss',
		'<%= pkg._bc_public_pcss_path %>utilities/variables/_icons.pcss',
	],

	removeCoreIconsArchive: [
		'<%= pkg._component_path %>/bigcommerce-icons.zip',
	],

	clearThemeCss: [
		'<%= pkg._bc_css_dist_path %>*.css',
	],

	clearThemeScripts: [
		'<%= pkg._bc_public_js_dist_path %>*.min.js',
		'<%= pkg._bc_admin_js_dist_path %>*.min.js',
	],

	clearVendorBundle: [
		'<%= pkg._bc_public_js_dist_path %>vendorWebpack.min.js',
	],
};
