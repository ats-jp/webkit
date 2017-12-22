;(function($) {

	var fwindow = {};

	$.fwindow = fwindow;

	var styleID = "floatingWindowStyle";

	var fw;

	var body;

	var closeCallback = null;

	var currentOpenTarget;

	var currentOpenHref;

	var getScrollbarWidth = function() {
		var scrollDiv = document.createElement("div");
		$(scrollDiv).css({
			width: "100px",
			height: "100px",
			overflow: "scroll",
			position: "absolute",
			top: "-9999px"});

		document.body.appendChild(scrollDiv);

		var width = $(scrollDiv).get(0).offsetWidth - $(scrollDiv).get(0).clientWidth;

		document.body.removeChild(scrollDiv);

		return width;
	}

	var getCSSValue = function(target, tagName) {
		$(target).css(tagName).match(/^(\d+)/);
		return parseInt(RegExp.$1);
	}

	var buildStyleTag = function(width, height) {
		return '<style id="' + styleID + '" type="text/css">#floatingWindowBody{width: ' + width + 'px; height: ' + height + 'px;} #floatingWindow{width: ' + (width + 22) + 'px; height: ' + (height + 60) + 'px;}</style>';
	}

	var windowMoveNow = false;

	var prepareWindowMoveFunction = function() {
		var lagX, lagY;

		var mousemoveFunction = function(event) {
			if (windowMoveNow) {
				fw.css({
					top: event.pageY - lagY,
					left: event.pageX - lagX
				});

				return false;
			}
		};

		var documentObject = $(document);

		documentObject.mousemove(mousemoveFunction);
		$("#floatingWindowOutfield")
			.mousedown(fwindow.close)
			.mousemove(mousemoveFunction);

		var floatingWindowHeader = $("#floatingWindowHeader");

		floatingWindowHeader.mousedown(function(event) {
			windowMoveNow = true;
			fw.addClass("floatingWindowDragging");
			var offset = floatingWindowHeader.parent().offset();
			lagX = event.pageX - offset.left + documentObject.scrollLeft();
			lagY = event.pageY - offset.top + documentObject.scrollTop();

			fw.css({
				top: event.pageY - lagY,
				left: event.pageX - lagX
			});

			//これがないとChoromeでカーソルがテキスト選択になってしまう
			return false;
		}).mouseup(function(event) {
			windowMoveNow = false;
			fw.removeClass("floatingWindowDragging");
			fw.css({
				top: event.pageY - lagY,
				left: event.pageX - lagX
			})
		});
	}

	var windowResizeNow = false;

	var windowResizeFunction;

	var prepareWindowResizeFunction = function() {
		var bodyWidthBase, bodyHeightBase, mouseDownX, mouseDownY;

		var bodyTag = $("body");
		windowResizeFunction = function(event) {
			if (windowResizeNow) {
				fw.hide();

				$("style#" + styleID).remove();

				var width = bodyWidthBase + event.pageX - mouseDownX;
				var height = bodyHeightBase + event.pageY - mouseDownY;

				bodyTag.before(buildStyleTag(width, height));

				fw.show();

				return false;
			}
		};

		var documentObject = $(document);

		documentObject.mousemove(windowResizeFunction);
		$("#floatingWindowOutfield").mousemove(windowResizeFunction);

		var floatingWindowCorner = $("#floatingWindowCorner");

		floatingWindowCorner.mousedown(function(event) {
			windowResizeNow = true;
			bodyWidthBase = getCSSValue(body, "width");
			bodyHeightBase = getCSSValue(body, "height");
			mouseDownX = event.pageX;
			mouseDownY = event.pageY;
			return false;
		}).mouseup(function(event) {
			windowResizeNow = false;
		});
	}

	$(document).ready(function() {
		$("body").append(
			"<div id=\"floatingWindowOutfield\"></div>" +
			"<div id=\"floatingWindow\">" +
			"<div id=\"floatingWindowHeader\" ondblclick=\"jQuery.fwindow.adjust(); return false;\" title=\"ダブルクリックでサイズ調整\">" +
			"<h1 id=\"floatingWindowTitle\"></h1>" +
			"<div id=\"floatingWindowAction\" class=\"link\">" +
			"<a href=\"javascript:void(0);\" onclick=\"jQuery.fwindow.close();\" title=\"閉じる\">[閉じる]</a>" +
			"</div>" +
			"</div>" +
			"<div id=\"floatingWindowBodyArea\"></div>" +
			"<div id=\"floatingWindowFooter\"><img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAIAAACQKrqGAAAABGdBTUEAALGPC/xhBQAAAE1JREFUKFON0cENACAIQ1Hdfw32YwTEk4jSwvml+QlTVUfznNIzs73YcSLCqe+54zQ6tBodak2uDHjdn1Yut1YutwJ3BWB3aMfxb8W3L+qr4tVDUmicAAAAAElFTkSuQmCC\" id=\"floatingWindowCorner\" /></div>" +
			"</div>");

		fw = $("#floatingWindow");

		//Chrome対策
		if ($.fn.mousewheel) {
			$("#floatingWindowOutfield, #floatingWindow").mousewheel(function(event) {
				return false;
			});
		}

		prepareWindowMoveFunction();
		prepareWindowResizeFunction();
	});

	$.fn.fwindow = function() {
		$(this).unbind("click", fwindow.open);
		$(this).click(fwindow.open);
	}

	var htmlOverflow;

	fwindow.open = function() {
		var href = $(this).attr("href");
		$(this).attr("href", "javascript:void(0);");

		$("#floatingWindowBodyArea").html("<iframe id=\"floatingWindowBody\" src=\"" + href + "\" frameborder=\"0\"></iframe>");
		body = $("#floatingWindowBody");

		var titleArea = $("#floatingWindowTitle");

		body.load(function() {
			if (!htmlOverflow)
				htmlOverflow = $(document).find("html").css("overflow");

			$(document).find("html").css("overflow", "hidden");

			var contents = body.contents();

			titleArea.html(contents.find("title").html());

			//ウインドウを一瞬一番下までよけて、カーソルをoutfield上にし、元の位置に戻す
			contents.mouseover(function(event) {
				if (windowMoveNow)
					fw.css({top: $(document).height()});

				windowResizeFunction(event);
			});

			$("#floatingWindowOutfield").show();
			fw.show();

			fwindow.adjust();

			fw.css({
				left: ($("#floatingWindowOutfield").width() - fw.width()) / 2,
				top: 80
			});
		});

		currentOpenTarget = $(this);
		currentOpenHref = href;
	};

	fwindow.adjust = function() {
		$("style#" + styleID).remove();

		var contentsMargin = 5;

		var contents = body.contents();
		contents.find("body").css({margin: contentsMargin + "px"});

		var width = contents.width() + contentsMargin;
		var height = contents.height() + contentsMargin;

		var windowWidth = $(window).width();
		var windowHeight = $(window).height();

		var scrollbarWidth = getScrollbarWidth();

		if (width >= windowWidth - 200) {
			width = windowWidth - 200;
			height += scrollbarWidth;
		}

		if (height >= windowHeight - 200) {
			height = windowHeight - 200;
			width += scrollbarWidth;
		}

		//画面が小さい場合、タイトルとボタンが重ならないように
		var minimum = $("#floatingWindowTitle").width() + $("#floatingWindowAction").width() + 50;
		if (width < minimum) width = minimum;

		//一度セットしたサイズを上書きできるように、styleタグでサイズ指定し
		//close時にタグごと削除する
		$("body").before(buildStyleTag(width, height));
	};

	fwindow.close = function() {
		if (closeCallback) closeCallback();

		$(document).find("html").css("overflow", htmlOverflow);

		fw.hide();

		$("style#" + styleID).remove();

		$("#floatingWindowOutfield").hide();

		currentOpenTarget.attr("href", currentOpenHref);
	};

	fwindow.registCloseCallback = function(callback) {
		closeCallback = callback;
	};
})(jQuery);
