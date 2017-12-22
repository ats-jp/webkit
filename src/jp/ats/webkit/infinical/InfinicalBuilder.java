package jp.ats.webkit.infinical;

public interface InfinicalBuilder {

	void set(int year, int month);

	void build();

	DateHeader[] getDateHeaders();

	MemberHeader[] getMemberHeaders();

	Body[][] getBodies();

	void moveMember(int thisMember, int targetMember, boolean isBefore);

	int getYear();

	int getMonth();
}
