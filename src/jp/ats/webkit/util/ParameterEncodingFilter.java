package jp.ats.webkit.util;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

import jp.ats.substrate.U;

public class ParameterEncodingFilter implements Filter {

	private String encoding;

	static final String DELEGATE_ENCODE_KEY = ParameterEncodingFilter.class.getName()
		+ ".DELEGATE_ENCODE";

	@Override
	public void init(FilterConfig config) throws ServletException {
		encoding = config.getInitParameter("encoding");
	}

	@Override
	public void doFilter(
		ServletRequest request,
		ServletResponse response,
		FilterChain chain) throws IOException, ServletException {
		HttpServletRequest httpRequest = (HttpServletRequest) request;

		try {
			httpRequest.setCharacterEncoding(encoding);
		} catch (UnsupportedEncodingException e) {
			throw new ServletException(e);
		}

		// Tomcat の場合、 useBodyEncodingForURI=true を使用しないと
		// GET の値の文字コードが変換されない
		// その設定を行わない場合はこのフィルタを使用する
		if ("GET".equalsIgnoreCase(httpRequest.getMethod())
			|| httpRequest.getAttribute(DELEGATE_ENCODE_KEY) != null) {
			httpRequest = new EncodeRequest(httpRequest);
		}

		chain.doFilter(httpRequest, response);
	}

	@Override
	public void destroy() {}

	private class EncodeRequest extends HttpServletRequestWrapper {

		private final Map<String, String[]> encoded;

		private EncodeRequest(HttpServletRequest request) {
			super(request);
			encoded = cloneMap(request.getParameterMap(), encoding);
		}

		@Override
		public String getParameter(String name) {
			String[] values = encoded.get(name);
			if (values == null) return null;
			return values[0];
		}

		@Override
		public Map<String, String[]> getParameterMap() {
			return cloneMap(encoded, null);
		}

		@Override
		public Enumeration<String> getParameterNames() {
			return U.<String>getMapKeys(encoded);
		}

		@Override
		public String[] getParameterValues(String name) {
			return cloneArray(encoded.get(name), null);
		}
	}

	private static Map<String, String[]> cloneMap(
		Map<String, String[]> base,
		String encoding) {
		Map<String, String[]> clone = new HashMap<String, String[]>();
		for (Entry<String, String[]> entry : base.entrySet()) {
			String[] values = cloneArray(entry.getValue(), encoding);
			clone.put(encode(entry.getKey(), encoding), values);
		}
		return clone;
	}

	private static String[] cloneArray(String[] base, String encoding) {
		if (base == null) return null;
		String[] values = new String[base.length];
		for (int ii = 0; ii < values.length; ii++) {
			values[ii] = encode(base[ii], encoding);
		}
		return values;
	}

	private static String encode(String value, String encoding) {
		if (encoding == null) return value;
		try {
			return new String(value.getBytes("8859_1"), encoding);
		} catch (UnsupportedEncodingException e) {
			throw new IllegalStateException(e);
		}
	}
}
