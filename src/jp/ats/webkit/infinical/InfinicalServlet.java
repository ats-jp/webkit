package jp.ats.webkit.infinical;

import static jp.ats.substrate.U.care;
import static jp.ats.substrate.U.formatDate;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.ats.webkit.util.ServletUtilities;

public class InfinicalServlet extends HttpServlet {

	private static final Pattern pattern = Pattern.compile("/([^/]+)$");

	private static final long serialVersionUID = -5972380212809741135L;

	private InfinicalBuilderFactory factory;

	@Override
	public void init(ServletConfig config) throws ServletException {
		try {
			factory = (InfinicalBuilderFactory) Class.forName(
				config.getInitParameter("factory-class")).newInstance();
		} catch (Exception e) {
			throw new ServletException(e);
		}
	}

	@Override
	protected void doGet(
		HttpServletRequest request,
		HttpServletResponse response) throws ServletException, IOException {
		execute(request, response, factory.createBuilder(request));
	}

	@Override
	protected void doPost(
		HttpServletRequest request,
		HttpServletResponse response) throws ServletException, IOException {
		execute(request, response, factory.createBuilder(request));
	}

	static void execute(
		HttpServletRequest request,
		HttpServletResponse response,
		InfinicalBuilder builder) throws ServletException, IOException {
		Date timestamp = new Date();

		int year = Integer.parseInt(request.getParameter("year"));
		int month = Integer.parseInt(request.getParameter("month"));
		builder.set(year, month);

		builder.build();

		StringBuilder dateHeaderBuffer = new StringBuilder(
			"\r\n<table class=\"infinical\"><tr>\r\n");
		for (DateHeader dateHeader : builder.getDateHeaders()) {
			dateHeaderBuffer.append(MessageFormat.format(
				"<th class=\"{0}\" nowrap=\"nowrap\"><div class=\"{1}\" id=\"{2}\">{3} (<span class=\"{0}\">{4}</span>)<br /><span class=\"description\">{5}</span></div></th>\r\n",
				dateHeader.getCellClassName(),
				dateHeader.getDivisionClassName(),
				dateHeader.getDivisionID(),
				care(dateHeader.getDateString()),
				care(dateHeader.getWeekdayString()),
				care(dateHeader.getDescription())));
		}
		dateHeaderBuffer.append("</tr></table>\r\n");

		StringBuilder memberHeaderBuffer = new StringBuilder(
			"\r\n<table class=\"infinical\">\r\n");

		MemberHeader[] memberHeaders = builder.getMemberHeaders();
		for (int i = 0; i < memberHeaders.length; i++) {
			MemberHeader memberHeader = memberHeaders[i];
			memberHeaderBuffer.append(MessageFormat.format(
				"<tr><th class=\"{0}\" nowrap=\"nowrap\"><div class=\"{1}\" id=\"{2}\">{3}<br /><span class=\"description\">{4}</span></div></th></tr>\r\n",
				memberHeader.getCellClassName(),
				memberHeader.getDivisionClassName(),
				memberHeader.getDivisionID() + "-" + i,
				care(memberHeader.getMemberString()),
				care(memberHeader.getDescription())));
		}
		memberHeaderBuffer.append("</table>");

		StringBuilder bodyBuffer = new StringBuilder(
			"\r\n<table class=\"infinical\">\r\n");
		for (Body[] bodies : builder.getBodies()) {
			bodyBuffer.append("<tr>\r\n");
			for (Body body : bodies) {
				bodyBuffer.append(MessageFormat.format(
					"<td class=\"{0}\"><div>{1}</div></td>",
					body.getCellClassName(),
					care(body.getBody())));
			}
			bodyBuffer.append("</tr>\r\n");
		}
		bodyBuffer.append("</table>\r\n");

		ServletUtilities.noCache(response);

		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");

		Matcher matcher = pattern.matcher(request.getRequestURI());
		matcher.find();
		String callBackName = matcher.group(1);

		Calendar calendar = Calendar.getInstance();
		calendar.set(Calendar.YEAR, year);
		//31日の月で、次が31日ない月の場合のため、日付を1日にしておく
		calendar.set(Calendar.DATE, 1);
		calendar.set(Calendar.MONTH, month);
		SimpleDateFormat format = new SimpleDateFormat("yyyyMM");
		String current = format.format(calendar.getTime());
		calendar.add(Calendar.MONTH, -1);
		String prev = format.format(calendar.getTime());
		calendar.add(Calendar.MONTH, 2);
		String next = format.format(calendar.getTime());

		String jsonp = callBackName
			+ "({"
			+ "\"prev\": \""
			+ prev
			+ "\", \"current\": \""
			+ current
			+ "\", "
			+ "\"next\": \""
			+ next
			+ "\", \"timestamp\": \""
			+ formatDate("yyyy/MM/dd hh:mm:ss", timestamp)
			+ "\", "
			+ "\"dateHeader\": \""
			+ URLEncoder.encode(dateHeaderBuffer.toString(), "UTF-8")
			+ "\", \"memberHeader\": \""
			+ URLEncoder.encode(memberHeaderBuffer.toString(), "UTF-8")
			+ "\", \"body\": \""
			+ URLEncoder.encode(bodyBuffer.toString(), "UTF-8")
			+ "\"});";

		PrintWriter writer = response.getWriter();
		writer.write(jsonp.toCharArray());

		writer.flush();
		writer.close();
	}
}
