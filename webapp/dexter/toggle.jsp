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
var dexter;
$(document).ready(function() {
	dexter = $("#testform").dexter("/webkit/dexter", $("#dexterSubmit")).deisableAutoDescription().start();
});
</script>
</head>
<body>
<h2>dexter sample page</h2>

<form id="testform" name="testform" action="ok.html">

<input type="text" name="length_check" id="length_check_id">
<input type="button" value="?" onclick="dexter.toggleDescription($('#length_check_id'))">
<input type="button" value="clear" onclick="document.testform.length_check.value=''">
<div id = "length_check_message_id">メッセージ表示用DIV</div>
<br /><br />

<textarea name="size_check" id="size_check_id"></textarea>
<input type="button" value="?" onclick="dexter.toggleDescription($('#size_check_id'))">
<input type="button" value="clear" onclick="document.testform.size_check.value=''">
<br /><br />

<input type="text" name="date_check" id="date_check_id">
<input type="button" value="?" onclick="dexter.toggleDescription($('#date_check_id'))">
<input type="button" value="clear" onclick="document.testform.date_check.value=''">
<br /><br />

<input type="text" name="num_check" id="num_check_id">
<input type="button" value="?" onclick="dexter.toggleDescription($('#num_check_id'))">
<input type="button" value="clear" onclick="document.testform.num_check.value=''">
<br /><br />

<input type="submit" value="submit" id="dexterSubmit">
<br /><br />

<input type="submit" value="test submit">
</form>
</body>
</html>
