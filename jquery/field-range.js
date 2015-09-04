/**
 * jQuery field with with stylable range slider
 */

var $ = window.jQuery || require('jquery'),
	pluginName = 'fieldRange',
	defaults = {
		upgradeClass: 'field-range-upgraded',
		fixedClass: 'field-range-control-fixed',

		// selectors
		inputLeft: 'input:eq(0)',
		inputRight: 'input:eq(1)',

		// provide array of possible values if they are fixed
		values: false,
		// or provide step, max and min values
		step: function(el, inputs) {
			return el.data('step') || inputs[0].attr('step') || inputs[1].attr('step') || 1; },
		min: function(el, inputs) {
			return el.data('min') || inputs[0].attr('min') || inputs[1].attr('min') || 0; },
		max: function(el, inputs) {
			return el.data('max') || inputs[1].attr('max') || inputs[0].attr('max') || 100; },

		// value can be fixed (readonly or disabled)
		leftFixed: function(leftInput) { return leftInput.prop('readonly') || leftInput.prop('disabled'); },
		rightFixed: function(rightInput) { return rightInput.prop('readonly') || rightInput.prop('disabled'); },

		// DOM elements creating functions
		domSlider: function(el) { return $('<div></div>').addClass('field-range-slider'); },
		domControls: function(el) { return [
			$('<div></div>').addClass('field-range-control field-range-control-left'),
			$('<div></div>').addClass('field-range-control field-range-control-right')];},
		domBetween: function(el) { return $('<div></div>').addClass('field-range-between'); }
	},
	$doc = $(document);

// returns value itself or function call result if value is a function
function value(what, params) {
	if (typeof what === 'function') return what.apply(null, params);
	return what;
}

function plugin(options) {
	options = $.extend({}, defaults, options);

	this.each(function(i, el) {
		el = $(el);

		var inputs = [el.find(options.inputLeft), el.find(options.inputRight)],
			container = value(options.domSlider, [el]),
			controls = value(options.domControls, [el]),
			between = value(options.domBetween, [el]),
			step = parseFloat(value(options.step, [el, inputs])),
			min = parseFloat(value(options.min, [el, inputs])),
			max = parseFloat(value(options.max, [el, inputs])),
			fixed = [value(options.leftFixed, [inputs[0]]), value(options.rightFixed, [inputs[1]])],
			values = options.values,
			sliderWidth, stepWidth, lastChanged = -1;

		function updateWidth() {
			sliderWidth = container.width();
			stepWidth = step * sliderWidth / (max - min);
		}

		function getValue(i) { return parseFloat(inputs[i].val()); }

		function getX(e) { return e.pageX ||
			e.originalEvent.changedTouches && e.originalEvent.changedTouches[0].pageX || 0; }

		function adjustBetween() {
			var left = getValue(0),
				right = getValue(1);

			if (left > right)
				return lastChanged > 0 ? inputs[0].val(right).change() : inputs[1].val(left).change();

			between.css({
				left: controls[0].position().left,
				width: controls[1].position().left - controls[0].position().left
			});
		}

		function inputChanged(i) {
			var input = inputs[i],
				control = controls[i];
			return function(e) {
				var val = getValue(i);
				if (!isFinite(val)) return;

				if (val >= max) control.css('left', sliderWidth);
				else if (val <= min) control.css('left', 0);
				else control.css('left', ((val - min) / (max - min)) * sliderWidth);
				lastChanged = i;

				adjustBetween();
			}
		}

		function startDrag(i) {
			var input = inputs[i],
				control = controls[i],
				fix = fixed[i];

			return function(e) {
				e.preventDefault();
				if (fix) return;
				function moving(e) {
					e.preventDefault();
					var dirty = getX(e) - container.offset().left;

					if ((dirty - stepWidth / 2) < 0) return input.val(min).change();
					if ((dirty + stepWidth / 2) > sliderWidth) return input.val(max).change();
					input.val(Math.round(dirty / stepWidth) * step + min).change()
				}

				function stop(e) {
					e.preventDefault();
					$doc.off('mousemove touchmove', moving);
					$doc.off('mouseup touchend', stop);
				}

				$doc.on('mousemove touchmove', moving);
				$doc.on('mouseup touchend', stop);
			}
		}

		el
			.append(
				container
					.append(controls[0])
					.append(between)
					.append(controls[1])
		);

		if (fixed[0]) controls[0].addClass(options.fixedClass);
		if (fixed[1]) controls[1].addClass(options.fixedClass);
		if (!inputs[0].val()) inputs[0].val(min);
		if (!inputs[1].val()) inputs[1].val(max);

		updateWidth();

		inputs[1].on('change keyup', inputChanged(1)).change();
		inputs[0].on('change keyup', inputChanged(0)).change();

		controls[1].on('mousedown touchstart', startDrag(1));
		controls[0].on('mousedown touchstart', startDrag(0));

		el.addClass(options.upgradeClass);
	});

	return this;
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;