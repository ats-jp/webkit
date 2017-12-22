;(function($) {

	//パラメータ 減速値
	$.fn.dragScroll = function(decrease) {

		//function起動のためのハンドラ
		var dragScroll = {};

		//スクロール領域を他の場所から参照するために保存
		var target = $(this);

		//デフォルト減速値
		var defaultDecrease = 7000;

		//速度の最大値
		var maxVelocity = 4000;

		//マウス押下中
		var downNow = false;

		//一時停止中
		var suspendNow = false;

		//マウス押下位置
		var downX = 0;
		var downY = 0;

		//マウス押下時スクロール量
		var scrollLeft = 0;
		var scrollTop = 0;

		//アニメーション速度
		var timestep = 1 / 60;

		//アニメーション実行間隔（ミリ秒）
		var interval = timestep * 1000;

		//アニメーション関数のsetInterval ID
		var timerID;

		//ワンステップ前のポインタ位置
		var justBeforeX = 0;
		var justBeforeY = 0;

		//現在ののポインタ位置
		var currentX = 0;
		var currentY = 0;

		//スクロール速度
		var velocityX = 0;
		var velocityY = 0;

		//現在のスクロール位置
		var currentScrollLeft = 0;
		var currentScrollTop = 0;

		//ワンステップ前のスクロール位置
		var justBeforeScrollLeft = 0;
		var justBeforeScrollTop = 0;

		var myDecrease;
		if (decrease == null) {
			myDecrease = defaultDecrease;
		} else {
			myDecrease = decrease;
		}

		myDecrease *= timestep;

		var scrollCallback;

		var stopCallback;

		//スクロールアニメーション関数
		var updateScroll = function() {
			//マウス押下中と一時停止中の場合、なにもしない
			if (downNow || suspendNow) return;

			//スクロール量を計測
			justBeforeScrollLeft = currentScrollLeft;
			currentScrollLeft = target.scrollLeft();
			justBeforeScrollTop = currentScrollTop;
			currentScrollTop = target.scrollTop();

			//XY共にスクロールしていない場合（角に到達した等）
			if (justBeforeScrollLeft == currentScrollLeft && justBeforeScrollTop == currentScrollTop) {
				stopScrollFunction();
				return;
			}

			var isStop = false;
			//減速値を下回った場合、強制的に0に
			if (myDecrease > Math.abs(velocityX)) {
				velocityX = 0;
				isStop = true;
			} else {
				//減速
				velocityX -= (velocityX > 0 ? 1 : -1) * myDecrease;
			}

			//減速値を下回った場合、強制的に0に
			if (myDecrease > Math.abs(velocityY)) {
				velocityY = 0;
				isStop &= true;
			} else {
				//減速
				velocityY -= (velocityY > 0 ? 1 : -1) * myDecrease;
			}

			//XY両速度が0の場合
			if (isStop) {
				stopScrollFunction();
				return;
			}

			//今回スクロール分
			var moveX = -1 * velocityX * timestep;
			var moveY = -1 * velocityY * timestep;

			target.scrollLeft(target.scrollLeft() + Math.round(moveX));
			target.scrollTop(target.scrollTop() + Math.round(moveY));

			//スクロール位置を通知
			if (scrollCallback) {
				scrollCallback(target.scrollLeft(), target.scrollTop());
			}
		};

		//スクロールアニメーションを停止させる
		var stopScrollFunction = function() {
			if (!timerID) return;
			clearInterval(timerID);
			timerID = null;
			velocityX = 0;
			velocityY = 0;
			if (stopCallback) stopCallback(target);
		};

		//スクロールアニメーションを一時停止させる
		var suspendScrollFunction = function() {
			suspendNow = true;
			if (!timerID) return;
			clearInterval(timerID);
			timerID = null;
		};

		//スクロールを再開させる
		var resumeScrollFunction = function() {
			suspendNow = false;
			if (timerID != null) return;
			timerID = setInterval(updateScroll, interval);
		};

		//マウス押下時のイベントハンドラ
		var mousedownFunction = function(event) {
			//一時停止中の場合、なにもしない
			if (suspendNow) return false;

			stopScrollFunction();

			timerID = setInterval(updateScroll, interval);

			downNow = true;

			downX = event.clientX;
			downY = event.clientY;

			scrollLeft = target.scrollLeft();
			scrollTop = target.scrollTop();

			return false;
		};

		//現在の方式を保存
		var oldOverflow = target.css("overflow");

		var lastUpdate = 0;

		//マウス移動時のイベントハンドラ
		var mousemoveFunction = function(event) {
			//一時停止中の場合、なにもしない
			if (suspendNow) return;

			justBeforeX = currentX;
			currentX = event.clientX;

			justBeforeY = currentY;
			currentY = event.clientY;

			if (downNow) {
				//押下時のマウス速度を計算
				//速度は最大値以下に丸められる
				velocityX = (currentX - justBeforeX) / timestep;
				var absVelocityX = Math.abs(velocityX);
				velocityX = (absVelocityX > maxVelocity ? maxVelocity : absVelocityX) * (velocityX < 0 ? -1 : 1);

				velocityY = (currentY - justBeforeY) / timestep;
				var absVelocityY = Math.abs(velocityY);
				velocityY = (absVelocityY > maxVelocity ? maxVelocity : absVelocityY) * (velocityY < 0 ? -1 : 1);

				//マウスに追従
				target.scrollLeft(scrollLeft + downX - event.clientX);
				target.scrollTop(scrollTop + downY - event.clientY);

				//スクロール位置を通知
				if (scrollCallback) {
					scrollCallback(target.scrollLeft(), target.scrollTop());
				}

				return false;
			} else {
				//マウスを動かすとsetIntervalに登録した関数の実行が阻害されるブラウザ向け
				//ただし、定義された実行間隔以上に実行されないようにしている
				if (new Date().getTime() - lastUpdate >= interval) updateScroll();
				lastUpdate = new Date().getTime();
			}
		};

		//マウス開放時のイベントハンドラ
		var mouseupFunction = function (event) {
			//一時停止中の場合、なにもしない
			if (suspendNow) return;

			justBeforeX = currentX;
			justBeforeY = currentY;
			downNow = false;
		};

		var freeFunction = function() {downNow = false};

		var startDragScroll = false;

		//dragScrollを開始する
		dragScroll.start = function() {
			if (startDragScroll) return;

			target.mousedown(mousedownFunction).css({
				overflow: "hidden"
			});

			//スクロール領域を超えても動作するようにdocumentのイベントハンドラとして登録
			$(document).mousemove(mousemoveFunction).mouseup(mouseupFunction);

			//動作中に
			startDragScroll = true;

			return dragScroll;
		}

		//dragScrollを停止する
		dragScroll.stop = function() {
			//動作中でない場合、なにもしない
			if (!startDragScroll) return;

			//スクロールアニメーションをストップ
			stopScrollFunction();

			target.unbind("mousedown", mousedownFunction);

			//スクロールバーを元に戻す
			target.css({overflow: oldOverflow});

			$(document).unbind(
				"mousemove",
				mousemoveFunction
			).unbind(
				"mouseup",
				mouseupFunction);

			//動作中を解除
			startDragScroll = false;

			return dragScroll;
		};

		//dragScrollの動作を切替える
		dragScroll.toggle = function() {
			//動作中かどうか
			if (!startDragScroll) {
				dragScroll.start();
			} else {
				dragScroll.stop();
			}

			return dragScroll;
		};

		//スクロールアニメーションを一時停止する
		dragScroll.suspend = function() {
			if (!startDragScroll) return;
			suspendScrollFunction();
			return dragScroll;
		};

		//スクロールアニメーションを再開する
		dragScroll.resume = function() {
			if (!startDragScroll) return;
			resumeScrollFunction();
			return dragScroll;
		};

		//スクロール位置を取得するコールバックを登録
		dragScroll.registScrollCallback = function(callback) {
			scrollCallback = callback;
			return dragScroll;
		};

		//スクロールの停止を取得するコールバックを登録
		dragScroll.registStopCallback = function(callback) {
			stopCallback = callback;
			return dragScroll;
		};

		//マウス押下状態を解放する
		dragScroll.free = function() {
			freeFunction();
			return dragScroll;
		};

		return dragScroll;
	};
})(jQuery);
