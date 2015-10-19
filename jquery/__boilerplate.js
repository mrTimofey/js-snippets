/**
 * jQuery plugin boilerplate with require
 */

var $ = window.jQuery,
	pluginName = '__pluginName__',
	defaults = { };

function plugin(options) {
	options = $.extend({}, defaults, options);

	this.each(function(i, el) {
		el = $(el);
	});

	return this;
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;