package jp.ats.webkit.liverwort;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import jp.ats.liverwort.extension.Liverwort;
import jp.ats.liverwort.extension.TransactionShell;
import jp.ats.liverwort.jdbc.LiManager;
import jp.ats.substrate.transaction.TransactionManager;
import jp.ats.substrate.util.Container;
import jp.ats.webkit.util.ServletUtilities;

public class LiverwortTransactionFilter implements Filter {

	public static final String LI_TRANSACTION_KEY = LiverwortTransactionFilter.class.getName();

	@Override
	public void init(final FilterConfig config) throws ServletException {
		Liverwort.start(new Container<String>() {

			@Override
			public String get(String key) {
				return config.getInitParameter(key);
			}
		});
	}

	@Override
	public void doFilter(
		final ServletRequest request,
		final ServletResponse response,
		final FilterChain chain) throws IOException, ServletException {
		if (LiManager.hasConnection()) {
			chain.doFilter(request, response);
			return;
		}

		try {
			TransactionManager.start(new TransactionShell() {

				@Override
				public void execute() throws Exception {
					request.setAttribute(LI_TRANSACTION_KEY, getTransaction());
					chain.doFilter(request, response);
				}
			});
		} catch (Throwable t) {
			Throwable rootCause = ServletUtilities.getRootCause(t);
			throw new ServletException(rootCause);
		}
	}

	@Override
	public void destroy() {}
}
