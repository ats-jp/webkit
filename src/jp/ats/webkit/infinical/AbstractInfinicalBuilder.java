package jp.ats.webkit.infinical;

import static jp.ats.substrate.U.isAvailable;
import static jp.ats.substrate.util.CalendarUtilities.getHolidayName;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import jp.ats.substrate.U;

public abstract class AbstractInfinicalBuilder implements InfinicalBuilder {

	private final HttpServletRequest request;

	private int year;

	private int month;

	private DateHeader[] dateHeaders;

	private MemberHeader[] memberHeaders;

	private Body[][] bodies;

	protected AbstractInfinicalBuilder(HttpServletRequest request) {
		this.request = request;
	}

	@Override
	public void set(int year, int month) {
		this.year = year;
		this.month = month;
	}

	@Override
	public void build() {
		dateHeaders = buildDateHeaders();
		memberHeaders = buildMemberHeaders();
		bodies = buildBodies();
	}

	@Override
	public DateHeader[] getDateHeaders() {
		return dateHeaders.clone();
	}

	@Override
	public MemberHeader[] getMemberHeaders() {
		return memberHeaders.clone();
	}

	@Override
	public Body[][] getBodies() {
		return bodies;
	}

	@Override
	public int getYear() {
		return year;
	}

	@Override
	public int getMonth() {
		return month;
	}

	protected HttpServletRequest getRequest() {
		return request;
	}

	protected DateHeader[] buildDateHeaders() {
		List<DateHeader> list = buildDates(new DateBuilderCallback<DateHeader>() {

			@Override
			public DateHeader create(
				Calendar calendar,
				String defaultCellCalssName) {
				return createDateHeader(calendar, defaultCellCalssName);
			}
		});

		return list.toArray(new DateHeader[list.size()]);
	}

	protected <T> List<T> buildDates(DateBuilderCallback<T> callback) {
		Calendar calendar = Calendar.getInstance();
		Calendar end = (Calendar) calendar.clone();

		calendar.set(Calendar.YEAR, year);
		//31日の月で、次が31日ない月の場合のため、日付を1日にしておく
		calendar.set(Calendar.DATE, 1);
		calendar.set(Calendar.MONTH, month);
		calendar.add(Calendar.MONTH, -1);
		calendar.set(Calendar.DATE, 25);

		end.set(Calendar.YEAR, year);
		//31日の月で、次が31日ない月の場合のため、日付を1日にしておく
		end.set(Calendar.DATE, 1);
		end.set(Calendar.MONTH, month);
		end.add(Calendar.MONTH, 1);
		end.set(Calendar.DATE, 11);

		List<T> list = new LinkedList<>();
		while (calendar.before(end)) {
			String cellClassName;
			switch (calendar.get(Calendar.DAY_OF_WEEK)) {
			case Calendar.SUNDAY:
				cellClassName = "sunday";
				break;
			case Calendar.SATURDAY:
				cellClassName = "saturday";
				break;
			default:
				if (isAvailable(getHolidayName(calendar))) {
					cellClassName = "holiday";
				} else {
					cellClassName = "weekday";
				}
			}

			list.add(callback.create(calendar, cellClassName));

			calendar.add(Calendar.DATE, 1);
		}

		return list;
	}

	abstract protected MemberHeader[] buildMemberHeaders();

	abstract protected Body[][] buildBodies();

	private static DateHeader createDateHeader(
		Calendar calendar,
		String cellClassName) {
		Date date = calendar.getTime();
		String dateString = new SimpleDateFormat("M / d").format(date);
		String weekdayString = new SimpleDateFormat("EEE").format(date);
		String description = U.care(getHolidayName(calendar));
		String divisionID = createDateHeaderID(date);

		return new ConcreteDateHeader(
			cellClassName,
			dateString,
			weekdayString,
			description,
			"date_header",
			divisionID,
			calendar.getTime());
	}

	private static String createDateHeaderID(Date date) {
		return "infinical_dh_" + new SimpleDateFormat("yyyyMMdd").format(date);
	}

	public static interface DateBuilderCallback<T> {

		T create(Calendar calendar, String defaultCellCalssName);
	}
}
