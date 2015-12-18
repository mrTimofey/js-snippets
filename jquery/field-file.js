/**
 * jQuery file field plugin.
 * Adds an element with file name and controls filled condition.
 */

var $ = window.jQuery,
	pluginName = 'fieldFile',
	defaults = {
		input: function(el) { return el.find('input'); },
		// file name element
		display: function(cl, el) { return $('<span></span>').addClass(cl).appendTo(el); },
		// by default file clears just on element click
		clearButton: function(el) { return el; },
		filledClass: 'filled',
		displayClass: 'file-name',
		processedClass: 'js-processed'
	};

// returns value itself or function call result if value is a function
function value(what, params) {
	if (typeof what === 'function') return what.apply(null, params);
	return what;
}

function plugin(options) {
	options = $.extend({}, defaults, options);

	this.each(function(i, el) {
		el = $(el);
		var input = value(options.input, [el]),
			display = value(options.display, [options.displayClass, el]),
			clearButton = value(options.clearButton, [el]);

		function onChange() {
			var val = input.val();
			if (val) {
				val = val.split(/(\\|\/)/g).pop();
				display.html(val);
				el.addClass(options.filledClass);
			}
			else {
				display.html('');
				el.removeClass(options.filledClass);
			}
		}

		input.change(onChange);

		clearButton.click(function(e) {
			if (input.val()) {
				e.stopPropagation();
				e.preventDefault();
				input.replaceWith(input = input.clone(true));
				input.change(onChange);
				onChange();
			}
		});

		onChange();
	});

	return this;
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;