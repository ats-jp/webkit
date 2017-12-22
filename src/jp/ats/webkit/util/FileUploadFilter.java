package jp.ats.webkit.util;

import static jp.ats.substrate.U.isAvailable;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

import jp.ats.substrate.U;
import jp.ats.substrate.util.CollectionMap;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

public class FileUploadFilter implements Filter {

	private static final ThreadLocal<CollectionMap<String, FileItem>> filesThreadLocal = new ThreadLocal<CollectionMap<String, FileItem>>();

	private long constraintSize = Long.MAX_VALUE;

	private int threshold = 4096;

	private String encoding;

	private File tempDirectory = new File(System.getProperty("java.io.tmpdir"));

	@Override
	public void init(FilterConfig config) throws ServletException {
		String constraintSize = config.getInitParameter("constraint-size");
		if (isAvailable(constraintSize)) {
			this.constraintSize = Long.parseLong(constraintSize);
		}

		String threshold = config.getInitParameter("threshold");
		if (isAvailable(threshold)) {
			this.threshold = Integer.parseInt(threshold);
		}

		String encoding = config.getInitParameter("header-encoding");
		if (isAvailable(encoding)) {
			this.encoding = encoding;
		}

		String tempDirectory = config.getInitParameter("temp-directory");
		if (isAvailable(tempDirectory)) {
			this.tempDirectory = new File(tempDirectory);
		}
	}

	@Override
	public void doFilter(
		ServletRequest request,
		ServletResponse response,
		FilterChain chain) throws IOException, ServletException {
		HttpServletRequest httpRequest = (HttpServletRequest) request;

		if (!ServletFileUpload.isMultipartContent(httpRequest)) {
			chain.doFilter(request, response);
			return;
		}

		DiskFileItemFactory factory = new DiskFileItemFactory();
		factory.setSizeThreshold(threshold);
		factory.setRepository(tempDirectory);

		ServletFileUpload upload = new ServletFileUpload(factory);

		if (isAvailable(encoding)) upload.setHeaderEncoding(encoding);

		upload.setSizeMax(constraintSize);
		List<?> items;
		try {
			items = upload.parseRequest(httpRequest);
		} catch (FileUploadException e) {
			throw new ServletException(e);
		}

		CollectionMap<String, String> parameterMap = CollectionMap.newInstance();
		CollectionMap<String, FileItem> files = CollectionMap.newInstance();
		for (Object item : items) {
			FileItem fileItem = (FileItem) item;
			if (fileItem.isFormField()) {
				parameterMap.put(fileItem.getFieldName(), fileItem.getString());
			} else {
				files.put(fileItem.getFieldName(), fileItem);
			}
		}

		EditableRequest editableRequest = new EditableRequest(httpRequest);
		editableRequest.setContentType(null);

		editableRequest.setAttribute(
			ParameterEncodingFilter.DELEGATE_ENCODE_KEY,
			"");

		Map<String, String[]> target = editableRequest.getParameterMap();
		for (String key : parameterMap.keySet()) {
			Collection<String> values = parameterMap.get(key);
			target.put(key, values.toArray(new String[values.size()]));
		}

		if (filesThreadLocal.get() != null) throw new IllegalStateException(
			"既にアップロードされているファイルがあります");
		filesThreadLocal.set(files);

		try {
			chain.doFilter(editableRequest, response);
		} finally {
			filesThreadLocal.set(null);
			for (Collection<FileItem> values : files.getInnerMap().values()) {
				for (FileItem item : values) {
					item.delete();
				}
			}
		}
	}

	public static FileItem getFileItem(String fieldName) {
		FileItem[] items = getFileItems(fieldName);
		if (items == null) return null;
		if (items.length == 0) return null;
		return items[0];
	}

	public static FileItem[] getFileItems(String fieldName) {
		CollectionMap<String, FileItem> files = filesThreadLocal.get();
		if (files == null) return null;
		Collection<FileItem> items = files.get(fieldName);
		if (items == null) return null;
		return items.toArray(new FileItem[items.size()]);
	}

	@Override
	public void destroy() {}

	private class EditableRequest extends HttpServletRequestWrapper {

		private final Map<String, String[]> parameter;

		private String contentType;

		public EditableRequest(HttpServletRequest request) {
			super(request);
			parameter = new HashMap<String, String[]>(request.getParameterMap());
			contentType = request.getContentType();
		}

		@Override
		public Enumeration<String> getParameterNames() {
			return U.getMapKeys(parameter);
		}

		@Override
		public Map<String, String[]> getParameterMap() {
			return parameter;
		}

		@Override
		public String[] getParameterValues(String name) {
			return parameter.get(name);
		}

		@Override
		public String getParameter(String name) {
			String[] values = parameter.get(name);
			if (values == null || values.length == 0) return null;
			return values[0];
		}

		@Override
		public String getContentType() {
			return contentType;
		}

		public void setContentType(String type) {
			contentType = type;
		}
	}
}
