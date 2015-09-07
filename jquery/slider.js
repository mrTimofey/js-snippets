/**
 * jQuery slider
 */

var $ = window.jQuery || require('jquery'),
	pluginName = 'slider',
	defaults = {
		controlsEnabled: true,
		controls: function(el) {
			var container = $('<div></div>').addClass('slider-controls').appendTo(el);
			return [
				$('<div></div>').addClass('slider-control slider-control-prev').append('<span></span>').appendTo(container),
				$('<div></div>').addClass('slider-control slider-control-next').append('<span></span>').appendTo(container)
			];
		},
		controlsCircleNav: true,
		controlDisabledClass: 'disabled',

		pagerEnabled: true,
		pagerContainer: function(el) { return $('<div></div>').addClass('slider-pager').appendTo(el); },
		pagerItem: function(i) { return $('<i></i>').addClass('slider-pager-item').html(i + 1); },
		// from options.currentClass by default
		pagerCurrentClass: false,

		displayEnabled: true,
		display: function(el, count) {
			var container = $('<div></div>').addClass('slider-display'),
				current = $('<span></span>').addClass('slider-display-current'),
				total = $('<span></span>').addClass('slider-display-total');
			container.append(current).append(' / ').append(total.html(count)).appendTo(el);
			return current;
		},

		slides: '.slide',
		// from options.currentClass by default
		slideCurrentClass: false,

		interval: 7000,
		currentClass: 'current',
		processedClass: 'js-processed'
	};

// returns value itself or function call result if value is a function
function value(what, params) {
	if (typeof what === 'function') return what.apply(null, params);
	return what;
}

function plugin(options) {
	options = $.extend({}, defaults, options);

	var pCurCl = options.pagerCurrentClass,
		sCurCl = options.slideCurrentClass;

	if (!pCurCl) pCurCl = options.currentClass;
	if (!sCurCl) sCurCl = options.currentClass;

	this.each(function(i, el) {
		el = $(el);

		var slides = el.find(options.slides),
			controls,
			pagerContainer,
			pagerItems,
			display,
			current,
			timeout;

		el.addClass(options.processedClass);

		if (slides.length === 0) return;
		if (slides.length === 1) {
			slides.addClass(sCurCl);
			return;
		}

		function setSlide(num) {
			if (num === 'next') {
				num = current.index() + 1;
				if (num >= slides.length) {
					if (!options.controlsCircleNav) return false;
					num = 0;
				}
			}
			else if (num === 'prev') {
				num = current.index() - 1;
				if (num < 0) {
					if (!options.controlsCircleNav) return false;
					num = slides.length - 1;
				}
			}
			else num = parseInt(num);

			if (current) {
				if (num === current.index()) return;
				if (options.pagerEnabled) pagerItems[current.index()].removeClass(pCurCl);
				current.removeClass(sCurCl);
			}
			current = slides.eq(num).addClass(sCurCl);

			if (options.controlsEnabled && !options.controlsCircleNav) {
				if (num <= 0) contrls[0].addClass(options.controlDisabledClass);
				if (num >= slides.length - 1) controls[1].addClass(options.controlDisabledClass);
			}
			if (options.pagerEnabled) {
				pagerItems[num].addClass(pCurCl);
			}
			if (options.displayEnabled) {
				display.html(num + 1);
			}
			if (options.interval) {
				if (timeout) clearTimeout(timeout);
				timeout = setTimeout(function() { setSlide('next'); }, options.interval);
			}
		}

		if (options.controlsEnabled) (function() {
			controls = value(options.controls, [el]);
			controls[0].click(function(e) {
				e.preventDefault();
				setSlide('prev');
			});

			controls[1].click(function(e) {
				e.preventDefault();
				setSlide('next');
			});
		})();

		if (options.pagerEnabled) (function() {
			function pageClick(e) {
				e.preventDefault();
				setSlide($(this).index());
			}

			pagerContainer = value(options.pagerContainer, [el]);
			pagerItems = [];
			for (var i = 0; i < slides.length; ++i) {
				pagerItems.push(options.pagerItem(i));
				pagerItems[i].click(pageClick);
				pagerContainer.append(pagerItems[i]);
			}
		})();

		if (options.displayEnabled) (function() {
			display = value(options.display, [el, slides.length]);
		})();

		(function() {
			var current = slides.filter('.current');
			if (current.length) return setSlide(current.index());
			return setSlide(0);
		})();
	});

	return this;
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;