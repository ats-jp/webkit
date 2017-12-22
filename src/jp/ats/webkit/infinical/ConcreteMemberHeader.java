package jp.ats.webkit.infinical;

import jp.ats.substrate.U;

public class ConcreteMemberHeader implements MemberHeader {

	private static final String divisionClassName = "divMember";

	private static final String divisionID = "infinicalMember";

	private final String memberString;

	private final String description;

	public ConcreteMemberHeader(String memberString, String description) {
		this.memberString = memberString;
		this.description = description;
	}

	@Override
	public String getCellClassName() {
		return "member";
	}

	@Override
	public String getMemberString() {
		return memberString;
	}

	@Override
	public String getDescription() {
		return description;
	}

	@Override
	public String getDivisionClassName() {
		return divisionClassName;
	}

	@Override
	public String getDivisionID() {
		return divisionID;
	}

	@Override
	public String toString() {
		return U.toString(this);
	}
}
