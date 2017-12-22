package sample;

import java.util.Calendar;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import jp.ats.webkit.infinical.AbstractInfinicalBuilder;
import jp.ats.webkit.infinical.Body;
import jp.ats.webkit.infinical.ConcreteMemberHeader;
import jp.ats.webkit.infinical.MemberHeader;

public class SampleMemberInfinicalBuilder extends AbstractInfinicalBuilder {

	private static final MemberHeader[] memberHeaders;

	private static final int memberCount = 20;

	static {
		memberHeaders = new MemberHeader[memberCount];
		for (int i = 0; i < memberHeaders.length; i++) {
			memberHeaders[i] = new SampleMemberHeader(i);
		}
	}

	public SampleMemberInfinicalBuilder(HttpServletRequest request) {
		super(request);
	}

	@Override
	public void moveMember(
		int thisMemberIndex,
		int targetMemberIndex,
		boolean isBefore) {
		LinkedList<MemberHeader> list = new LinkedList<>();
		list.add(null);
		for (MemberHeader member : memberHeaders) {
			list.add(member);
			list.add(null);
		}

		int index = thisMemberIndex * 2 + 1;
		MemberHeader thisMember = list.get(index);
		list.set(index, null);

		list.set(targetMemberIndex * 2 + 1 + (isBefore ? -1 : 1), thisMember);

		for (Iterator<MemberHeader> iterator = list.iterator(); iterator.hasNext();) {
			if (iterator.next() == null) iterator.remove();
		}

		for (int i = 0; i < memberCount; i++) {
			memberHeaders[i] = list.get(i);
		}
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

		private SampleMemberHeader(int index) {
			super("MEMBER" + (index + 1), "description");
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
