/**
 * jQuery select based dropdown plugin
 */

var $ = window.jQuery,
	pluginName = 'fieldDropdown',
	defaults = {
		wrapper: function(cl) {
			return $('<div></div>').addClass(cl); },
		selection: function(cl, wrapper) {
			return $('<div></div>').addClass(cl).appendTo(wrapper); },
		optionList: function(cl, wrapper) {
			return $('<ul></ul>').addClass(cl).appendTo(wrapper); },
		optionGroup: function(cl) {
			return $('<li></li>').addClass(cl); },
		optionGroupLabel: function(cl, text) {
			return $('<span></span>').addClass(cl).html(text); },
		option: function(cl, text, value) {
			return $('<li></li>').addClass(cl).html(text); },
		input: function(wrapper, el) {
			return $('<input />').attr('type', 'hidden').attr('name', el.attr('name')).appendTo(wrapper); },

		showClass: 'show',
		optionSelectedClass: 'selected',

		wrapperClass: 'dd-box',
		selectionClass: 'dd-selection',
		optionListClass: 'dd-option-list',
		optionGroupClass: 'dd-option-group',
		optionGroupLabelClass: 'dd-option-group-label',
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

	var wrapper = value(options.wrapper, [options.wrapperClass, select]),
		selection = value(options.selection, [options.selectionClass, wrapper, select]),
		optionList = value(options.optionList, [options.optionListClass, wrapper, select]),
		hiddenInput = value(options.input, [wrapper, select]),
		multiple = select.prop('multiple'),
		selectedOpt,
		opts = $();

	(function() {
		var groups = select.children('optgroup');

		function createOption(i, el, list) {
			el = $(el);
			var val = el.val(),
				opt = options.option(options.optionClass, el.html(), val, i, select).data('value', val);
			list.append(opt);
			opts.push(opt[0]);
			if (el.prop('selected')) selectedOpt = opt;
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
		var $this = $(this);
		opts.removeClass(options.optionSelectedClass);
		$this.addClass(options.optionSelectedClass);
		hiddenInput.val($this.data('value'));
		selection.html($this.html());
	});

	selectedOpt.click();
	wrapper.click(function(e) {
		if (wrapper.hasClass(options.showClass)) {
			$doc.off('click', closeAll);
			wrapper.removeClass(options.showClass);
		}
		else {
			closeAll();
			e.stopPropagation();
			$doc.on('click', closeAll);
			wrapper.addClass(options.showClass);
		}
	});

	select.replaceWith(wrapper.addClass(select.attr('class')));

	this.el = el;
	this.wrapper = wrapper;
	this.selection = selection;
	this.optionList = optionList;
	this.options = opts;
	this.input = hiddenInput;
	this.options = options;

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