package jp.ats.webkit.action;

import static jp.ats.substrate.U.isAvailable;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.ats.substrate.U;

public class Controller implements Filter {

	private static volatile Pattern pattern = Pattern.compile("([^/]+)\\.do$");

	private volatile String packagePrefix;

	private volatile boolean refererRedirect = true;

	@Override
	public void init(FilterConfig config) throws ServletException {
		packagePrefix = U.care(config.getInitParameter("package-prefix"));

		String refererRedirectString = config.getInitParameter("referer-redirect");
		if (isAvailable(refererRedirectString)) {
			refererRedirect = Boolean.parseBoolean(refererRedirectString);
		}

		String suffix = config.getInitParameter("suffix");
		if (isAvailable(suffix)) {
			pattern = Pattern.compile("([^/]+)\\." + suffix + "$");
		}
	}

	@Override
	public void doFilter(
		ServletRequest baseRequest,
		ServletResponse baseResponse,
		FilterChain chain) throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) baseRequest;
		HttpServletResponse response = (HttpServletResponse) baseResponse;
		String requested = request.getRequestURI();

		Matcher matcher = pattern.matcher(requested);
		if (matcher.find()) {
			Action action = getAction(matcher.group(1));

			try {
				action.execute(request, response);
			} catch (ApplicationException e) {
				throw new ServletException(e);
			}

			if (refererRedirect) {
				String referer = request.getHeader("Referer");
				if (!isAvailable(referer)) referer = "/";
				response.sendRedirect(referer);
			}

			return;
		}

		chain.doFilter(baseRequest, baseResponse);
	}

	@Override
	public void destroy() {}

	private Action getAction(String name) throws ServletException {
		try {
			return (Action) Class.forName(
				packagePrefix + (isAvailable(packagePrefix) ? "." : "") + name)
				.newInstance();
		} catch (Exception e) {
			throw new ServletException(e);
		}
	}
}
