package jp.ats.webkit.scrotable;

import java.util.LinkedList;
import java.util.NoSuchElementException;

abstract class Type {

	private LinkedList<Class<? extends ScrotableInnerTag>> list;

	static Type getInstance(String typeName) {
		if ("X".equals(typeName)) return new TypeX();
		if ("Y".equals(typeName)) return new TypeY();
		if ("XY".equals(typeName)) return new TypeXY();
		throw new IllegalStateException(typeName + " は使用できないタイプ値です");
	}

	void setList(LinkedList<Class<? extends ScrotableInnerTag>> list) {
		this.list = list;
	}

	void check(ScrotableInnerTag tag) {
		try {
			if (list.pop().equals(tag.getClass())) return;
		} catch (NoSuchElementException e) {}
		throw new IllegalStateException("タグの記述順序が違います");
	}

	private static class TypeX extends Type {

		private TypeX() {
			LinkedList<Class<? extends ScrotableInnerTag>> list = new LinkedList<>();
			list.add(ScrotableXTag.class);
			list.add(ScrotableBodyTag.class);
			setList(list);
		}
	}

	private static class TypeY extends Type {

		private TypeY() {
			LinkedList<Class<? extends ScrotableInnerTag>> list = new LinkedList<>();
			list.add(ScrotableYTag.class);
			list.add(ScrotableBodyTag.class);
			setList(list);
		}
	}

	private static class TypeXY extends Type {

		private TypeXY() {
			LinkedList<Class<? extends ScrotableInnerTag>> list = new LinkedList<>();
			list.add(ScrotableXTag.class);
			list.add(ScrotableYTag.class);
			list.add(ScrotableBodyTag.class);
			setList(list);
		}
	}
}
