/**
 * jQuery native scrolling with custom stylable scroll-bar
 */

var $ = window.jQuery || require('jquery'),
	pluginName = 'scroll',
	defaults = { };

function plugin(options) {
	options = $.extend({}, defaults, options);
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;