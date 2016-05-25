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
		optionList: function(cl, wrapper, isGroup, selectOrOptgroup) {
			return $('<ul></ul>').addClass(cl).appendTo(wrapper); },
		optionGroup: function(cl, select) {
			return $('<li></li>').addClass(cl); },
		optionGroupLabel: function(cl, text) {
			return $('<span></span>').addClass(cl).html(text); },
		option: function(cl, emptyCl, text, value) {
			var option = $('<li></li>').addClass(cl).html(text);
			if (!value) option.addClass(emptyCl);
			return option; },
		format: function(titles, values, options) {
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

function Dropdown(el, settings) {
	var select = $(el),
	// dropdown wrapper element
		wrapper = value(settings.wrapper, [settings.wrapperClass, settings.multipleClass, select]),
	// dropdown selected value(s) element
		selection = value(settings.selection, [settings.selectionClass, wrapper, select]),
	// ropdown options list element
		optionList = value(settings.optionList, [settings.optionListClass, wrapper, false, select]),
		multiple = select.prop('multiple'),
		options = [];

	function updateSelection() {
		var values = [],
			titles = [],
			selectedOptions = [];

		for (var i = 0; i < options.length; ++i) {
			if (options[i]._option.selected) {
				$(options[i]).addClass(settings.optionSelectedClass);
				selectedOptions.push(options[i]);
				titles.push(options[i]._option.innerHTML);
				values.push(options[i]._option.value);
			}
			else $(options[i]).removeClass(settings.optionSelectedClass);
		}

		selection.html(settings.format(titles, values, selectedOptions));
	}

	function onOptionClick(e) {
		e.preventDefault();

		// do not close dropdown menu if multiple
		if (multiple) e.stopPropagation();

		var $this = $(this);

		if (multiple && this._option.selected) {
			this._option.selected = false;
		}
		else {
			this._option.selected = true;
		}

		updateSelection();
		console.log(select.parents('form').serializeArray()[0]);
	}

	(function() {
		var groups = select.children('optgroup');

		function createOption(i, option, list) {
			var opt = settings.option(settings.optionClass, settings.optionEmptyClass, option.innerHTML, option.value, i, select);
			option._ddOption = opt;
			opt[0]._option = option;
			list.append(opt);
			opt.click(onOptionClick);
			options.push(opt[0]);
		}

		if (groups.length) {
			groups.each(function(i, el) {
				el = $(el);
				var group = settings.optionGroup(settings.optionGroupClass, select),
					list = value(settings.optionList, [settings.optionListClass, wrapper, true, el]);
				group.append(settings.optionGroupLabel(settings.optionGroupLabelClass, el.attr('label'), select));
				group.append(list);
				optionList.append(group);
				el.children('option').each(function(i, el) {
					createOption(i, el, list);
				});
			});
		}

		select.children('option').each(function(i, el) {
			createOption(i, el, optionList);
		});
	})();

	updateSelection();

	wrapper.on('click', function(e) {
		if (wrapper.hasClass(settings.showClass)) {
			$doc.off('click', closeAll);
			wrapper.removeClass(settings.showClass);
		}
		else {
			closeAll();
			setTimeout(function() {
				e.stopPropagation();
				$doc.on('click', closeAll);
				wrapper.addClass(settings.showClass);
			});
		}
	});

	wrapper.addClass(select.attr('class')).insertAfter(select);
	select.css('display', 'none');
	wrapper.append(select);

	this.select = el;
	this.wrapper = wrapper;
	this.selection = selection;
	this.optionList = optionList;
	this.settings = settings;
	this.items = options;
	return this;
}

Dropdown.prototype.close = function() {
	this.wrapper.removeClass(this.settings.showClass);
}

function plugin(options) {
	options = $.extend({}, defaults, options);
	return this.each(function(i, el) { dropdowns.push(new Dropdown(el, options)); });
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;
$.fn[pluginName].closeAll = closeAll;