package jp.ats.webkit.scrotable;

import java.io.IOException;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.PageContext;
import javax.servlet.jsp.tagext.Tag;

import jp.ats.substrate.U;

public class ScrotableTag implements Tag {

	private String height;

	private String width;

	private Type type;

	@Override
	public int doStartTag() throws JspException {
		return EVAL_BODY_INCLUDE;
	}

	@Override
	public int doEndTag() throws JspException {
		return EVAL_PAGE;
	}

	public void setType(String type) {
		this.type = Type.getInstance(type);
	}

	@Override
	public void release() {
		type = null;
	}

	@Override
	public void setPageContext(PageContext context) {}

	@Override
	public Tag getParent() {
		throw new UnsupportedOperationException();
	}

	@Override
	public void setParent(Tag parent) {}

	String getStartPart(ScrotableInnerTag innerTag) {
		type.check(innerTag);
		return getPart(innerTag, "start");
	}

	String getEndPart(ScrotableInnerTag innerTag) {
		return getPart(innerTag, "end");
	}

	static String readFile(String fileName) {
		try {
			return new String(U.readBytes(U.getResourcePathByName(
				ScrotableTag.class,
				fileName).openStream()));
		} catch (IOException e) {
			throw new Error();
		}
	}

	private String getPart(ScrotableInnerTag innerTag, String suffix) {
		String fileName = type.getClass().getSimpleName()
			+ "-"
			+ innerTag.getClass().getSimpleName()
			+ "-"
			+ suffix
			+ ".txt";
		return readFile(fileName);
	}

	public String getHeight() {
		return height;
	}

	public void setHeight(String height) {
		this.height = height;
	}

	public String getWidth() {
		return width;
	}

	public void setWidth(String width) {
		this.width = width;
	}
}
