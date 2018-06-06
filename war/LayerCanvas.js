//// --------------- Layer Class --------------- ////
var Layer = function(src, order, cvX, cvY, cvW, cvH){
	this.image = new Image();
	this.image.src = src;
	this.image.addEventListener('load', function(){
			if(loadedCount == layers.length){
				drawLayers();
			}
			loadedCount++;
		}, false);
	this.order = order;
	this.cvX = cvX;
	this.cvY = cvY;
	this.cvW = cvW;
	this.cvH = cvH;
};
// 画像を描画
Layer.prototype.draw = function() {
	console.log('draw() ' + this.image.src + ' x:'+this.cvX + ' y:'+this.cvY + ' w:'+this.cvW + ' h:'+this.cvH);
	context.drawImage(this.image, this.cvX, this.cvY, this.cvW, this.cvH);
};
// 指定座標が画像描画領域内にあるか判定
//  true :領域内
//  false:領域外
Layer.prototype.has = function(tgtX, tgtY){
	return (this.cvX < tgtX && tgtX < (this.cvX + this.cvW) && this.cvY < tgtY && tgtY < (this.cvY + this.cvH))
}

//// --------------- 全レイヤー描画 --------------- ////
var drawLayers = function(){
	for(var i in layers){
		layers[i].draw();
	}
};

var loadedCount = 1;
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var layers = [];
var dragLayer = -1;
var relX, relY;

canvas.addEventListener('mousedown', onDown, false);
canvas.addEventListener('mousemove', onMove, false);
canvas.addEventListener('mouseup', onUp, false);

//// --------------- マウスダウン --------------- ////
function onDown(e) {
	// キャンバスの左上端の座標を取得
	var offsetX = canvas.getBoundingClientRect().left;
	var offsetY = canvas.getBoundingClientRect().top;

	// マウスが押された座標を取得
	var tgtX = e.clientX - offsetX;
	var tgtY = e.clientY - offsetY;

	// 画像上の座標かどうかを判定
	for(var i = (layers.length - 1); 0 <= i; i--){
		if(layers[i].has(tgtX, tgtY)){
			dragLayer = i; // ドラッグ開始
			relX = layers[i].cvX - tgtX;
			relY = layers[i].cvY - tgtY;
			break;
		}
	}
}

//// --------------- マウス移動 --------------- ////
function onMove(e) {
	// キャンバスの左上端の座標を取得
	var offsetX = canvas.getBoundingClientRect().left;
	var offsetY = canvas.getBoundingClientRect().top;

	// マウスが移動した先の座標を取得
	var tgtX = e.clientX - offsetX;
	var tgtY = e.clientY - offsetY;

	// ドラッグが開始されていればオブジェクトの座標を更新して再描画
	if(0 <= dragLayer){
		layers[dragLayer].cvX = tgtX + relX;
		layers[dragLayer].cvY = tgtY + relY;
		drawRect();
	}
	// ドラッグ中以外
	else{
		// 画像上の座標かどうかを判定
		var onImg = false;
		for(var i = (layers.length - 1); 0 <= i; i--){
			if(layers[i].has(tgtX, tgtY)){
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
}

//// --------------- マウスアップ --------------- ////
function onUp(e) {
	dragLayer = -1; // ドラッグ終了
}

//// --------------- 再描画 --------------- ////
function drawRect() {
	context.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア
	drawLayers();
}
