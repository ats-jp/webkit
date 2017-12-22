package jp.ats.webkit.infinical;

import java.util.Date;

import jp.ats.substrate.U;

public class ConcreteDateHeader implements DateHeader {

	private final String cellClassName;

	private final String dateString;

	private final String weekdayString;

	private final String description;

	private final String divisionClassName;

	private final String divisionID;

	private final Date date;

	public ConcreteDateHeader(
		String cellClassName,
		String dateString,
		String weekdayString,
		String description,
		String divisionClassName,
		String divisionID,
		Date date) {
		this.cellClassName = cellClassName;
		this.dateString = dateString;
		this.weekdayString = weekdayString;
		this.description = description;
		this.divisionClassName = divisionClassName;
		this.divisionID = divisionID;
		this.date = date;
	}

	@Override
	public String getCellClassName() {
		return cellClassName;
	}

	@Override
	public String getDateString() {
		return dateString;
	}

	@Override
	public String getWeekdayString() {
		return weekdayString;
	}

	@Override
	public String getDescription() {
		return description;
	}

	@Override
	public String getDivisionClassName() {
		return divisionClassName;
	}

	@Override
	public String getDivisionID() {
		return divisionID;
	}

	@Override
	public String toString() {
		return U.toString(this);
	}

	@Override
	public Date getDate() {
		return date;
	}
}
