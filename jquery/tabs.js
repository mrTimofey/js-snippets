/**
 * jQuery tabs plugin
 */

var $ = window.jQuery || require('jquery'),
	pluginName = 'tabs',
	defaults = {
		anchors: 'nav a',
		tabs: 'section',
		currentClass: 'current',
		// currentClass used both for tabs and anchors by default, can be rewritten
		currentTabClass: false,
		currentAnchorClass: false,
		// function returning opening element
		resolve: function(tabs, anchor) { return tabs.filter(anchor.attr('href')); },
		// use hash navigation
		hash: true
	};

function plugin(options) {
	options = $.extend({}, defaults, options);

	var curTabCl = options.currentTabClass || options.currentClass,
		curAncCl = options.currentAnchorClass || options.currentClass,
		win = $(window);

	this.each(function(i, el) {
		el = $(el);

		var anchors = el.find(options.anchors),
			tabs = el.find(options.tabs),
			currentTab = tabs.eq(0),
			currentAnchor,
			tabChanged = false;

		if (tabs.length === 0 || anchors.length === 0) return;

		anchors.click(function(e) {
			e.preventDefault();
			var anchor = $(this);

			currentTab.removeClass(curTabCl);
			currentTab = options.resolve(tabs, anchor).addClass(curTabCl);

			currentAnchor.removeClass(curAncCl);
			currentAnchor = anchor.addClass(curAncCl);

			if (options.hash) {
				location.hash = anchor.attr('href');
				tabChanged = true;
			}
		});

		// set initial anchor and tab
		if (options.hash && location.hash) currentAnchor = anchors.filter('[href="' + location.hash + '"]');
		if (!currentAnchor || currentAnchor.length === 0) currentAnchor = tabs.filter('.' + curAncCl);
		if (currentAnchor.length === 0) currentAnchor = anchors.eq(0).addClass(curAncCl);
		currentAnchor.click();

		if (options.hash) win.on('hashchange', function() {
			if (tabChanged) {
				tabChanged = false;
				return;
			}
			anchors.filter('[href="' + location.hash + '"]').click();
		});
	});

	return this;
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;