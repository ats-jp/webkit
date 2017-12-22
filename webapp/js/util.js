function ResponseXML(response) {
	this.parseToMap = function() {
		var xml = response.responseXML;
		if (typeof(xml.normalize) != "undefined") {
			xml.normalize();
		}
		var items = xml.getElementsByTagName("item");
		var result = new Array();
		for (var i = 0; i < items.length; i++) {
			var value = items[i].getElementsByTagName("value")[0].firstChild != null ? items[i].getElementsByTagName("value")[0].firstChild.nodeValue : "";
			result[items[i].getElementsByTagName("key")[0].firstChild.nodeValue] = value;
		}
		return result;
	}

	this.parseToArray = function() {
		var xml = response.responseXML;
		if (typeof(xml.normalize) != "undefined") {
			xml.normalize();
		}
		var items = xml.getElementsByTagName("item");
		var result = new Array();
		for (var i = 0; i < items.length; i++) {
			var key = items[i].getElementsByTagName("key")[0].firstChild != null ? items[i].getElementsByTagName("key")[0].firstChild.nodeValue : "";
			var value = items[i].getElementsByTagName("value")[0].firstChild != null ? items[i].getElementsByTagName("value")[0].firstChild.nodeValue : "";
			var element = new Array();
			element[0] = key;
			element[1] = value;
			result[i] = element;
		}
		return result;
	}
}
