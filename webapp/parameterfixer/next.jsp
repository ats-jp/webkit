<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page language="java" %>
<%@page import="jp.ats.webkit.util.*"%>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja">
<head>
<meta http-equiv="content-type" content="text/html;charset=UTF-8" />
</head>
<body>
<form method="post" action="last.jsp">
<%=ParameterFixer.execute(request)%>
<input type="submit" />
</form>
</body>
</html>
