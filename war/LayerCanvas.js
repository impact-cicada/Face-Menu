//// --------------- Layer Class --------------- ////
var Layer = function(src, cvX, cvY, cvW, cvH){
	this.image = new Image();
	this.image.src = src;
	this.image.addEventListener('load', onLoad, false);
	this.cvX = cvX;
	this.cvY = cvY;
	this.cvW = cvW;
	this.cvH = cvH;
};

function onLoad(){
	if(cvMgr.loadedCount == cvMgr.layers.length){
		cvMgr.drawLayers();
	}
	cvMgr.loadedCount++;
};

// 画像を描画
Layer.prototype.draw = function() {
	console.log('draw() ' + this.image.src + ' x:'+this.cvX + ' y:'+this.cvY + ' w:'+this.cvW + ' h:'+this.cvH);
	cvMgr.context.drawImage(this.image, this.cvX, this.cvY, this.cvW, this.cvH);
};

// 指定座標が画像描画領域内にあるか判定
//  true :領域内
//  false:領域外
Layer.prototype.has = function(tgtX, tgtY){
	return (this.cvX < tgtX && tgtX < (this.cvX + this.cvW) && this.cvY < tgtY && tgtY < (this.cvY + this.cvH))
};

//// --------------- CanvasManager Class --------------- ////
var CanvasManager = function(){
	this.loadedCount = 1;
	this.canvas = document.getElementById('canvas');
	this.context = this.canvas.getContext('2d');
	this.layers = [];
	this.dragLayer = -1;
	this.relX = 0;
	this.relY = 0;

	this.canvas.addEventListener('mousedown', onDown, false);
	this.canvas.addEventListener('mousemove', onMove, false);
	this.canvas.addEventListener('mouseup', onUp, false);
};

//// --------------- 全レイヤー描画 --------------- ////
CanvasManager.prototype.drawLayers = function(){
	for(var i in this.layers){
		this.layers[i].draw();
	}
};

//// --------------- マウスダウン --------------- ////
function onDown(e) {
	// キャンバスの左上端の座標を取得
	var offsetX = cvMgr.canvas.getBoundingClientRect().left;
	var offsetY = cvMgr.canvas.getBoundingClientRect().top;

	// マウスが押された座標を取得
	var tgtX = e.clientX - offsetX;
	var tgtY = e.clientY - offsetY;

	// 画像上の座標かどうかを判定
	for(var i = (cvMgr.layers.length - 1); 0 <= i; i--){
		if(cvMgr.layers[i].has(tgtX, tgtY)){
			cvMgr.dragLayer = i; // ドラッグ開始
			cvMgr.relX = cvMgr.layers[i].cvX - tgtX;
			cvMgr.relY = cvMgr.layers[i].cvY - tgtY;
			break;
		}
	}
};

//// --------------- マウス移動 --------------- ////
function onMove (e) {
	// キャンバスの左上端の座標を取得
	var offsetX = cvMgr.canvas.getBoundingClientRect().left;
	var offsetY = cvMgr.canvas.getBoundingClientRect().top;

	// マウスが移動した先の座標を取得
	var tgtX = e.clientX - offsetX;
	var tgtY = e.clientY - offsetY;

	// ドラッグが開始されていればオブジェクトの座標を更新して再描画
	if(0 <= cvMgr.dragLayer){
		cvMgr.layers[cvMgr.dragLayer].cvX = tgtX + cvMgr.relX;
		cvMgr.layers[cvMgr.dragLayer].cvY = tgtY + cvMgr.relY;
		cvMgr.drawRect();
	}
	// ドラッグ中以外
	else{
		// 画像上の座標かどうかを判定
		var onImg = false;
		for(var i = (cvMgr.layers.length - 1); 0 <= i; i--){
			if(cvMgr.layers[i].has(tgtX, tgtY)){
				onImg = true;
				break;
			}
		}
		if(onImg){
			document.body.style.cursor='move';
		}else{
			document.body.style.cursor='auto';
		}
	}
};

//// --------------- マウスアップ --------------- ////
function onUp(e) {
	cvMgr.dragLayer = -1; // ドラッグ終了
};

//// --------------- 再描画 --------------- ////
CanvasManager.prototype.drawRect = function() {
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // キャンバスをクリア
	this.drawLayers();
};
