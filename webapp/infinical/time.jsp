<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional-dtd">
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page language="java" %>

<html>
<head>
<meta http-equiv="content-type" content="text/html;charset=UTF-8" />

<title>infinical demo (time schedule type)</title>

<link rel="stylesheet" type="text/css" href="infinical.css" media="screen" />

<script src="../js/prototype.js"></script>
<script src="../js/scrotable.js"></script>
<script src="../js/jquery.js"></script>
<script type="text/javascript">
jQuery.noConflict();
</script>
<script src="../js/jquery.dragscroll.js"></script>
<script src="../js/jquery.infinical.js"></script>
<script src="../js/jquery.blockUI.js"></script>

<script>
jQuery(document).ready(function() {
	jQuery.infinical.start(new Date(), {
		contextPath: "<%=request.getContextPath()%>" + "/infinicaltime",
		disableMemberMove: true,
		blockMessage: "<img src='indicator.gif' /> 読み込み中..."
	});
});
</script>
</head>
<body>

<h2>infinical demo <font size="-1">(time schedule type)</font></h2>

<jsp:include page="infinical.jsp" flush="false" />

<div id="console"></div>

</body>
</html>
