<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional-dtd">
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page language="java" %>
<%@ page import="jp.ats.webkit.pollee.Pollee" %>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja">
<head>
<title></title>
<meta http-equiv="content-type" content="text/html;charset=UTF-8" />
<script src="../js/prototype.js"></script>
</head>
<body>

<div id="output"><ul id="list" /></div>

<form name="form" id="form" method="post">
<input type="text" id="message" name="message" />
<input type="button" value="submit" id="addMessageButton" onclick="addMessage();" />
</form>

<br /><br />

<input type="button" value="Ajax.activeRequestCount"  onclick="alert(Ajax.activeRequestCount);" />

<script>
var pageID = '<%=Pollee.id()%>';

new PeriodicalExecuter(function() {
	if (Ajax.activeRequestCount < 2) $("addMessageButton").enable();
}, 0.2);

var responseFunction = function(response) {
	var xml = response.responseXML;
	if (typeof(xml.normalize) != "undefined") {
		xml.normalize();
	}

	if (xml.getElementsByTagName("command")[0].firstChild.nodeValue == "write") {
		var message = xml.getElementsByTagName("message");

		new Insertion.Bottom(
				'list',
				'<li>' + message[0].firstChild.nodeValue + '</li>');
	}

	pollMessage();
};

function pollMessage() {
	new Ajax.Request(
		"/webkit/pollee?id=" + pageID,
		{
			method: 'get',
			onSuccess: responseFunction,
			onFailure: function() {alert("failure.");},
			onException: function(req, e) {
				new Insertion.Bottom('list', '<li>recv failed: ' + e + '</li>');
			}});
}

function addMessage() {
	$("addMessageButton").disable();

	if ($('message').value == '') return;

	new Ajax.Request(
		"/webkit/SamplePolleeAction.do",
		{
			method: 'post',
			onSuccess: function(response) {
				$('message').value = '';
				$('message').focus();
			},
			postBody: $H({message: $F('message')}).toQueryString(),
			onException: function(req, e) {alert(e);},
			onFailure: function() {alert("failure.");},
			onComplete: function() {}
		});
}

pollMessage();
</script>
</body>
</html>
