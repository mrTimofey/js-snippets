/**
 * jQuery bubble plugin.
 *
 * Add some styles before use:
 *
 * .bubble {
 *   display: block;
 *   position: fixed;
 *   z-index: 10;
 *   padding: 5px 10px;
 *   background: black;
 *   color: white;
 *   border-radius: 4px;
 * }
 * .bubble.hidden {
 *   display: none;
 * }
 */

var $ = window.jQuery,
	pluginName = 'bubble',
	defaults = {
		container: $(document.body),
		generator: function(obj, content, cl) {
			var extraClass;
			if (extraClass = obj.data('bubble-class')) extraClass = ' ' + extraClass;
			return $('<div></div>').addClass(cl + (extraClass || '')).html(content);
		},
		contentGetter: function(el) { return el.data('bubble') || el.attr('title'); },
		bubbleClass: 'bubble',
		verticalClass: 'bubble-vertical',
		underClass: 'bubble-under',
		aboveClass: 'bubble-above',
		rightClass: 'bubble-right',
		leftClass: 'bubble-left',
		hiddenClass: 'hidden',
		// bubble floats near the element itself, but you can rewrite it to anything else
		element: false,
	},
	$win = $(window);

// returns value itself or function call result if value is a function
function value(what, params) {
	if (typeof what === 'function') return what.apply(null, params);
	return what;
}

function plugin(options) {
	options = $.extend({}, defaults, options);
	return this.each(function(i, el) {
		el = $(el);
		var bubble,
			mouseOnBubble = false,
			mouseOnEl = false,
		// for inputs and labels
			input = false,
		// rewritten element or default one to use in bubble positioning
			bubbleObject = value(options.element, [el]) || el,
			container = value(options.container, [el]);

		// create bubble
		function initBubble() {
			bubble = options.generator(el, value(options.contentGetter, [el, bubbleObject]), options.bubbleClass)
				.addClass(options.hiddenClass)
				.hover(
					function() { mouseOnBubble = true; showBubble(); },
					function() { mouseOnBubble = false; hideBubble(); }
				).appendTo(container);
		}

		function showBubble() {
			if (!bubble) initBubble();
			setTimeout(function() {
				bubble.removeClass(options.hiddenClass);
				setPosition();
			});
		}

		function hideBubble() {
			if (!mouseOnBubble && !mouseOnEl)
				if (options.destroy) {
					bubble.remove();
					bubble = null;
				}
				else bubble.addClass(options.hiddenClass);
		}

		function setPosition() {
			var elPos = bubbleObject[0].getBoundingClientRect(),
				bubblePos = bubble[0].getBoundingClientRect(),
				height,
				width,
				wWidth = $win.width(),
				css = { },
				overflow = {
					top: false,
					right: false,
					left: false
				};
			// remove all special classes
			bubble.removeClass([
				options.verticalClass, options.aboveClass,
				options.rightClass, options.underClass, options.leftClass
			].join(' '));

			// compute overflows
			if (elPos.top - bubblePos.height <= 0) overflow.top = true;
			if (elPos.right + (bubblePos.width - elPos.width) / 2 > wWidth) overflow.right = true;
			if (elPos.left - (bubblePos.width - elPos.width) / 2 < 0) overflow.left = true;

			// set coordinates according to overflows
			if (overflow.right && overflow.top || overflow.right) {
				bubble.addClass(options.leftClass);
				bubble.addClass(options.verticalClass);
				css.top = elPos.top + elPos.height / 2 - bubblePos.height / 2;
				css.left = elPos.left - bubblePos.width;
			}
			else if (overflow.left && overflow.top || overflow.left) {
				bubble.addClass(options.rightClass);
				bubble.addClass(options.verticalClass);
				css.top = elPos.top + elPos.height / 2 - bubblePos.height / 2;
				css.left = elPos.left + elPos.width;
			}
			else if (overflow.top) {
					bubble.addClass(options.underClass);
					css.top = elPos.top + elPos.height;
					css.left = elPos.left + elPos.width / 2 - bubblePos.width / 2;
				}
				else {
					bubble.addClass(options.aboveClass);
					css.top = elPos.top - bubblePos.height;
					css.left = elPos.left + elPos.width / 2 - bubblePos.width / 2;
				}

			bubble.css(css);
		}

		// show on focus for labels wrapping inputs
		if (el.is('label') || el.is('input') || el.is('textarea') || el.is('select')) {
			if (input === false) {
				if (el.is('label')) {
					var labelFor = el.attr('for');
					input = el.find(labelFor ? ('#' + labelFor) : 'input, textarea, select');
				}
				else input = el;
			}
			input
				.focus(function() { mouseOnEl = true; showBubble(); })
				.blur(function() { mouseOnEl = false; hideBubble(); });
		}
		// show on hover for other elements
		else {
			el.hover(
				function() { mouseOnEl = true; showBubble(); },
				function() { mouseOnEl = false; hideBubble(); }
			);
		}

		$win.scroll(function() {
			if (!bubble) return;
			if (bubble.hasClass(options.hiddenClass)) return;
			setPosition();
			hideBubble();
		});
	});
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;