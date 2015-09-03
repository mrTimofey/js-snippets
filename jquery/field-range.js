/**
 * jQuery field with with stylable range slider
 */

var $ = window.jQuery || require('jquery'),
	pluginName = 'fieldRange',
	defaults = { };

function plugin(options) {
	options = $.extend({}, defaults, options);
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;