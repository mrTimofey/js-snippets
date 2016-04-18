/**
 * jQuery select based dropdown plugin
 */

var $ = window.jQuery,
	pluginName = 'fieldDropdown',
	defaults = {
		wrapper: function(cl, multipleCl, el) {
			var wrapper = $('<div></div>').addClass(cl);
			if (el.prop('multiple')) wrapper.addClass(multipleCl);
			return wrapper; },
		selection: function(cl, wrapper) {
			return $('<div></div>').addClass(cl).appendTo(wrapper); },
		optionList: function(cl, wrapper) {
			return $('<ul></ul>').addClass(cl).appendTo(wrapper); },
		optionGroup: function(cl) {
			return $('<li></li>').addClass(cl); },
		optionGroupLabel: function(cl, text) {
			return $('<span></span>').addClass(cl).html(text); },
		option: function(cl, emptyCl, text, value) {
			var option = $('<li></li>').addClass(cl).html(text);
			if (!value) option.addClass(emptyCl);
			return option; },
		input: function(wrapper, name) {
			return $('<input />').attr('type', 'hidden').attr('name', name).appendTo(wrapper); },
		format: function(titles, values) {
			var notEmpty = [];
			if (values.length > 1) {
				for (var i in values) if (values[i]) notEmpty.push(titles[i]);
			}
			else notEmpty = titles;
			return notEmpty.join(', ');
		},

		showClass: 'show',
		optionSelectedClass: 'selected',

		wrapperClass: 'dd-box',
		multipleClass: 'dd-multiple',
		selectionClass: 'dd-selection',
		optionListClass: 'dd-option-list',
		optionGroupClass: 'dd-option-group',
		optionGroupLabelClass: 'dd-option-group-label',
		optionEmptyClass: 'dd-novalue',
		optionClass: 'dd-option',
	},
	$doc = $(document),
	dropdowns = [];

// returns value itself or function call result if value is a function
function value(what, params) {
	if (typeof what === 'function') return what.apply(null, params);
	return what;
}

function closeAll() {
	for (var i in dropdowns) {
		dropdowns[i].close();
	}
	$doc.off('click', closeAll);
}

function Dropdown(el, options) {
	select = $(el);

	var wrapper = value(options.wrapper, [options.wrapperClass, options.multipleClass, select]),
		selection = value(options.selection, [options.selectionClass, wrapper, select]),
		optionList = value(options.optionList, [options.optionListClass, wrapper, select]),
		multiple = select.prop('multiple'),
		selectedOpts = $(),
		opts = $(),
		inputs = $(),
		name = select.attr('name');

	(function() {
		var groups = select.children('optgroup');

		function createOption(i, el, list) {
			el = $(el);
			var val = el.val(),
				opt = options.option(options.optionClass, options.optionEmptyClass, el.html(), val, i, select)
					.data('value', val);
			list.append(opt);
			opts.push(opt[0]);
			if (el.prop('selected')) selectedOpts.push(opt[0]);
		}

		if (groups.length) {
			groups.each(function(i, el) {
				el = $(el);
				var group = options.optionGroup(options.optionGroupClass, select),
					list = options.optionList(options.optionListClass, select);
				group.append(options.optionGroupLabel(options.optionGroupLabelClass, el.attr('label'), select));
				group.append(list);
				optionList.append(group);
				el.find('option').each(function(i, el) {
					createOption(i, el, list);
				});
			});
		}

		select.children('option').each(function(i, el) {
			createOption(i, el, optionList);
		});
	})();

	opts.click(function(e) {
		e.preventDefault();
		if (multiple) e.stopPropagation();
		var $this = $(this),
			values = [],
			titles = [];

		if (multiple) {
			$this.toggleClass(options.optionSelectedClass);
			selectedOpts = opts.filter('.' + options.optionSelectedClass);
			selectedOpts.each(function(i, el) {
				el = $(el);
				values.push(el.data('value'));
				titles.push(el.html());
			});
		}
		else {
			opts.removeClass(options.optionSelectedClass);
			$this.addClass(options.optionSelectedClass);
			values.push($this.data('value'));
			titles.push($this.html());
		}

		selection.html(options.format(titles, values));
		inputs.each(function() { $(this).remove(); });
		inputs = $();
		for (var i in values) {
			if (values[i]) inputs.push(options.input(wrapper, name).val(values[i]).change());
		}

		if (multiple) {
			if (inputs.length > 0) selectedOpts.each(function(i, opt) {
				opt = $(opt);
				if (!opt.data('value')) {
					opt.removeClass(options.optionSelectedClass);
					return false;
				}
			});
			else opts.each(function(i, opt) {
				opt = $(opt);
				if (!opt.data('value')) {
					multiple = false;
					opt.click();
					multiple = true;
					return false;
				}
			});
		}

		if (!inputs.length) inputs.push(options.input(wrapper, name).val('').change());
	});

	selectedOpts.each(function(i, el) { $(el).click(); });

	wrapper.on('click', function(e) {
		if (wrapper.hasClass(options.showClass)) {
			$doc.off('click', closeAll);
			wrapper.removeClass(options.showClass);
		}
		else {
			closeAll();
			setTimeout(function() {
				e.stopPropagation();
				$doc.on('click', closeAll);
				wrapper.addClass(options.showClass);
			});
		}
	});

	select.replaceWith(wrapper.addClass(select.attr('class')));

	this.el = el;
	this.wrapper = wrapper;
	this.selection = selection;
	this.optionList = optionList;
	this.options = options;
	this.items = opts;
	return this;
}

Dropdown.prototype.close = function() {
	this.wrapper.removeClass(this.options.showClass);
}

function plugin(options) {
	options = $.extend({}, defaults, options);

	this.each(function(i, el) { dropdowns.push(new Dropdown(el, options)); });

	return this;
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;
$.fn[pluginName].closeAll = closeAll;