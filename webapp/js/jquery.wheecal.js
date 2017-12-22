;(function($) {

	var wheecal = {};

	$.wheecal = wheecal;

	var delimiter = "<div class=\"wheecalItem wheecalDelimiter\">/</div>";

	var weekDays = ["日", "月", "火", "水", "木", "金", "土"];

	var SUNDAY = 0;
	var MONDAY = 1;
	var SATURDAY = 6;
	var JANUARY = 0;
	var FEBRUARY = 1;
	var MARCH = 2;
	var APRIL = 3;
	var MAY = 4;
	var JULY = 6;
	var AUGUST = 7;
	var SEPTEMBER = 8;
	var OCTOBER = 9;
	var NOVEMBER = 10;
	var DECEMBER = 11;

	var html =
		"<div class=\"wheecalUnit\">" +
		"<input type=\"text\" class=\"wheecalItem wheecalElement wheecalYear\" value=\"DEFAULT_YEAR\" TABINDEX_YEAR/>" + delimiter +
		"<input type=\"text\" class=\"wheecalItem wheecalElement wheecalMonth\" value=\"DEFAULT_MONTH\" TABINDEX_MONTH/>" + delimiter +
		"<input type=\"text\" class=\"wheecalItem wheecalElement wheecalDate\" value=\"DEFAULT_DATE\" TABINDEX_DATE/>" +
		"<div class=\"wheecalItem wheecalWeekday\"></div>" +
		"<button title=\"元の日付に戻す\" class=\"wheecalItem wheecalReset\" onclick=\"jQuery.wheecal.reset[INDEX]();" +
		"return false;\" TABINDEX_RESET>reset</button>" +
		"<button title=\"今日をセット\" class=\"wheecalItem wheecalToday\" onclick=\"jQuery.wheecal.today[INDEX]();" +
		"return false;\" TABINDEX_TODAY>today</button>" +
		"<div class=\"wheecalItem wheecalHolidayName\"></div>" +
		"</div>";

	var closeup, closeupNumber;

	$(document).ready(function() {
		$("body").append(
			"<div id=\"wheecalCloseup\" class=\"wheecalItem\">" +
			"<div id=\"wheecalCloseupNumber\"></div>" +
			"<div id=\"wheecalCloseupDescription\">ホイールで変更</div>" +
			"</div>");
		closeup = $("#wheecalCloseup");
		closeupNumber = $("#wheecalCloseupNumber");
		closeup.hide();

		wheecal.today = [];
		wheecal.reset = [];

		//リセットボタン押下時
		$(":reset").click(function() {
			$(wheecal.reset).each(function() {
				this();
			});
		});
	});

	var index = 0;

	var output;

	var holidayServletPath;

	wheecal.setHolidayServletPath = function(path) {
		holidayServletPath = path;
	};

	/*
	 * options
	 * defaultValue
	 * tabindexOfYear
	 * skipTabindexOfButtons
	 * hideCloseup
	 * */
	$.fn.wheecal = function(output, options) {
		var myDate = new Date();

		options = options ? options : {};

		var defaultValue = options.defaultValue;
		if (output && !defaultValue)
			defaultValue = output.val();

		var defaultYear, defaultMonth, defaultDate;
		if (defaultValue) {
			var values = defaultValue.split(/\//);
			defaultYear = values[0];
			defaultMonth = values[1];
			defaultDate = values[2];
		}

		var tabindexYear = "";
		var tabindexMonth = "";
		var tabindexDate = "";
		var tabindexReset = "";
		var tabindexToday = "";
		if (typeof options.tabindexOfYear == "number") {
			tabindexYear = " tabindex=\"" + options.tabindexOfYear + "\"";
			tabindexMonth = " tabindex=\"" + (options.tabindexOfYear + 1) + "\"";
			tabindexDate = " tabindex=\"" + (options.tabindexOfYear + 2) + "\"";
			tabindexReset = " tabindex=\"" + (options.tabindexOfYear + 3) + "\"";
			tabindexToday = " tabindex=\"" + (options.tabindexOfYear + 4) + "\"";
		}

		if (options.skipTabindexOfButtons) {
			tabindexReset = " tabindex=\"-1\"";
			tabindexToday = " tabindex=\"-1\"";
		}

		var care = function(target) {
			if (target) return target;
			return "";
		};

		$(this).html(html
			.replace(/DEFAULT_YEAR/, care(defaultYear))
			.replace(/DEFAULT_MONTH/, care(defaultMonth))
			.replace(/DEFAULT_DATE/, care(defaultDate))
			.replace(/TABINDEX_YEAR/, tabindexYear)
			.replace(/TABINDEX_MONTH/, tabindexMonth)
			.replace(/TABINDEX_DATE/, tabindexDate)
			.replace(/TABINDEX_RESET/, tabindexReset)
			.replace(/TABINDEX_TODAY/, tabindexToday)
			.replace(/INDEX/g, index));

		var year = $($(this).find(".wheecalYear")[0]);
		var month = $($(this).find(".wheecalMonth")[0]);
		var date = $($(this).find(".wheecalDate")[0]);

		var weekday = $($(this).find(".wheecalWeekday")[0]);

		var holidayName = $($(this).find(".wheecalHolidayName")[0]);

		var hoverFunction = function(event) {
			if (options.showCloseup)
				closeup.show();

			var target = $(event.target);

			target.focus();

			var top = event.pageY + 10;
			var targetTop = target.offset().top;
			var targetBottom = targetTop + target.outerHeight();

			top = top < targetBottom ? targetBottom : top;

			var windowHeight = $(window).height();
			var closeupHeight = closeup.outerHeight();

			top = top + closeupHeight > windowHeight ? targetTop - closeupHeight : top;

			var left = event.pageX - 50;

			left = left < 0 ? 0 : left;

			var windowWidth = $(window).width();
			var closeupWidth = closeup.outerWidth();

			left = left + closeupWidth > windowWidth ? windowWidth - closeupWidth : left; 

			closeup.css({top: top, left: left});
			closeupNumber.text($(this).val());
		};

		var mouseoutFunction = function() {
			closeup.hide();
		};

		var clickFunction = function() {
			$(this).select();
		};

		var setBlank = function() {
			year.val("");
			month.val("");
			date.val("");
			weekday.text("");
			weekday.removeClass("wheecalHoliday").removeClass("wheecalSaturday");
			closeupNumber.text("");
			holidayName.text("");

			if (output) $(output).val("");
		};

		var setOthers = function() {
			weekday.removeClass("wheecalHoliday").removeClass("wheecalSaturday");

			var day = myDate.getDay();
			weekday.text(weekDays[day]);

			if (day == SUNDAY) {
				weekday.addClass("wheecalHoliday");
			} else if (day == SATURDAY) {
				weekday.addClass("wheecalSaturday");
			}

			setHolidayName(myDate);

			if (output) $(output).val(
				myDate.getFullYear() + "/" + (myDate.getMonth() + 1) + "/" + myDate.getDate());
		};

		var setYear = function(value) {
			var current = myDate.getDate();

			myDate.setFullYear(value);

			if (current != myDate.getDate()) myDate.setDate(0);

			year.val(value);
			closeupNumber.text(value);

			month.val(myDate.getMonth() + 1);
			date.val(myDate.getDate());

			setOthers();
		};

		var incrementYear = function() {
			setYear(myDate.getFullYear() + 1);
		};

		var decrementYear = function() {
			setYear(myDate.getFullYear() - 1);
		};

		year.mousewheel(function(event, delta) {
			var value = myDate.getFullYear();

			//値が空の時、動かし始めで値を変化させないように
			if (year.val()) {
				if (delta > 0) {
					value--;
				} else if (delta < 0) {
					value++;
				}
			}

			setYear(value);

			return false;
		}).hover(hoverFunction).mouseout(mouseoutFunction).click(clickFunction).change(
			function() {
				var value = year.val();

				if (!value) {
					setBlank();
					return;
				}

				if (!value.match(/^\d+$/)) value = myDate.getFullYear();

				value = new Date().getFullYear().toString().substring(0, 4 - value.length) + value;

				setYear(value);
			}
		);

		var setMonth = function(value) {
			if (value > 11) {
				incrementYear();
				value = value % 12;
			}

			if (value < 0) {
				decrementYear();
				value = value + 12;
			}

			var current = myDate.getDate();

			myDate.setMonth(value);

			if (current != myDate.getDate()) myDate.setDate(0);

			var result = value + 1;

			month.val(result);
			closeupNumber.text(result);

			year.val(myDate.getFullYear());
			date.val(myDate.getDate());

			setOthers();
		}

		var incrementMonth = function() {
			setMonth(myDate.getMonth() + 1);
		};

		var decrementMonth = function() {
			setMonth(myDate.getMonth() - 1);
		};

		month.mousewheel(function(event, delta) {
			var value = myDate.getMonth();

			//値が空の時、動かし始めで値を変化させないように
			if (month.val()) {
				if (delta > 0) {
					value--;
				} else if (delta < 0) {
					value++;
				}
			}

			setMonth(value);

			return false;
		}).hover(hoverFunction).mouseout(mouseoutFunction).click(clickFunction).change(
			function() {
				var value = month.val();

				if (!value) {
					setBlank();
					return;
				}

				if (!value.match(/^\d+$/)) value = myDate.getMonth() + 1;

				setMonth(value - 1);
			}
		);

		var setDate = function(value) {
			var lastDay = getLastDayOfMonth(myDate);

			value = parseInt(value);

			if (value > lastDay) {
				incrementMonth();
				value = value % lastDay;
			}

			if (value < 1) {
				decrementMonth();
				var currentLastDay = getLastDayOfMonth(myDate);
				value = currentLastDay + value % currentLastDay;
			}

			myDate.setDate(value);

			date.val(value);
			closeupNumber.text(value);

			year.val(myDate.getFullYear());
			month.val(myDate.getMonth() + 1);

			setOthers();
		};

		date.mousewheel(function(event, delta) {
			var value = myDate.getDate();

			//値が空の時、動かし始めで値を変化させないように
			if (date.val()) {
				if (delta > 0) {
					value--;
				} else if (delta < 0) {
					value++;
				}
			}

			setDate(value);

			return false;
		}).hover(hoverFunction).mouseout(mouseoutFunction).click(clickFunction).change(
			function() {
				var value = date.val();

				if (!value) {
					setBlank();
					return;
				}

				if (!value.match(/^\d+$/)) value = myDate.getDate();

				setDate(value);
			}
		);

		wheecal.today[index] = function() {
			myDate = new Date();
			year.val(myDate.getFullYear());
			month.val(myDate.getMonth() + 1);
			date.val(myDate.getDate());
			setOthers();
		};

		var reset = function() {
			if (defaultYear && defaultMonth && defaultDate) {
				setYear(defaultYear);
				setMonth(defaultMonth - 1);
				setDate(defaultDate);
				setOthers();
			} else {
				myDate = new Date();
			}
		};

		var myIndex = index;

		var setHolidayName = function(date) {
			if (!holidayServletPath) return "";

			holidayName.text("loading...");
			$.ajax({
				type: "GET",
				url: holidayServletPath
					+ "?cb="
					+ "jQuery.wheecal.holiday" + myIndex
					+ "&year="
					+ date.getFullYear()
					+ "&month="
					+ date.getMonth()
					+ "&date="
					+ date.getDate(),
				dataType: "script"
			});
		};

		wheecal["holiday" + index] = function(value) {
			holidayName.text(value);
			if (value != "") {
				weekday.removeClass("wheecalSaturday").addClass("wheecalHoliday");
			}
		};

		wheecal.reset[index] = function() {
			setBlank();
			reset();
		};

		index++;

		reset();
	};

	var getLastDayOfMonth = function(date) {
		var calendar = new Date();
		calendar.setTime(date.getTime());
		calendar.setDate(1);
		calendar.setMonth(calendar.getMonth() + 1);
		calendar.setDate(0);
		return calendar.getDate();
	}
})(jQuery);
