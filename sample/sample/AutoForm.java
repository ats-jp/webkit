package sample;

import static jp.ats.substrate.U.care;
import javax.servlet.ServletRequest;
import jp.ats.dexter.Control;
import jp.ats.dexter.DexterManager;
import jp.ats.dexter.Jspod;
import jp.ats.dexter.JspodToken;
import jp.ats.dexter.annotation.Date;
import jp.ats.dexter.annotation.LengthRange;
import jp.ats.dexter.annotation.Required;
import jp.ats.dexter.annotation.SizeRange;
import jp.ats.substrate.util.Sanitizer;

@Control(forward = "ok.html")
public class AutoForm extends java.lang.Object implements Jspod {

	@Required
	@LengthRange(max = 5)
	private String lengthCheck;

	@SizeRange(max = 5)
	private String sizeCheck;

	@Required
	@Date
	private String dateCheck;

	private String numCheck;

	private String[] lengthCheckArray;

	private String[] sizeCheckArray;

	private String[] dateCheckArray;

	private String[] numCheckArray;

	private final JspodToken token;

	public AutoForm() {
		token = new JspodToken();
	}

	public AutoForm(ServletRequest request) {
		token = DexterManager.generateToken(request);

		lengthCheckArray = request.getParameterValues("lengthCheck");
		if (lengthCheckArray != null && lengthCheckArray.length == 1)
			lengthCheck = lengthCheckArray[0];

		sizeCheckArray = request.getParameterValues("sizeCheck");
		if (sizeCheckArray != null && sizeCheckArray.length == 1)
			sizeCheck = sizeCheckArray[0];

		dateCheckArray = request.getParameterValues("dateCheck");
		if (dateCheckArray != null && dateCheckArray.length == 1)
			dateCheck = dateCheckArray[0];

		numCheckArray = request.getParameterValues("numCheck");
		if (numCheckArray != null && numCheckArray.length == 1)
			numCheck = numCheckArray[0];

	}

	public static AutoForm findInstance() {
		return (AutoForm) DexterManager.getJspod();
	}

	@Override
	public JspodToken token() {
		return token;
	}

	public String tokenName() {
		return DexterManager.getTokenName();
	}

	public String tokenValue() {
		return token.toString();
	}

	public void setLengthCheck(String value) {
		lengthCheck = value;
	}

	public void setLengthCheck(String[] values) {
		lengthCheckArray = values.clone();
	}

	public String getLengthCheck() {
		return lengthCheck;
	}

	public String getLengthCheck(int index) {
		return lengthCheckArray[index];
	}

	public String[] getLengthCheckArray() {
		return lengthCheckArray.clone();
	}

	public String getLengthCheckSafely() {
		return care(Sanitizer.sanitize(getLengthCheck()));
	}

	public String getLengthCheckSafely(int index) {
		return care(Sanitizer.sanitize(getLengthCheck(index)));
	}

	public String[] getLengthCheckArraySafely() {
		String[] array = getLengthCheckArray();
		String[] result = new String[array.length];
		for (int i = 0; i < array.length; i++) {
			result[i] = care(Sanitizer.sanitize(array[i]));
		}

		return result;
	}

	public void setSizeCheck(String value) {
		sizeCheck = value;
	}

	public void setSizeCheck(String[] values) {
		sizeCheckArray = values.clone();
	}

	public String getSizeCheck() {
		return sizeCheck;
	}

	public String getSizeCheck(int index) {
		return sizeCheckArray[index];
	}

	public String[] getSizeCheckArray() {
		return sizeCheckArray.clone();
	}

	public String getSizeCheckSafely() {
		return care(Sanitizer.sanitize(getSizeCheck()));
	}

	public String getSizeCheckSafely(int index) {
		return care(Sanitizer.sanitize(getSizeCheck(index)));
	}

	public String[] getSizeCheckArraySafely() {
		String[] array = getSizeCheckArray();
		String[] result = new String[array.length];
		for (int i = 0; i < array.length; i++) {
			result[i] = care(Sanitizer.sanitize(array[i]));
		}

		return result;
	}

	public void setDateCheck(String value) {
		dateCheck = value;
	}

	public void setDateCheck(String[] values) {
		dateCheckArray = values.clone();
	}

	public String getDateCheck() {
		return dateCheck;
	}

	public String getDateCheck(int index) {
		return dateCheckArray[index];
	}

	public String[] getDateCheckArray() {
		return dateCheckArray.clone();
	}

	public String getDateCheckSafely() {
		return care(Sanitizer.sanitize(getDateCheck()));
	}

	public String getDateCheckSafely(int index) {
		return care(Sanitizer.sanitize(getDateCheck(index)));
	}

	public String[] getDateCheckArraySafely() {
		String[] array = getDateCheckArray();
		String[] result = new String[array.length];
		for (int i = 0; i < array.length; i++) {
			result[i] = care(Sanitizer.sanitize(array[i]));
		}

		return result;
	}

	public void setNumCheck(String value) {
		numCheck = value;
	}

	public void setNumCheck(String[] values) {
		numCheckArray = values.clone();
	}

	public String getNumCheck() {
		return numCheck;
	}

	public String getNumCheck(int index) {
		return numCheckArray[index];
	}

	public String[] getNumCheckArray() {
		return numCheckArray.clone();
	}

	public String getNumCheckSafely() {
		return care(Sanitizer.sanitize(getNumCheck()));
	}

	public String getNumCheckSafely(int index) {
		return care(Sanitizer.sanitize(getNumCheck(index)));
	}

	public String[] getNumCheckArraySafely() {
		String[] array = getNumCheckArray();
		String[] result = new String[array.length];
		for (int i = 0; i < array.length; i++) {
			result[i] = care(Sanitizer.sanitize(array[i]));
		}

		return result;
	}
}
