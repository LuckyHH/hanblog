var weibo = ku.getByClass('btn btn1')[0];
var wechat = ku.getByClass('btn btn2')[0];
var qq = ku.getByClass('btn btn3')[0];
var sidebar = ku.getByClass('sidebar')[0];
var move_box = ku.getByClass('move_box')[0];

//设置划出框的宽高
function init_box(){
	var bar_width = parseInt(ku.getStyle(sidebar,'width'));
	var box_width = parseInt(bar_width*0.7);
	move_box.style.width = box_width+'px';
	move_box.style.height = box_width+'px';
	move_box.style.left = -box_width+'px';
	return {box_width,bar_width};
}

var _width = init_box();
var target_position = parseInt((_width.bar_width - _width.box_width)/2);

//点击的时候，背景图变化（通过改变类名）
weibo.onclick = function(){
	contralMove('move_box weibo',['move_box wechat','move_box qq']);
}
wechat.onclick = function(){
	contralMove('move_box wechat',['move_box weibo','move_box qq']);
} 
qq.onclick = function(){
	contralMove('move_box qq',['move_box wechat','move_box weibo']);
}


//控制图片
function contralMove(obj,other){
	var position = parseInt(ku.getStyle(move_box,'left'));
	//判断当前是哪个背景
	if ((move_box.className == other[0])||(move_box.className==other[1])) {
		//判断当前背景位置
		if (position == target_position) {		
			sidebarMove(-_width.box_width);
		}

		var time =setInterval(function(){
			var position = parseInt(ku.getStyle(move_box,'left'));	
			if(position == -_width.box_width){		
				move_box.className = obj;
				sidebarMove(target_position);	
				clearInterval(time);			
			}			
		},25);

	}else{
			move_box.className = obj;		
			if (position == target_position) {
				sidebarMove(-_width.box_width);	
			}else if(position == -_width.box_width){
				sidebarMove(target_position);
			}		
	}
}


//控制移动
var timer = null;
function sidebarMove(target){
	clearInterval(timer);	
	timer = setInterval(function(){
		var position = parseInt(ku.getStyle(move_box,'left'));
		var speed = (target - position)/4;
		speed = speed > 0?Math.ceil(speed):Math.floor(speed);
		if (speed == 0) {
			clearInterval(timer);
		}else{
			move_box.style.left = position + speed + 'px';
		}	
	},25);
}