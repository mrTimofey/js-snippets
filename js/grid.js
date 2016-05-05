'use strict';
/**
 * Creates toggleable grid on the page with pointer-events: none
 * @param colCount int column count
 * @param col int column width
 * @param gap int gap width
 */
export default function(colCount, col, gap) {
	var btn = document.createElement('div'),
		grid = document.createElement('div'),
		btnStyle =
			'position:fixed;' +
			'bottom:20px;' +
			'right:20px;' +
			'z-index:100;' +
			'cursor:pointer;' +
			'line-height:48px;' +
			'width:48px;' +
			'text-align:center;' +
			'font-size:20px;' +
			'background:white;' +
			'color:black;' +
			'border-radius:50%;',
		gridStyle =
			'position: fixed;' +
			'top: 0;' +
			'right: 0;' +
			'bottom: 0;' +
			'left: 0;' +
			'margin: 0 auto;' +
			'border-left: 1px solid #f00;' +
			'border-right: 1px solid #f00;' +
			'pointer-events: none;' +
			'-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=20)";' +
			'filter: alpha(opacity=20);' +
			'opacity: 0.2;' +
			'z-index: 100;',
		lineStyle =
			'position:absolute;' +
			'top:0;' +
			'bottom:0;' +
			'width:1px;' +
			'background:blue;',
		subLineLeftStyle =
			'position:absolute;' +
			'top:0;' +
			'bottom:0;' +
			'background:blue;',
		subLineRightStyle =
			'position:absolute;' +
			'top:0;' +
			'bottom:0;' +
			'background:cyan;';

	btn.setAttribute('style', btnStyle);
	grid.setAttribute('style', gridStyle);
	grid.style.width = colCount * col + (colCount + 1) * gap + 'px';
	btn.innerHTML = '#';

	document.body.appendChild(btn);
	document.body.appendChild(grid);
	for (let i = 0; i <= colCount; ++i) {
		let line = document.createElement('div');
		line.setAttribute('style', lineStyle);
		line.style.left = ((i + 1) * gap + i * col) + 'px';
		if (i === colCount) {
			line.style.background = 'transparent';
		}
		if (i > 0) {
			let subLineLeft = document.createElement('div');
			subLineLeft.setAttribute('style', subLineLeftStyle);
			subLineLeft.style.right = gap + 'px';
			subLineLeft.style.left = -gap + 'px';
			line.appendChild(subLineLeft)
		}
		if (i > 0 && i < colCount) {
			let subLineRight = document.createElement('div');
			subLineRight.setAttribute('style', subLineRightStyle);
			subLineRight.style.right = gap / 2 + 'px';
			subLineRight.style.left = -gap / 2 + 'px';
			line.appendChild(subLineRight)
		}
		grid.appendChild(line);
	}

	btn.addEventListener('click', function() {
		grid.style.display = grid.style.display === 'none' ? 'block' : 'none';
		window.localStorage.setItem('__grid__', grid.style.display);
	});

	let d = window.localStorage.getItem('__grid__');
	if (d) grid.style.display = d;
}