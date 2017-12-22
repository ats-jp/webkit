package jp.ats.webkit.scrotable;

import java.text.MessageFormat;

import jp.ats.substrate.U;

public class ScrotableBodyTag extends ScrotableInnerTag {

	@Override
	String processStartPart(String base) {
		ScrotableTag parent = getParent();

		int overflowFlags = 0;

		String heightString = "";
		String height = parent.getHeight();
		if (U.isAvailable(height)) {
			heightString = "height: " + height + "px; ";
		} else {
			overflowFlags += 1;
		}

		String widthString = "";
		String width = parent.getWidth();
		if (U.isAvailable(width)) {
			widthString = "width: " + width + "px; ";
		} else {
			overflowFlags += 2;
		}

		String overflow = "";
		switch (overflowFlags) {
		case 0:
			overflow = "overflow: scroll;";
			break;
		case 1:
			overflow = "overflow-x: scroll;";
			break;
		case 2:
			overflow = "overflow-y: scroll;";
			break;
		case 3:
			overflow = "overflow: visible;";
			break;
		}

		return new MessageFormat(base).format(new String[] {
			getId(),
			heightString,
			widthString,
			overflow });
	}

	@Override
	String getDefaultId() {
		return "scrotableBodyPart";
	}
}
