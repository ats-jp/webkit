package sample;

import java.util.Calendar;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import jp.ats.webkit.infinical.AbstractInfinicalBuilder;
import jp.ats.webkit.infinical.Body;
import jp.ats.webkit.infinical.ConcreteMemberHeader;
import jp.ats.webkit.infinical.MemberHeader;

public class SampleTimeInfinicalBuilder extends AbstractInfinicalBuilder {

	private static final MemberHeader[] memberHeaders;

	static {
		memberHeaders = new MemberHeader[16];
		memberHeaders[0] = new SampleMemberHeader("09:00 - 09:30");
		memberHeaders[1] = new SampleMemberHeader("09:30 - 10:00");
		memberHeaders[2] = new SampleMemberHeader("10:00 - 10:30");
		memberHeaders[3] = new SampleMemberHeader("10:30 - 11:00");
		memberHeaders[4] = new SampleMemberHeader("11:00 - 11:30");
		memberHeaders[5] = new SampleMemberHeader("11:30 - 12:00");
		memberHeaders[6] = new SampleMemberHeader("12:00 - 12:30");
		memberHeaders[7] = new SampleMemberHeader("12:30 - 13:00");
		memberHeaders[8] = new SampleMemberHeader("13:00 - 13:30");
		memberHeaders[9] = new SampleMemberHeader("13:30 - 14:00");
		memberHeaders[10] = new SampleMemberHeader("14:00 - 14:30");
		memberHeaders[11] = new SampleMemberHeader("14:30 - 15:00");
		memberHeaders[12] = new SampleMemberHeader("15:00 - 15:30");
		memberHeaders[13] = new SampleMemberHeader("15:30 - 16:00");
		memberHeaders[14] = new SampleMemberHeader("16:00 - 16:30");
		memberHeaders[15] = new SampleMemberHeader("16:30 - 17:00");
	}

	public SampleTimeInfinicalBuilder(HttpServletRequest request) {
		super(request);
	}

	@Override
	public void moveMember(
		int thisMemberIndex,
		int targetMemberIndex,
		boolean isBefore) {
		throw new UnsupportedOperationException();
	}

	@Override
	protected MemberHeader[] buildMemberHeaders() {
		return memberHeaders;
	}

	@Override
	protected Body[][] buildBodies() {
		Body[][] bodies = new Body[memberHeaders.length][];
		for (int i = 0; i < memberHeaders.length; i++) {
			final MemberHeader header = memberHeaders[i];

			List<Body> list = buildDates(new DateBuilderCallback<Body>() {

				@Override
				public Body create(
					Calendar calendar,
					String defaultCellCalssName) {
					return new SampleBody((calendar.get(Calendar.MONTH) + 1)
						+ " / "
						+ (calendar.get(Calendar.DATE))
						+ " "
						+ header.getMemberString(), defaultCellCalssName);
				}
			});

			bodies[i] = list.toArray(new Body[list.size()]);
		}

		return bodies;
	}

	private static class SampleMemberHeader extends ConcreteMemberHeader {

		private SampleMemberHeader(String time) {
			super(time, "");
		}
	}

	private static class SampleBody implements Body {

		private String body;

		private String className;

		private SampleBody(String body, String className) {
			this.body = body;
			this.className = className;
		}

		@Override
		public String getCellClassName() {
			return className;
		}

		@Override
		public String getBody() {
			return body;
		}
	}
}
