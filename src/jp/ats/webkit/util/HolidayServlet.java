package jp.ats.webkit.util;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.util.Calendar;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.ats.substrate.U;
import jp.ats.substrate.util.CalendarUtilities;

public class HolidayServlet extends HttpServlet {

	private static final long serialVersionUID = 4377233266247781748L;

	private String encoding = "UTF-8";

	@Override
	public void init(ServletConfig config) throws ServletException {
		String encodingParameter = config.getInitParameter("encoding");
		if (encodingParameter != null) encoding = encodingParameter;
	}

	@Override
	protected void doGet(
		HttpServletRequest request,
		HttpServletResponse response) throws ServletException, IOException {
		Calendar calendar = Calendar.getInstance();
		calendar.set(
			Calendar.YEAR,
			Integer.parseInt(request.getParameter("year")));
		calendar.set(
			Calendar.MONTH,
			Integer.parseInt(request.getParameter("month")));
		calendar.set(
			Calendar.DATE,
			Integer.parseInt(request.getParameter("date")));

		String callback = request.getParameter("cb");

		String holiday = U.care(CalendarUtilities.getHolidayName(calendar));

		response.setContentType("application/json");
		response.setCharacterEncoding(encoding);

		PrintWriter writer = new PrintWriter(new OutputStreamWriter(
			response.getOutputStream(),
			encoding));

		writer.write(callback + "('" + holiday + "');");

		writer.flush();
	}
}
