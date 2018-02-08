//库文件

//获取元素ID
var ku = {};
ku.$ = function(str){return document.getElementById(str);}

//通过类名获取元素
//bug class = "A B";
ku.getByClass = function(clsName,parentId){
	// if(document.getElementsByClassName){
	// 	return document.getElementsByClassName(clsName);
	// }else{
		var oparent = parentId ? ku.$(parentId) : document;
		var temp = [];
		var temp2 = oparent.getElementsByTagName("*");
		for (var i = 0; i < temp2.length; i++) {
			if(temp2[i].className == clsName){
				temp.push(temp2[i]);
			}
		}
		return temp;		
	// }

}

//事件处理程序。包括事件添加，获取事件，获取事件来源，阻止默认行为，移除添加的事件和阻止冒泡。
var EventUtil = {
	addHandler : function(element,type,handler){
		if (element.addEventListener) {
			element.addEventListener(type,handler,false);
		}else if(element.attachEvent){
			element.attachEvent('on'+type,handler);
		}else{
			element['on'+type] = handler;
		}
	},

	getEvent : function(event){
		return event ? event : window.event;
	},

	getTarget: function(event){
            return event.target || event.srcElement;
	},

    preventDefault: function(event){
        if (event.preventDefault){
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },

    removeHandler : function(element,type,handler){
		if (element.addEventListener) {
			element.removeEventListener(type,handler,false);
		}else if(element.attachEvent){
			element.detachEvent('on'+type,handler);
		}else{
			element['on'+type] = null;
		}
	},

	stopPropagation : function(event){
		if (event.stopPropagation) {
			event.stopPropagation();
		}else{
			event.cancelBubble = true;
		}
	}
}
//获取样式
ku.getStyle = function(obj,attr){
	if (obj.currentStyle) {					//IE
		return obj.currentStyle[attr];
	}
	else {
		return getComputedStyle(obj,false)[attr];		//Other
	}
}

ku.insertAfter = function (newElement,targetElement){
	var parent = targetElement.parentNode;
	if(parent.lastChild == targetElement){
		parent.appendChild(newElement);
	}else{
		parent.insertBefore(newElement,targetElement.nextSibling);
	}
}








