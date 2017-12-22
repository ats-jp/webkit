package jp.ats.webkit.infinical;

import jp.ats.substrate.U;

public class ConcreteBody implements Body {

	private final String cellClassName;

	private final String body;

	public ConcreteBody(String cellClassName, String body) {
		this.cellClassName = cellClassName;
		this.body = body;
	}

	@Override
	public String getCellClassName() {
		return cellClassName;
	}

	@Override
	public String getBody() {
		return body;
	}

	@Override
	public String toString() {
		return U.toString(this);
	}
}
