package jp.ats.webkit.util;

import java.io.UnsupportedEncodingException;
import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;

import jp.ats.substrate.util.Sanitizer;

public class ParameterFixer {

	public static String execute(HttpServletRequest request)
		throws UnsupportedEncodingException {
		Enumeration<String> names = request.getParameterNames();

		StringBuilder builder = new StringBuilder();
		while (names.hasMoreElements()) {
			String name = names.nextElement();
			build(builder, name, request.getParameterValues(name));
		}

		return builder.toString();
	}

	private static void build(
		StringBuilder builder,
		String name,
		String[] values) throws UnsupportedEncodingException {
		for (String value : values) {
			builder.append("<input type=\"hidden\" name=\""
				+ name
				+ "\" value=\""
				+ Sanitizer.sanitize(value)
				+ "\" />");
		}
	}
}
