/**
 * jQuery placeholder
 */

var $ = window.jQuery,
	pluginName = 'placeholder',
	defaults = {
		inputSelector: 'input, textarea, select',
		labelSelector: '.field-label',
		processedClass: 'js-processed'
	};

function plugin(options) {
	options = $.extend({}, defaults, options);

	this.each(function(i, el) {
		var label = $(el),
			input = label.find(options.inputSelector),
			ph = label.find(options.labelSelector);

		// set placeholder to input for touch devices and do nothing more
		if ('ontouchstart' in document.documentElement) {
			if (input.is('select')) input.find('option[value=""]').html(ph.text());
			else input.attr('placeholder', ph.text());
			ph.remove();
		}
		else {
			input.on('keydown change', function (e) {
				setTimeout(function () {
					if (input.val()) ph.hide();
					else ph.show();
				});
			});

			if (input.val()) ph.hide();
			label.addClass(options.processedClass);
		}
	});

	return this;
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;