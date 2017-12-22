package jp.ats.webkit.util;

import java.io.StringWriter;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

public class ResponseXMLBuilder {

	private final Element root;

	public ResponseXMLBuilder() {
		Document document;
		try {
			document = DocumentBuilderFactory.newInstance()
				.newDocumentBuilder()
				.newDocument();
		} catch (ParserConfigurationException e) {
			throw new IllegalStateException(e);
		}

		root = document.createElement("items");
		document.appendChild(root);
	}

	public void addItem(String name, String value) {
		Document document = root.getOwnerDocument();

		Element item = document.createElement("item");

		root.appendChild(item);

		Element nameElement = document.createElement("key");
		nameElement.appendChild(document.createTextNode(name));
		item.appendChild(nameElement);

		Element valueElement = document.createElement("value");
		valueElement.appendChild(document.createTextNode(value));
		item.appendChild(valueElement);
	}

	@Override
	public String toString() {
		try {
			Transformer transformer = TransformerFactory.newInstance()
				.newTransformer();

			transformer.setOutputProperty(OutputKeys.INDENT, "yes");
			transformer.setOutputProperty(OutputKeys.METHOD, "xml");

			StringWriter writer = new StringWriter();

			transformer.transform(
				new DOMSource(root.getOwnerDocument()),
				new StreamResult(writer));

			return writer.toString();
		} catch (TransformerException e) {
			throw new IllegalStateException(e);
		}
	}
}
