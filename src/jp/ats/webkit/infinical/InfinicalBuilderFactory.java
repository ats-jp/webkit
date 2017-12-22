package jp.ats.webkit.infinical;

import javax.servlet.http.HttpServletRequest;

public interface InfinicalBuilderFactory {

	InfinicalBuilder createBuilder(HttpServletRequest request);
}
