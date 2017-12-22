var Dexter = Class.create({

	//フォーム入力値の監視間隔（秒）
	observeFrequency: 0.3,

	//dexterへのパス
	url: null,

	//対象となるフォーム
	form: null,

	//送信ボタン
	submitElement: null,

	//送信時のカスタム割込処理
	submitControlFunction: null,

	//説明消去用タイマーID
	timeoutID: null,

	//説明表示div
	descriptionArea: null,

	//対象入力エレメントと検証メッセージ表示divを保持する連想配列
	messageAreas: null,

	//検証メッセージを非表示にしておくフラグ
	hideMessages: false,

	//検証メッセージの表示位置（デフォルトは入力欄の下）
	messagePosition: null,

	//説明表示を自動的にする／しない
	autoDescription: true,

	//説明のスタイルを変更する場合はこの関数を上書きすること
	decorateDescription: function(validatorNodes) {
		var descriptionBody = "<table>";
		for (var i = 0; i < validatorNodes.length; i++) {
			var myDescription = "";
			if (validatorNodes[i].firstChild) myDescription = validatorNodes[i].firstChild.nodeValue;
			descriptionBody += "<tr><th>" + validatorNodes[i].getAttribute("name") + "</th><td>&nbsp;:&nbsp;</td><td>" + myDescription + "</td></tr>";
		}
		descriptionBody += "</table>";

		this.descriptionArea.innerHTML = descriptionBody;
	},

	//検証メッセージの表示位置を変更する場合はこの関数を上書きすること
	adjustPosition: function(element, messageArea) {
		var offset = element.cumulativeOffset();
		var position = [offset.left, offset.top];
		position.push(position[0] + element.offsetWidth);
		position.push(position[1] + element.offsetHeight);
		Element.setStyle(messageArea, {
			left: position[this.messagePosition[0]] + "px",
			top: position[this.messagePosition[1]] + "px"});
	},

	//検証処理を開始する
	start: function() {
		this.iterateElements(function(element) {
			this.validate(element);
			element.dexterInstance = this;
			new Form.Element.Observer(element, this.observeFrequency, this.validate.bind(this));

			if (this.autoDescription) {
				Event.observe(element, "mouseover", this.executeDescription.bind(this), false);
			}

			Event.observe(element, "mouseout", function() {
				this.hideDescription();
			}.bind(this));
		}.bind(this));

		return this;
	},

	//start後に検証対象が増えた場合に再度startする
	restart: function() {
		for (var key in this.messageAreas) {
			var messageArea = this.messageAreas[key]["message"];
			messageArea.parentNode.removeChild(messageArea);
		}
		this.messageAreas = {};
		this.start();
	},

	//HTMLのダイナミックな変更等で検証メッセージの表示位置がずれた場合、全ての位置調整を行う
	adjustAllValidationMessages: function() {
		for (var key in this.messageAreas) {
			var value = this.messageAreas[key];
			this.adjustPosition(value["drawOn"], value["message"]);
		}
	},

	//検証メッセージのあるもののみ表示する
	showAllValidationMessages: function() {
		this.hideMessages = false;
		for (var key in this.messageAreas) {
			if (this.messageAreas[key]["validationSuccess"] == "true") continue;
			this.messageAreas[key]["message"].show();
		}
	},

	//全ての検証メッセージを非表示にする
	hideAllValidationMessages: function() {
		this.hideMessages = true;
		for (var key in this.messageAreas) {
			this.messageAreas[key]["message"].hide();
		}
	},

	//検証メッセージの表示位置を下に変更する
	changeMessagePositionToBottom: function() {
		this.messagePosition = [0, 3];
	},

	//検証メッセージの表示位置を右に変更する
	changeMessagePositionToRight: function() {
		this.messagePosition = [2, 1];
	},

	//初期化子
	initialize: function(dexterURL, form, submitElement, submitControlFunction) {
		if (dexterURL == null || form == null) return;
		this.url = dexterURL;
		this.form = $(form),
		this.submitElement = $(submitElement);
		this.submitControlFunction = submitControlFunction;
		this.messageAreas = {};
		this.changeMessagePositionToBottom();
	},

	drawValidationMessage: function(element, validationSuccess, validationMessage, drawOn) {
		var currentDrawOn;
		if (drawOn) {
			currentDrawOn = drawOn;
		} else {
			currentDrawOn = element;
		}

		var messageValues = this.messageAreas[element.id];
		var messageArea;
		if (!messageValues) {
			messageArea = $(document.createElement("div"));
			document.body.appendChild(messageArea);
			Element.addClassName(messageArea, "dexterValidationMessage");
			
			this.messageAreas[element.id] = {
				drawOn: currentDrawOn,
				message: messageArea,
				validationSuccess: validationSuccess};

			//先にdescriptionAreaが表示されていた場合、descriptionAreaが後方に表示されないように削除する
			if (this.descriptionArea != null) {
				document.body.removeChild(this.descriptionArea);
				this.descriptionArea = null;
			}
		} else {
			var messageArea = this.messageAreas[element.id]["message"];
			messageValues["validationSuccess"] = validationSuccess;
		}

		if (!validationSuccess || (validationMessage != null && validationMessage.length > 0)) {
			messageArea.innerHTML = validationMessage;
			this.adjustPosition(currentDrawOn, messageArea);
			if (this.hideMessages) {
				messageArea.hide();
			} else {
				messageArea.show();
			}
		} else {
			messageArea.hide();
		}
	},

	executeDescription: function(event) {
		this.executeDescriptionInternal(Event.pointerX(event), Event.pointerY(event), Event.element(event));
	},

	showDescription: function(x, y, validatorNodes, element) {
		if (this.timeoutID) clearTimeout(this.timeoutID);
		if (validatorNodes.length == 0) return;

		//z-indexがうまく効かないブラウザ用にvalidationMessage要素より後に作成するようにする
		if (this.descriptionArea == null) {
			this.descriptionArea = $(document.createElement("div"));
			document.body.appendChild(this.descriptionArea);
			Element.addClassName(this.descriptionArea, "dexterDescription");
		}

		this.decorateDescription(validatorNodes);

		//iframe内の場合、スクロールバーを出さないように
		//取敢えず(0, 0)にしておく
		Element.setStyle(this.descriptionArea, {
			left: "0px",
			top: "0px"
		});

		//先にshowしないと、offsetWidthが取れない
		this.descriptionArea.show();

		//画面からはみ出した時の調整
		if (x + 5 + this.descriptionArea.offsetWidth > document.body.clientWidth) {
			var left = document.body.clientWidth - this.descriptionArea.offsetWidth;
			Element.setStyle(this.descriptionArea, {left: (left < 0 ? 0 : left) + "px"});
		} else {
			Element.setStyle(this.descriptionArea, {left: (x + 5) + "px"});
		}

		//フォーム要素にかかった時の調整
		var bottomPosition = element.offsetHeight + element.cumulativeOffset().top;
		if (y + 10 < bottomPosition) {
			Element.setStyle(this.descriptionArea, {top: bottomPosition + "px"});
		} else {
			Element.setStyle(this.descriptionArea, {top: (y + 10) + "px"});
		}

		this.timeoutID = setTimeout(this.hideDescription.bind(this), 3000);
	},

	toggleDescription: function(element) {
		if (this.timeoutID) clearTimeout(this.timeoutID);

		if (this.descriptionArea != null && this.descriptionArea.visible()) {
			this.descriptionArea.hide();
			return;
		}

		var offset = element.cumulativeOffset();
		var position = [offset.left, offset.top];

		position.push(position[0] + element.offsetWidth);
		position.push(position[1] + element.offsetHeight);

		this.executeDescriptionInternal(
			position[this.messagePosition[0]] - 5,
			position[this.messagePosition[1]] - 10,
			element);
	},

	hideDescription: function() {
		if (this.descriptionArea != null) this.descriptionArea.hide();
	},

	deisableAutoDescription: function() {
		this.autoDescription = false;
	},

	enableAutoDescription: function() {
		this.autoDescription = true;
	},

	executeDescriptionInternal: function(x, y, element) {
		var receiveResponse = function(response) {
			var document = response.responseXML;
			this.normalizeResponseXML(document);
			if (!document.getElementsByTagName("resultAvailable")[0].firstChild.nodeValue) return;

			var validatorNodes = document.getElementsByTagName("descriptions")[0];
			if (validatorNodes != null) {
				this.showDescription(x, y, validatorNodes.childNodes, element);
			}
		}.bind(this);

		new Ajax.Request(
			this.url, {
				method: "post",
				postBody:
					"action=" + encodeURIComponent(this.createAbsolutePath(this.form.action)) +
					"&name=" + encodeURIComponent(element.name) +
					"&validate=false",
				onComplete: receiveResponse
			}
		);
	},

	validate: function(element) {
		if (this.drawValidationMessage == null || this.url == null) return;

		var receiveResponse = function(response) {
			var document = response.responseXML;
			this.normalizeResponseXML(document);
			var resultAvailable = document.getElementsByTagName("resultAvailable")[0].firstChild.nodeValue;
			if (resultAvailable == "false") return;

			var message = "";
			var messageNode = document.getElementsByTagName("validationMessage")[0].firstChild;
			if (messageNode != null) {
				message = messageNode.nodeValue;
			}

			var validationSuccess = document.getElementsByTagName("valid")[0].firstChild.nodeValue;
			if (validationSuccess == "true") {
				element.dexterValidationFailure = false;
				this.enableSubmitElement();
			} else {
				element.dexterValidationFailure = true;
				if (this.submitElement != null) {
					if (this.submitControlFunction) {
						this.submitControlFunction(true, this.submitElement);
					} else {
						this.submitElement.disabled = true;
					}
				}
			}

			var drawOnElement;
			var drawOnNode = document.getElementsByTagName("drawOn")[0].firstChild;
			if (drawOnNode != null) drawOnElement = $(drawOnNode.nodeValue);

			this.drawValidationMessage(
				element,
				validationSuccess,
				message,
				drawOnElement).bind(this);
		}.bind(this);

		try {
			new Ajax.Request(
				this.url, {
					method: "post",
					postBody:
						"action=" + encodeURIComponent(this.createAbsolutePath(element.form.action)) +
						"&name=" + encodeURIComponent(element.name) +
						"&validate=true&value=" + encodeURIComponent(element.value),
					onComplete: receiveResponse
				}
			);
		} catch (exception) {}
	},

	iterateElements: function(func) {
		var elements = Form.getElements(this.form);
		for (var i = 0; i < elements.length; i++) {
			if (!elements[i].name) continue;
			func(elements[i], this.form);
		}
	},

	normalizeResponseXML: function(document) {
		if (typeof(document.normalize) != "undefined") {
			document.normalize();
		}
	},

	createAbsolutePath: function(path) {
		if (path.match(/^\//)) return path;
		path = path.match(/[^\/]+$/);
		return window.location.pathname.replace(/[^\/]+$/, "") + path;
	},

	enableSubmitElement: function() {
		if (this.submitElement == null) return;

		var ok = true;
		this.iterateElements(function(element) {
			if (element.dexterValidationFailure == true) ok = false;
		});

		if (ok) {
			if (this.submitControlFunction) {
				this.submitControlFunction(false, this.submitElement);
			} else {
				this.submitElement.disabled = false;
			}
		}
	}
});
