<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page language="java" %>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>dexter sample page</title>
<link rel="stylesheet" type="text/css" href="dexter.css" media="screen" />
<script type="text/javascript" src="../js/jquery.js"></script>
<script type="text/javascript" src="../js/jquery.dexter.js"></script>
<script>
$(document).ready(function() {
	$("#testform").dexter("/webkit/dexter", $("#dexterSubmit")).start();
});
</script>
</head>
<body>
<h2>dexter sample page</h2>

<% /* jspod{sample.AutoForm} */ sample.AutoForm jspod = (sample.AutoForm) jp.ats.dexter.DexterManager.prepareJspod(sample.AutoForm.class); %>
<form id="testform" name="testform" action="AutoForm.dx" method="post">

<input type="text" name="<%= /* jspod.name{lengthCheck} */ "lengthCheck" %>" id="<%= /* jspod.name{lengthCheck} */ "lengthCheck" %>" />
<input type="button" value="clear" onclick="document.testform.lengthCheck.value=''" />
<div id = "length_check_message_id">メッセージ表示用DIV</div>
<br /><br />

<textarea name="<%= /* jspod.name{sizeCheck} */ "sizeCheck" %>" id="<%= /* jspod.name{sizeCheck} */ "sizeCheck" %>"></textarea>
<input type="button" value="clear" onclick="document.testform.sizeCheck.value=''" />
<br /><br />

<input type="text" name="<%= /* jspod.name{dateCheck} */ "dateCheck" %>" id="<%= /* jspod.name{dateCheck} */ "dateCheck" %>" />
<input type="button" value="clear" onclick="document.testform.dateCheck.value=''" />
<br /><br />

<input type="text" name="<%= /* jspod.name{numCheck} */ "numCheck" %>" id="<%= /* jspod.name{numCheck} */ "numCheck" %>" />
<input type="button" value="clear" onclick="document.testform.numCheck.value=''" />
<br /><br />

<input type="submit" value="submit" id="dexterSubmit" />
<br /><br />

<input type="submit" value="test submit" />
</form>
</body>
</html>
