package sample;

import javax.servlet.http.HttpServletRequest;

import jp.ats.webkit.infinical.InfinicalBuilder;
import jp.ats.webkit.infinical.InfinicalBuilderFactory;

public class SampleMemberInfinicalBuilderFactory implements InfinicalBuilderFactory {

	@Override
	public InfinicalBuilder createBuilder(HttpServletRequest request) {
		return new SampleMemberInfinicalBuilder(request);
	}
}
