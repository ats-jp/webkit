package jp.ats.webkit.infinical;

import java.io.IOException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class MoveServlet extends HttpServlet {

	private static final long serialVersionUID = 6744119174769984300L;

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
		execute(request, response);
	}

	@Override
	protected void doPost(
		HttpServletRequest request,
		HttpServletResponse response) throws ServletException, IOException {
		execute(request, response);
	}

	private void execute(
		HttpServletRequest request,
		HttpServletResponse response) throws ServletException, IOException {
		InfinicalBuilder builder = factory.createBuilder(request);

		builder.moveMember(
			getIndex(request.getParameter("thisMember")),
			getIndex(request.getParameter("targetMember")),
			Boolean.parseBoolean(request.getParameter("isBefore")));

		InfinicalServlet.execute(request, response, builder);
	}

	private static int getIndex(String memberID) {
		return Integer.parseInt(memberID.substring(memberID.indexOf("-") + 1));
	}
}
