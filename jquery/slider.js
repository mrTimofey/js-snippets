/**
 * jQuery slider
 */

var $ = window.jQuery,
	pluginName = 'slider',
	defaults = {
		controlsEnabled: true,
		controls: function(containerCl, prevCl, nextCl, el) {
			var container = $('<div></div>').addClass(containerCl).appendTo(el);
			return [
				$('<div></div>').addClass(prevCl).append('<span></span>').appendTo(container),
				$('<div></div>').addClass(nextCl).append('<span></span>').appendTo(container)
			];
		},
		// return to the first slide when triggering next while current slide is the last and vice versa
		controlsCircleNav: true,
		controlDisabledClass: 'disabled',
		// classes
		controlsContainerClass: 'slider-controls',
		controlPrevClass: 'slider-control slider-control-prev',
		controlNextClass: 'slider-control slider-control-next',

		pagerEnabled: true,
		pagerContainer: function(cl, el) { return $('<div></div>').addClass(cl).appendTo(el); },
		pagerItem: function(i, cl, el) { return $('<i></i>').addClass(cl).html(i + 1); },
		// from options.currentClass by default
		pagerCurrentClass: false,
		pagerContainerClass: 'slider-pager',
		pagerItemClass: 'slider-pager-item',

		displayEnabled: true,
		// creates display DOM, but returns only current value DOM object
		display: function(containerCl, currentCl, totalCl, count, el) {
			var container = $('<div></div>').addClass(containerCl),
				current = $('<span></span>').addClass(currentCl),
				total = $('<span></span>').addClass(totalCl);
			container.append(current).append(' / ').append(total.html(count)).appendTo(el);
			return current;
		},
		displayContainerClass: 'slider-display',
		displayCurrentClass: 'slider-display-current',
		displayTotalClass: 'slider-display-total',

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
			controls = value(options.controls, [options.controlsContainerClass, options.controlPrevClass, options.controlNextClass, el]);
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

			pagerContainer = value(options.pagerContainer, [options.pagerContainerClass, el]);
			pagerItems = [];
			for (var i = 0; i < slides.length; ++i) {
				pagerItems.push(options.pagerItem(i, options.pagerItemClass, el));
				pagerItems[i].click(pageClick);
				pagerContainer.append(pagerItems[i]);
			}
		})();

		if (options.displayEnabled) (function() {
			display = value(options.display, [options.displayContainerClass, options.displayCurrentClass, options.displayTotalClass, slides.length, el]);
		})();

		(function() {
			var current = slides.filter(sCurCl);
			if (current.length) return setSlide(current.index());
			return setSlide(0);
		})();
	});

	return this;
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;