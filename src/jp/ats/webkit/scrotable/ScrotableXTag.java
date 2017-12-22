package jp.ats.webkit.scrotable;

import java.text.MessageFormat;

import jp.ats.substrate.U;

public class ScrotableXTag extends ScrotableInnerTag {

	@Override
	String processStartPart(String base) {
		String overflow = "hidden";

		if (!U.isAvailable(getParent().getWidth())) overflow = "visible";

		return new MessageFormat(base).format(new String[] { getId(), overflow });
	}

	@Override
	String getDefaultId() {
		return "scrotableXPart";
	}
}
