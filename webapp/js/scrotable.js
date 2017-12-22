function scrotableOnscroll(body) {
	for (var i = 0; i < scrotables.length; i++) {
		if(scrotables[i].body == body) {
			var top = scrotables[i].top;
			var left = scrotables[i].left;
			if (top) top.scrollLeft = body.scrollLeft;
			if (left) left.scrollTop = body.scrollTop;
			break;
		}
	}
}

function scrotableInit() {
	var tables = document.getElementsByTagName("TABLE");
	var scrotableIndex = 0;
	for (var i = 0; i < tables.length; i++) {
		if (tables[i].className.match(/^scrotable[XY][XY]?/)) {
			var lastRow = tables[i].rows[tables[i].rows.length - 1];

			var instance = new Scrotable();

			var divBody = instance.search(lastRow.cells[lastRow.cells.length - 1], "DIV");
			var tableBody = instance.search(divBody, "TABLE");
			if (!tableBody) continue;

			instance.body = divBody;

			if (scrotables[scrotableIndex]) {
				//再度scrotableInitされた場合
				divBody.style.width = scrotables[scrotableIndex].initialDivBodyWidth;
			} else {
				instance.initialDivBodyWidth = divBody.style.width;
			}

			if (tables[i].className.match(/^scrotableXY?$/)) instance.adjustX(tables[i]);
			if (tables[i].className.match(/^scrotableX?Y$/)) instance.adjustY(tables[i]);

			scrotables[scrotableIndex] = instance;

			scrotableIndex++;
		}
	}
}

var scrotables = new Array();

function Scrotable() {
	this.body = null;
	this.top = null;
	this.left = null;
	this.initialDivBodyWidth = null;

	this.search = function(element, tag) {
		if (element == null) return null;
		if (element.childNodes == null) return null;
		for (var i = 0; i < element.childNodes.length; i++) {
			if (element.childNodes[i].nodeName == tag) return element.childNodes[i];
		}
		return null;
	};

	this.adjustX = function(element) {
		var divTop  = this.search(element.rows[0].cells[element.rows[0].cells.length - 1], "DIV");
		var tableTop  = this.search(divTop, "TABLE");

		if (!tableTop) return;

		var divBody = this.body;
		var tableBody = this.search(divBody, "TABLE");

		var bodyPadding = 2;
		if (tableBody.cellPadding) {
			bodyPadding = tableBody.cellPadding.replace(/px$/i, "") * 2;
		}

		var topPadding = 2;
		if (tableTop.cellPadding) {
			topPadding = tableTop.cellPadding.replace(/px$/i, "") * 2;
		}

		if (tableBody.rows[0]) {
			for (var i = 0; i < tableBody.rows[0].cells.length; i++) {
				var bodyCellWidth = tableBody.rows[0].cells[i].clientWidth - bodyPadding;
				var topCellWidth = tableTop.rows[0].cells[i].clientWidth - topPadding;
				var width = (bodyCellWidth < topCellWidth ? topCellWidth : bodyCellWidth) + "px";
				tableBody.rows[0].cells[i].style.width = width;
				tableTop.rows[0].cells[i].style.width = width;
			}
		}

		tableTop.style.width = divBody.clientWidth + "px";
		tableBody.style.width = divBody.clientWidth + "px";
		divTop.style.width = divBody.clientWidth + "px";

		tableTop.style.tableLayout = "fixed";
		tableBody.style.tableLayout = "fixed";

		//横スクロールなしの場合、スクロールバーを内側に表示するブラウザ(ie8)対策
		if (tableBody.offsetWidth == divBody.offsetWidth && tableBody.offsetWidth > divBody.clientWidth) {
			var scrollbarWidth = divBody.offsetWidth - divBody.clientWidth;
			divBody.style.width = (divBody.offsetWidth + scrollbarWidth) + "px";
		}

		this.top = divTop;
	};

	this.adjustY = function(element) {
		var divLeft  = this.search(element.rows[element.rows.length - 1].cells[0], "DIV");
		var tableLeft  = this.search(divLeft, "TABLE");

		if (!tableLeft) return;

		var divBody = this.body;
		var tableBody = this.search(divBody, "TABLE");

		for (i = 0; i < tableBody.rows.length; i++) {
			var bodyCellHeight = tableBody.rows[i].cells[0].offsetHeight;
			var leftCellHeight = tableLeft.rows[i].cells[0].offsetHeight;

			//FireFoxではbody側にleft側が合わせると、高さがずれてしまう
			//そのためleftを1px大きくする
			var height;
			if (bodyCellHeight >= leftCellHeight) {
				height = bodyCellHeight + 1 + "px";
			} else {
				height = leftCellHeight + "px";
			}

			tableLeft.rows[i].cells[0].style.height = height;
			tableBody.rows[i].cells[0].style.height = height;
		}

		divLeft.style.width = divLeft.offsetWidth + "px";
		divLeft.style.height = divBody.clientHeight + "px";

		tableLeft.style.tableLayout = "fixed";

		this.left = divLeft;
	};
}

var scrotableInitOnload = true;

function disableScrotableInitOnload() {
	scrotableInitOnload = false;
}

Event.observe(window, "load", function() {
	if (scrotableInitOnload) scrotableInit();
}, false);
