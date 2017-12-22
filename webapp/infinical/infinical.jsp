<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page language="java" %>
<%@ taglib uri="/WEB-INF/webkit.tld" prefix="webkit" %>

<div id="infinicalFrame">
<div class="infinicalArea">
<div id="infinicalYearArea"></div>
<div id="infinicalNavigatorBar">
<button class="infinicalHeaderItem" onclick="toToday()">今日</button><button class="infinicalHeaderItem" onclick="slideInfinical(-7)">« 前週</button><input type="text" class="infinicalHeaderItem" id="infinicalDateArea" /><button class="infinicalHeaderItem" onclick="slideInfinical(7)">翌週 »</button></div>
</div>

<webkit:scrotable
	type="XY"
	height="100"
	width="800">
<webkit:scrotableX />
<webkit:scrotableY />
<webkit:scrotableBody />
</webkit:scrotable>

<div class="infinicalArea">
<a href="javascript:void(0);" onclick="jQuery.infinical.reflesh();" id="infinicalTimestampArea" title="最新の状態に更新"></a>
</div>
</div>

<script>
function toToday() {
	jQuery.infinical.jump(new Date());
}

function slideInfinical(days) {
	jQuery.infinical.slide(days);
}
</script>
