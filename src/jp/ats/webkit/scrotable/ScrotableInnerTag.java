package jp.ats.webkit.scrotable;

import java.io.IOException;
import java.text.MessageFormat;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.JspWriter;
import javax.servlet.jsp.PageContext;
import javax.servlet.jsp.tagext.Tag;

public abstract class ScrotableInnerTag implements Tag {

	private PageContext context;

	private ScrotableTag parent;

	private String id;

	@Override
	public int doStartTag() throws JspException {
		JspWriter out = context.getOut();
		try {
			out.write(processParentStartPart(parent.getStartPart(this)));
			out.write(processStartPart(ScrotableTag.readFile(getClass().getSimpleName()
				+ "-start.txt")));
		} catch (IOException e) {
			throw new JspException(e);
		}
		return EVAL_BODY_INCLUDE;
	}

	@Override
	public int doEndTag() throws JspException {
		JspWriter out = context.getOut();
		try {
			out.write(processParentEndPart(ScrotableTag.readFile(getClass().getSimpleName()
				+ "-end.txt")));
			out.write(processEndPart(parent.getEndPart(this)));
		} catch (IOException e) {
			throw new JspException(e);
		}
		return EVAL_PAGE;
	}

	@Override
	public void release() {
		context = null;
		parent = null;
		id = null;
	}

	@Override
	public void setPageContext(PageContext context) {
		this.context = context;
	}

	@Override
	public ScrotableTag getParent() {
		return parent;
	}

	@Override
	public void setParent(Tag parent) {
		if (!(parent instanceof ScrotableTag)) throw new IllegalStateException(
			this.getClass().getSimpleName()
				+ " タグは "
				+ ScrotableTag.class.getSimpleName()
				+ "タグ内に記述されなければなりません");
		this.parent = (ScrotableTag) parent;
	}

	public String getId() {
		if (id == null) return getDefaultId();
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	String processParentStartPart(String base) {
		return base;
	}

	String processStartPart(String base) {
		return new MessageFormat(base).format(new String[] { getId() });
	}

	String processParentEndPart(String base) {
		return base;
	}

	String processEndPart(String base) {
		return base;
	}

	abstract String getDefaultId();
}
