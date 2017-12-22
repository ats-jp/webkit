package jp.ats.webkit.infinical;

import java.util.Date;

public interface DateHeader {

	String getCellClassName();

	String getDateString();

	String getWeekdayString();

	String getDescription();

	String getDivisionClassName();

	String getDivisionID();

	Date getDate();
}
