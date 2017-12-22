package sample;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.ats.substrate.U;
import jp.ats.webkit.action.Action;
import jp.ats.webkit.util.ServletUtilities;

public class SampleAutocompleteAction implements Action {

	@Override
	public void execute(HttpServletRequest request, HttpServletResponse response)
		throws IOException, ServletException {
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e) {}

		response.setContentType("text/plain");
		response.setCharacterEncoding("UTF-8");

		ServletUtilities.noCache(response);

		String content = "test1"
			+ U.LINE_SEPARATOR
			+ "test2"
			+ U.LINE_SEPARATOR
			+ "test3";
		PrintWriter writer = response.getWriter();
		writer.write(content);
		writer.flush();
	}
}
