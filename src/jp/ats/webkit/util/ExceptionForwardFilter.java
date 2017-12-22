package jp.ats.webkit.util;

import java.io.IOException;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

/**
 * Tomcatで例外に紐づけたカスタムエラーページへ遷移させる機能で、レスポンスヘッダ
 * のステータス行に、例外のメッセージを直接表示するという問題を避けるため、例外の
 * 型から定義されたページへ遷移させるフィルタです。
 */
public class ExceptionForwardFilter implements Filter {

	private static final ThreadLocal<Throwable> holder = new ThreadLocal<Throwable>();

	//先に記述した例外から適用されるように LinkedHashMap を使用
	private final Map<String, String> classMap = new LinkedHashMap<String, String>();

	@Override
	public void init(FilterConfig config) throws ServletException {
		Enumeration<?> enumeration = config.getInitParameterNames();
		while (enumeration.hasMoreElements()) {
			String className = (String) enumeration.nextElement();
			classMap.put(className, config.getInitParameter(className));
		}
	}

	@Override
	public void doFilter(
		ServletRequest request,
		ServletResponse response,
		FilterChain chain) throws IOException, ServletException {
		try {
			chain.doFilter(request, response);
		} catch (ServletException e) {
			Throwable rootCause = ServletUtilities.getRootCause(e);
			String location = findLocation(rootCause);
			if (location == null) throw e;
			holder.set(e);
			request.getRequestDispatcher(location).forward(request, response);
		} catch (IOException e) {
			String location = findLocation(e);
			if (location == null) throw e;
			holder.set(e);
			request.getRequestDispatcher(location).forward(request, response);
		} catch (RuntimeException e) {
			String location = findLocation(e);
			if (location == null) throw e;
			holder.set(e);
			request.getRequestDispatcher(location).forward(request, response);
		} catch (Error e) {
			String location = findLocation(e);
			if (location == null) throw e;
			holder.set(e);
			request.getRequestDispatcher(location).forward(request, response);
		}
		holder.set(null);
	}

	public static Throwable getCurrentException() {
		return holder.get();
	}

	@Override
	public void destroy() {}

	private String findLocation(Throwable t) {
		List<Class<?>> classes = new LinkedList<Class<?>>();
		classes.add(t.getClass());
		List<Class<?>> allClasses = addSupers(classes);

		for (Class<?> clazz : allClasses) {
			String location = classMap.get(clazz.getName());
			if (location != null) return location;
		}
		return null;
	}

	/**
	 * 幅優先で親クラス、インターフェイスを集める
	 */
	private static List<Class<?>> addSupers(List<Class<?>> nextLevelClasses) {
		List<Class<?>> classes = new LinkedList<Class<?>>();
		classes.addAll(nextLevelClasses);
		List<Class<?>> myNextLevelClasses = new LinkedList<Class<?>>();
		for (Class<?> target : nextLevelClasses) {
			Class<?> superClass = target.getSuperclass();
			if (superClass != null) myNextLevelClasses.add(superClass);
			myNextLevelClasses.addAll(Arrays.asList(target.getInterfaces()));
		}
		if (myNextLevelClasses.size() > 0) classes.addAll(addSupers(myNextLevelClasses));
		return classes;
	}
}
