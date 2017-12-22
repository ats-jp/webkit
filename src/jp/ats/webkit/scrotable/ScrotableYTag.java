package jp.ats.webkit.scrotable;

import java.text.MessageFormat;

import jp.ats.substrate.U;

public class ScrotableYTag extends ScrotableInnerTag {

	@Override
	String processStartPart(String base) {
		String overflow = "hidden";

		if (!U.isAvailable(getParent().getHeight())) overflow = "visible";

		return new MessageFormat(base).format(new String[] { getId(), overflow });
	}

	@Override
	String getDefaultId() {
		return "scrotableYPart";
	}
}
