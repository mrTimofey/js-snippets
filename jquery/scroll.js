/**
 * jQuery native scrolling with custom stylable scroll-bar
 */

var $ = window.jQuery || require('jquery'),
	pluginName = 'scroll',
	defaults = {
		// create DOM element for scroll control (function or jQuery object)
		control: function(h) { return $('<div></div>').addClass('scroll-control' + (h ? ' horizontal' : '')); },
		// create DOM element for scroll bar (function or jQuery object)
		bar: function(h) { return $('<div></div>').addClass('scroll-bar'); },
		wrapperClass: 'scroll-content',
		scrollableClass: 'scroll-scrollable',
		hiddenClass: 'hidden'
	},
	sysScrollbarSize = 0;

// define system scrollbar width
(function() {
	var outer = document.createElement("div");
	outer.style.visibility = "hidden";
	outer.style.width = "100px";
	outer.style.msOverflowStyle = "scrollbar";
	document.body.appendChild(outer);
	var widthNoScroll = outer.offsetWidth;
	outer.style.overflow = "scroll";
	var inner = document.createElement("div");
	inner.style.width = "100%";
	outer.appendChild(inner);
	var widthWithScroll = inner.offsetWidth;
	outer.parentNode.removeChild(outer);
	sysScrollbarSize = widthNoScroll - widthWithScroll;
})();

var $doc = $(document),
	observerCSS = {
		zIndex: -1,
		position: 'absolute',
		top: 0,
		right: 0,
		height: '100%',
		width: '100%',
		pointerEvents: 'none',
		opacity: 0,
		border: 'none',
		padding: 0,
		margin: 0
	},
	scrollableCSS = {
		overflow: 'auto',
		marginRight: -sysScrollbarSize,
		marginBottom: -sysScrollbarSize,
		paddingRight: sysScrollbarSize,
		paddingBottom: sysScrollbarSize
	},
	contentCSS = {
		position: 'relative',
		overflow: 'hidden'
	};

function plugin(options) {
	options = $.extend({}, defaults, options);

	this.each(function(i, el) {
		el = $(el);
		if (el[0] === window) el = $(document.body);

		var control = typeof options.control === 'function' ? options.control() : options.control,
			bar = typeof options.bar === 'function' ? options.bar() : options.bar,
			hControl = typeof options.control === 'function' ? options.control(true) : options.control,
			hBar = typeof options.bar === 'function' ? options.bar(true) : options.bar,
			content = $('<div></div>').addClass(options.wrapperClass).css(contentCSS),
			scrollable = $('<div></div>').addClass(options.scrollableClass).css(scrollableCSS),
			// hack to observe element resize event (only window triggers it so create an iframe with that window)
			contentSizeObserver = $('<iframe />').css(observerCSS),
			containerSizeObserver = $('<iframe />').css(observerCSS),
			ch, sh, ctrlh, barh, cw, sw, ctrlw, barw, pos = { left: 0, top: 0},
			dragH, dragStartPos, dragStartMouse;

		// ch, sh, ctrlh, bar - content height, scrollable area height, scroll control, scroll bar; same for ...w
		// pos - current scroll position
		// dragH - horizontal dragging flag

		scrollable.append(content);
		content.append(contentSizeObserver).append(el.children());
		el.append(
			$('<div></div>').css('overflow', 'hidden')
				.append(containerSizeObserver)
				.append(scrollable)
		);

		// scrollbar
		el.append(control.append(bar));
		el.append(hControl.append(hBar));

		function adjustControl() {
			if (ch > sh) {
				control.removeClass(options.hiddenClass);
				ctrlh = control.height();
				barh = sh * ctrlh / ch;
				bar.css('height', barh);
				adjustBar();
			}
			else control.addClass(options.hiddenClass);

			if (cw > sw) {
				hControl.removeClass(options.hiddenClass);
				ctrlw = hControl.width();
				barw = sw * ctrlw / cw;
				hBar.css('width', barw);
				adjustBar(true);
			}
			else hControl.addClass(options.hiddenClass);
		}

		function adjustBar(h) {
			var _bar = (h ? hBar : bar),
				_pos = pos[(h ? 'left' : 'top')],
				cs = (h ? cw : ch),
				ss = (h ? sw : sh),
				ctrls = (h ? ctrlw : ctrlh),
				bars = (h ? barw : barh),
				prop = (h ? 'left' : 'top');
			if (_pos === 0) return _bar.css(prop, 0);
			_bar.css(prop, (ctrls - bars) * (_pos / (cs - ss)));
		}

		function contentSizeChanged() {
			cw = content.width(); ch = content.height();
			content.css({
				width: content.prop('scrollWidth'),
				height: content.prop('scrollHeight')
			})
			adjustControl();
		}

		function containerSizeChanged() {
			sw = el.width(); sh = el.height();
			scrollable.css({
				width: sw,
				height: sh,
			});
			content.css({
				minWidth: sw,
				minHeight: sh - sysScrollbarSize,
				width: content.prop('scrollWidth'),
				height: content.prop('scrollHeight')
			});
			adjustControl();
		}

		function startDrag(e, h) {
			dragH = !!h;
			dragStartPos = dragH ? pos.left : pos.top;
			dragStartMouse = dragH ? e.clientX : e.clientY;
			$doc.on('mouseup touchend', stopDrag);
			$doc.on('mousemove touchmove', dragging);
		}

		function dragging(e) {
			var d = (dragH ? e.clientX : e.clientY) - dragStartMouse,
				cs = (dragH ? cw : ch),
				ss = (dragH ? sw : sh),
				ctrls = (dragH ? ctrlw : ctrlh),
				bars = (dragH ? barw : barh);
			scrollable[dragH ? 'scrollLeft' : 'scrollTop']((d / (ctrls - bars)) * (cs - ss) + dragStartPos);
		}

		function stopDrag() {
			$doc.off('mousemove touchmove', dragging);
			$doc.off('mouseup touchend', stopDrag);
		}

		function jump(e, h) {
			e.preventDefault();
			var pos;
			if (h) {
				pos = e.clientX - hControl.offset().left - barw / 2;
				if (pos <= 0) return scrollable.scrollLeft(0);
				scrollable.scrollLeft(pos * (cw - sw) / (ctrlw - barw));
			}
			else {
				pos = e.clientY - control.offset().top - barh / 2;
				if (pos <= 0) return scrollable.scrollTop(0);
				scrollable.scrollTop(pos * (ch - sh) / (ctrlh - barh));
			}
		}

		contentSizeObserver[0].contentWindow.addEventListener('resize', contentSizeChanged);
		containerSizeObserver[0].contentWindow.addEventListener('resize', containerSizeChanged);

		scrollable.on('scroll', function(e) {
			var top = scrollable.scrollTop(),
				left = scrollable.scrollLeft();
			if (top != pos.top) {
				pos.top = top;
				adjustBar();
			}

			if (left != pos.left) {
				pos.left = left;
				adjustBar(true);
			}
		});

		bar.on('mousedown touchstart', function(e) { e.preventDefault(); startDrag(e); });
		hBar.on('mousedown touchstart', function(e) { e.preventDefault(); startDrag(e, true); });
		bar.on('click', function(e) {e.preventDefault(); e.stopPropagation(); });
		hBar.on('click', function(e) {e.preventDefault(); e.stopPropagation(); });

		control.on('click', function(e) { e.preventDefault(); jump(e); });
		hControl.on('click', function(e) { e.preventDefault(); jump(e, true); });

		containerSizeChanged();
		contentSizeChanged();
	});
}

$.fn[pluginName] = plugin;
$.fn[pluginName].defaults = defaults;