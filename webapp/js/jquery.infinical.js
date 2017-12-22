;(function($) {

	var defaultOptions = {
		scrollSpeed: 3500,
		maxHeight: 500,
		contextPath: "",
		memberCondition: "",
		disableMemberMove: false,
		blockMessage: "読み込み中...",
		afterParseCallback: null
	};

	var dragScroll;

	var dateHeaderIDPrefix = "#infinical_dh_";

	var currentJSON;

	var startDate;

	var currentScrollTop;

	var currentScrollLeft;

	var scrollLeftMax = Number.MAX_VALUE;

	var currentMonth;

	var contextPath = "";

	var memberCondition = "";

	var terminateWokingNow;

	var terminalCallback;

	var scrotableXPart;

	var scrotableYPart;

	var scrotableBodyPart;

	var infinicalAreas;

	var dateArea;

	var scrotableXY;

	var infinicalYearArea;

	var timestampArea;

	var infinicalFrame;

	var divFiller;

	var floatingMember;

	var destGuide;

	var disableMemberMove;

	var guideTargetMember;

	var isBeforeGuideTargetMember;

	var blockUIOptions = {
		fadeIn: null,
		css: {
			padding: "15px",
			width: "auto",
			left: "45%"
		},
		overlayCSS: {
			//Chromeでは、waitカーソルが戻らないので、waitは使わない
			cursor: null,
			opacity: 0
		}
	};

	var maxHeight;

	var afterParseCallback;

	var decodeURIForJavaEncode = function(javaEncoded) {
		return decodeURIComponent(javaEncoded).replace(/\++/g, ' ');
	};

	var prepareJSON = function(json) {
		json.dateHeader = decodeURIForJavaEncode(json.dateHeader);
		json.memberHeader = decodeURIForJavaEncode(json.memberHeader);
		json.body = decodeURIForJavaEncode(json.body);
		currentJSON = json;
	};

	var formatDate = function(dateInstance) {
		var month = dateInstance.getMonth() + 1;
		var date = dateInstance.getDate();
		if (month < 10) month = "0" + month;
		if (date < 10) date = "0" + date;
		return new String(dateInstance.getFullYear()).concat(month).concat(date);
	};

	var getCSSValue = function(target, tagName) {
		$(target).css(tagName).match(/^(\d+)/);
		return parseInt(RegExp.$1);
	}

	//ブラウザ間で数ドットの差異あり
	var scrollInfinicalInternal = function(scrollPane, target) {
		scrollPane.scrollLeft(target.parent().position().left - scrotableXPart.position().left);
	};

	//ブラウザ間で数ドットの差異あり
	var scrollInfinicalRight = function(scrollPane, target) {
		scrollPane.scrollLeft(
			target.parent().position().left
				+ target.parent().innerWidth()
				- scrotableXPart.position().left
				- scrotableXPart.innerWidth());
	};

	var updateScrollLeftMax = function() {
		scrollLeftMax = $('#scrotableBodyPart > .infinical').innerWidth() - scrotableBodyPart.innerWidth() + 1;
	};

	var getCurrentDateHeader = function(scrollPane) {
		var scroll = scrollPane.scrollLeft();
		var totalWidth = 1;
		var elements = $(".date_header");
		for (var i = 0; i < elements.length; i++) {
			totalWidth += $(elements[i]).parent().innerWidth() + 1;
			if (scroll < totalWidth) return $(elements[i]);
		}
	};

	var parseDateHeaderID = function(id) {
		var result = new Array();
		result[0] = id.substring(13, 17);
		result[1] = id.substring(17, 19);
		result[2] = id.substring(19, 21);
		return result;
	};

	var convertCurrentMonth = function() {
		var year = currentMonth.substring(0, 4);
		var month = currentMonth.substring(4, 6);
		return new Date(year, month - 1, 1);
	};

	var getJSON = function(yearMonth) {
		var year = yearMonth.substring(0, 4);
		var month = yearMonth.substring(4, 6) - 1;

		currentScrollTop = scrotableBodyPart.scrollTop();

		$.ajax({
			type: "GET",
			url: contextPath
				+ "/infinical?year="
				+ year
				+ "&month="
				+ month
				+ (memberCondition ? memberCondition : ""),
			dataType: "script"
		});
	};

	var setEventHandlerToMembers;

	var setMemberMoveEventHandler = function() {
		var downNow = false;
		var intervalID;

		var mouseDownMember;

		var members;

		var lagTop;
		var lagLeft;

		setEventHandlerToMembers = function() {
			members = $("#scrotableYPart th.member");
			members.mousedown(function(event) {
				downNow = true;
	
				mouseDownMember = selectMember(event);

				mouseDownMember.addClass("infinicalMouseDownMember");

				var offset = mouseDownMember.parent().offset();
				lagTop = event.pageY - offset.top;
				lagLeft = event.pageX - offset.left;

				floatingMember.css({
					top: event.pageY - lagTop,
					left: event.pageX - lagLeft
				});

				scrotableYPart.css({cursor: "default"});

				floatingMember.html(mouseDownMember.html());

				floatingMember.find("div.divMember").css({
					width: mouseDownMember.width(),
					height: mouseDownMember.height()
				});

				floatingMember.show();

				return false;
			});
		}

		var scrollUpFunction = function() {
			scrotableBodyPart.scrollTop(scrotableBodyPart.scrollTop() - 20);
		};

		var scrollDownFunction = function() {
			scrotableBodyPart.scrollTop(scrotableBodyPart.scrollTop() + 20);
		};

		var selectCurrentMember = function(event) {
			for (var i = 0; i < members.length; i++) {
				var member = $(members[i]);
				var offset = member.offset();
				var top = offset.top;
				var left = offset.left;
				if (event.pageY >= top
					&& event.pageY <= top + member.outerHeight()
					&& event.pageX >= left
					&& event.pageX <= left + member.outerWidth()) return member;
			}
		};

		$(document).mousemove(function(event) {
			if (!downNow) return;

			floatingMember.css({
				top: event.pageY - lagTop,
				left: event.pageX - lagLeft
			});

			var member = selectCurrentMember(event);
			if (member) guideDest(member, member.outerHeight() / 2 > event.pageY - member.offset().top);

			var yPartTop = scrotableYPart.offset().top;
			var yPartBottom = yPartTop + scrotableYPart.height();

			if (intervalID != null) {
				clearInterval(intervalID);
				intervalID = null;
			}

			if (event.pageY < yPartTop) {
				intervalID = setInterval(scrollUpFunction, 200);
			} else if (event.pageY > yPartBottom) {
				intervalID = setInterval(scrollDownFunction, 200);
			}

			var yPartLeft = scrotableYPart.offset().left;
			var yPartRight = yPartLeft + scrotableYPart.width();

			if (event.pageX < yPartLeft
				|| event.pageX > yPartRight
				|| event.pageY < yPartTop
				|| event.pageY > yPartBottom) {
				destGuide.hide();
				guideTargetMember = null;
			}

			return false;
		}).mouseup(function(event) {
			destGuide.hide();
			guideTargetMember = null;

			if (!downNow) return;

			downNow = false;

			if (mouseDownMember) mouseDownMember.removeClass("infinicalMouseDownMember");

			if (intervalID != null) clearInterval(intervalID);

			scrotableYPart.css({cursor: "auto"});

			floatingMember.hide();
			floatingMember.html("");

			var member = selectCurrentMember(event);
			if (member) moveMember(
				$(mouseDownMember.children(".divMember")).attr("id"),
				$(member.children(".divMember")).attr("id"),
				member.outerHeight() / 2 > event.pageY - member.offset().top);

			mouseDownMember = null;

			return false;
		});
	};

	var parseJSON = function(json) {
		scrotableXPart.html(json.dateHeader);
		scrotableYPart.html(json.memberHeader);
		scrotableBodyPart.html(json.body);

		timestampArea.text("取得時刻: " + json.timestamp);

		currentMonth = json.current;

		var parent = $("#infinicalFrame").parent();
		var paddingLength = getCSSValue(infinicalFrame, "padding-left") + getCSSValue(infinicalFrame, "padding-right");

		scrotableInit();

		var width = parent.width() - scrotableYPart.width() - paddingLength - 2;
		scrotableXPart.width(width);
		scrotableBodyPart.width(width);

		divFiller.height(scrotableXPart.height() - 2);

		if (!disableMemberMove) setEventHandlerToMembers();

		var scrotableXYWidth = scrotableXY.width();
		infinicalAreas.width(scrotableXYWidth);
		infinicalFrame.width(scrotableXYWidth);

		if (currentScrollTop) scrotableBodyPart.scrollTop(currentScrollTop);

		updateScrollLeftMax();

		var height = scrotableYPart.find("table").outerHeight();
		height = height <= maxHeight ? height : maxHeight;
		scrotableYPart.height(height);
		scrotableBodyPart.height(height);

		if (afterParseCallback) afterParseCallback();
	};

	var selectMember = function(event) {
		var target = $(event.target);
		if (target.hasClass("member")) return target;
		var parent = target.parents(".member");
		return $(parent.get(0));
	};

	var startInfinicalInternal = function(myStartDate) {
		$.blockUI(blockUIOptions);

		startDate = myStartDate;

		currentScrollTop = scrotableBodyPart.scrollTop();

		$.ajax({
			type: "GET",
			url: contextPath
				+ "/infinicalInit?year="
				+ startDate.getFullYear()
				+ "&month="
				+ startDate.getMonth()
				+ (memberCondition ? memberCondition : ""),
			dataType: "script"
		});
	};

	var guideDest = function(member, isBefore) {
		guideTargetMember = member;
		isBeforeGuideTargetMember = isBefore;
		var yPartTop = scrotableYPart.position().top;
		var yPartBottom = yPartTop + scrotableYPart.height();

		var guidePosition = member.position().top + (isBefore ? -1 : member.height() + 10);

		var halfHeight = member.height() / 2;

		if (guidePosition < yPartTop - halfHeight || guidePosition > yPartBottom + halfHeight) return;

		destGuide.show();

		destGuide.css({
			width: member.parent().width(),
			left: member.position().left,
			top: guidePosition});

		if (guidePosition < yPartTop || guidePosition > yPartBottom) {
			destGuide.addClass("destGuideOpacity");
		} else {
			destGuide.removeClass("destGuideOpacity");
		}
	};

	var moveMember = function(thisMember, targetMember, isBefore) {
		destGuide.hide();
		guideTargetMember = null;

		if (thisMember == targetMember) return;

		$.blockUI(blockUIOptions);

		currentScrollTop = scrotableBodyPart.scrollTop();
		currentScrollLeft = scrotableBodyPart.scrollLeft();

		var date = convertCurrentMonth();

		$.ajax({
			type: "GET",
			url: contextPath
				+ "/infinicalMove?year="
				+ date.getFullYear()
				+ "&month="
				+ date.getMonth()
				+ "&thisMember="
				+ thisMember
				+ "&targetMember="
				+ targetMember
				+ "&isBefore="
				+ isBefore
				+ (memberCondition ? memberCondition : ""),
			dataType: "script"
		});
	};

	var scrollCallback = function(x, y) {
		if (terminateWokingNow) return;

		var target = scrotableBodyPart;

		//右端到達
		if (x >= scrollLeftMax) {
			$.blockUI(blockUIOptions);
			terminateWokingNow = true;
			dragScroll.suspend();

			var myWork = function() {
				parseJSON(currentJSON);
				dragScroll.free();
				scrotableXPart.scrollLeft(-1);
				target.scrollLeft(-1);
				scrollInfinicalRight(target, $(dateHeaderIDPrefix + currentJSON.current + "10"));

				dragScroll.resume();
				terminateWokingNow = false;
				$.unblockUI();
			};

			terminalCallback = myWork;
			getJSON(currentJSON.next);

			return;
		}

		//左端到達
		if (x == 0) {
			$.blockUI(blockUIOptions);
			terminateWokingNow = true;
			dragScroll.suspend();

			var myWork = function() {
				parseJSON(currentJSON);
				dragScroll.free();
				scrotableXPart.scrollLeft(-1);
				target.scrollLeft(-1);
				scrollInfinicalInternal(target, $(dateHeaderIDPrefix + currentJSON.current + "25"));

				dragScroll.resume();
				terminateWokingNow = false;
				$.unblockUI();
			};

			terminalCallback = myWork;
			getJSON(currentJSON.prev);
		}
	};

	var stopCallback = function(target) {
		var dataHeader = getCurrentDateHeader(target);
		if (!dataHeader) return;

		var date = parseDateHeaderID(dataHeader.attr("id"));

		infinicalYearArea.text(date[0] + "年");

		if (dateArea)
			dateArea.val(date[0] + "/" + new Number(date[1]) + "/" +  new Number(date[2]));
	};

	var infinical = {};

	$.infinical = infinical;

	infinical.start = function(startDate, options) {
		options = $.extend({}, defaultOptions, options || {});

		contextPath = options.contextPath;
		memberCondition = options.memberCondition;
		blockUIOptions.message = options.blockMessage;
		afterParseCallback = options.afterParseCallback;
		maxHeight = options.maxHeight;

		scrotableXPart = $("#scrotableXPart");
		scrotableYPart = $("#scrotableYPart");
		scrotableBodyPart = $("#scrotableBodyPart");

		scrotableBodyPart.mousedown(function(event) {
			scrotableBodyPart.addClass("dragging");
		}).mouseup(function() {
			scrotableBodyPart.removeClass("dragging");
		});

		dateArea = $("#infinicalDateArea");
		infinicalAreas = $(".infinicalArea");
		scrotableXY = $(".scrotableXY");
		infinicalYearArea = $("#infinicalYearArea");
		timestampArea = $("#infinicalTimestampArea");
		infinicalFrame = $("#infinicalFrame");
		divFiller = $("#scrotableXY_div_filler");

		dragScroll = scrotableBodyPart.dragScroll(options.scrollSpeed);

		dragScroll
			.registScrollCallback(scrollCallback)
			.registStopCallback(stopCallback)
			.start();

		{
			var newDiv = document.createElement("div");
			document.body.appendChild(newDiv);
			floatingMember = $(newDiv);
			floatingMember.hide();
			floatingMember.attr("id", "floatingMember");
			floatingMember.addClass("dragging");
			floatingMember.css({position: "absolute"});
		}

		{
			var newDiv = document.createElement("div");
			infinicalFrame.append(newDiv);
			destGuide = $(newDiv);
			destGuide.hide();
			destGuide.attr("id", "destGuide");
			destGuide.css({position: "absolute"});
		}

		if (dateArea) {
			dateArea.change(function(event) {
				var date = $(event.target).val();
				date.match(/^(\d+)\/(\d+)\/(\d+)$/);
				infinical.jump(new Date(RegExp.$1, RegExp.$2 - 1, RegExp.$3));
			});
		}

		disableMemberMove = options.disableMemberMove;

		if (!disableMemberMove) setMemberMoveEventHandler();

		disableScrotableInitOnload();

		currentScrollLeft = null;
		startInfinicalInternal(startDate);
	};

	infinical.jump = function(jumpDate) {
		var year = jumpDate.getFullYear();
		var month = jumpDate.getMonth() + 1;
		month = month < 10 ? "0" + month : month;
		var yearMonth = new String(year).concat(month);
		if (currentMonth == yearMonth) {
			scrotableXPart.scrollLeft(-1);
			scrotableBodyPart.scrollLeft(-1);
			infinical.scroll(jumpDate);
			stopCallback(scrotableBodyPart);
			return;
		}

		currentScrollLeft = null;
		startInfinicalInternal(jumpDate);
	};

	infinical.slide = function(days) {
		var dataHeader = getCurrentDateHeader(scrotableBodyPart);
		if (!dataHeader) return;
		var date = parseDateHeaderID(dataHeader.attr("id"));
		var targetMillis = new Date(date[0], date[1] - 1, date[2]).getTime() + days * 24 * 60 * 60 * 1000;
		var target = new Date();
		target.setTime(targetMillis);
		infinical.jump(target);
	};

	infinical.reflesh = function() {
		currentScrollLeft = scrotableBodyPart.scrollLeft();
		startInfinicalInternal(convertCurrentMonth());
	};

	infinical.scroll = function(date) {
		currentScrollLeft = null;
		scrollInfinicalInternal(scrotableBodyPart, $(dateHeaderIDPrefix + formatDate(date)));
	};

	infinical.initialize = function(json) {
		prepareJSON(json);
		parseJSON(json);

		scrotableXPart.scrollLeft(-1);
		scrotableBodyPart.scrollLeft(-1);

		if (currentScrollLeft) {
			scrotableBodyPart.scrollLeft(currentScrollLeft);
		} else {
			scrollInfinicalInternal(scrotableBodyPart, $(dateHeaderIDPrefix + formatDate(startDate)));
		}

		stopCallback(scrotableBodyPart);

		$.unblockUI();
	};

	infinical.execute = function(json) {
		prepareJSON(json);
		terminalCallback();
	};
})(jQuery);

function infinicalInit(json) {
	jQuery.infinical.initialize(json);
}

function infinical(json) {
	jQuery.infinical.execute(json);
}

function infinicalMove(json) {
	infinicalInit(json);
}
