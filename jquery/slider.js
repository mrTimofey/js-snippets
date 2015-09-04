/**
 * jQuery native scrolling with custom stylable scroll-bar
 */

var $ = window.jQuery || require('jquery'),
	pluginName = 'slider',
	defaults = { };

function plugin(options) {
	options = $.extend({}, defaults, options);

	return this;
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;