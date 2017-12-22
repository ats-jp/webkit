package sample;

import javax.servlet.http.HttpServletRequest;

import jp.ats.webkit.infinical.InfinicalBuilder;
import jp.ats.webkit.infinical.InfinicalBuilderFactory;

public class SampleTimeInfinicalBuilderFactory implements InfinicalBuilderFactory {

	@Override
	public InfinicalBuilder createBuilder(HttpServletRequest request) {
		return new SampleTimeInfinicalBuilder(request);
	}
}
