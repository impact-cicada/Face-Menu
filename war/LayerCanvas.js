//// --------------- Global --------------- ////
// 画像ロードイベント
function onLoad(){
	if(cvMgr.loadedCount == cvMgr.layers.length){
		cvMgr.repaint();
	}
	cvMgr.loadedCount++;
};

// マウスダウン
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

// マウス移動
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
		cvMgr.repaint();
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

// マウスアップ
function onUp(e) {
	cvMgr.dragLayer = -1; // ドラッグ終了
};

// 文章フォントサイズ スピンボックス変化
function onChange_spinStc() {
	cvMgr.repaint();
}

// 幅スピンボックス変化
function onChange_spinCvW() {
	var width = cvMgr.spinTileW.value;
	var numX = cvMgr.spinNumX.value;
	cvMgr.canvas.setAttribute("width", (width * numX));
	cvMgr.repaint();
};

// 高さスピンボックス変化
function onChange_spinCvH() {
	var height = cvMgr.spinTileH.value;
	var numY = cvMgr.spinNumY.value;
	cvMgr.canvas.setAttribute("height", (height * numY));
	cvMgr.repaint();
};

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

// 指定座標が画像描画領域内にあるか判定
//  true :領域内
//  false:領域外
Layer.prototype.has = function(tgtX, tgtY){
	return (this.cvX < tgtX && tgtX < (this.cvX + this.cvW) && this.cvY < tgtY && tgtY < (this.cvY + this.cvH))
};

//// --------------- CanvasManager Class --------------- ////
var CanvasManager = function(stcSize, width, height, numX, numY){
	this.sentence = 'あなたの気分に合った顔の表情の番号に〇をつけてください。';
	this.loadedCount = 1;
	this.canvas = document.getElementById('canvas');
	this.spinStc = document.getElementById('stc_size');
	this.spinTileW = document.getElementById('tile_width');
	this.spinTileH = document.getElementById('tile_height');
	this.spinNumX = document.getElementById('num_x');
	this.spinNumY = document.getElementById('num_y');
	this.context = this.canvas.getContext('2d');
	this.layers = [];
	this.dragLayer = -1;
	this.relX = 0;
	this.relY = 0;

	this.canvas.setAttribute("width", (width * numX));
	this.canvas.setAttribute("height", (height * numY));
	this.canvas.addEventListener('mousedown', onDown, false);
	this.canvas.addEventListener('mousemove', onMove, false);
	this.canvas.addEventListener('mouseup', onUp, false);
	this.spinStc.value = stcSize;
	this.spinStc.addEventListener('change', onChange_spinStc, false);
	this.spinTileW.value = width;
	this.spinTileW.addEventListener('change', onChange_spinCvW, false);
	this.spinTileH.value = height;
	this.spinTileH.addEventListener('change', onChange_spinCvH, false);
	this.spinNumX.value = numX;
	this.spinNumX.addEventListener('change', onChange_spinCvW, false);
	this.spinNumY.value = numY;
	this.spinNumY.addEventListener('change', onChange_spinCvH, false);
};

// 画像登録
CanvasManager.prototype.addLayer = function(srcs, x, y, w, h){
	this.layers.push(new Layer(srcs, x, y, w, h));
};

// 再描画
CanvasManager.prototype.repaint = function() {
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // キャンバスをクリア
	this.drawLayers();
	this.drawSentence();
};

// 全レイヤー描画
CanvasManager.prototype.drawLayers = function(){
	var layer;
	for(var i in this.layers){
		layer = this.layers[i];
		console.log('drawLayers() ' + layer.image.src + ' x:'+layer.cvX + ' y:'+layer.cvY + ' w:'+layer.cvW + ' h:'+layer.cvH);
		this.context.drawImage(layer.image, layer.cvX, layer.cvY, layer.cvW, layer.cvH);
	}
};

// 文章描画
CanvasManager.prototype.drawSentence = function(){
	this.context.font = this.spinStc.value + 'px serif';
	this.context.textAlign = 'left';
	this.context.fillText(this.sentence, 0, this.spinStc.value);
}
