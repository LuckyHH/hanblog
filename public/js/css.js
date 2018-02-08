function tryf(){
    preloadimages(['/images/qq.jpg','/images/weibo.jpg','/images/wechat.jpg']).done();
}
window.onload = function(){
    tryf();
}
function preloadimages(arr){   
    var newimages=[], loadedimages=0;
    var loaded=0 , loaderr = 0;
    var postaction=function(img){
        console.log("加载完成,加载了"+img.length+"张图片");
    }
    var arr=(typeof arr!="object")? [arr] : arr;
    function imageloadpost(flag){
        if(!flag){
            tryf();
        }else{
            loadedimages++;           
        }
        if (loadedimages==arr.length){
            postaction(newimages);
        }
    }
    for (var i=0; i<arr.length; i++){
        newimages[i]=new Image();
        newimages[i].src=arr[i];
        newimages[i].onload=function(){
            imageloadpost(true);
        }
        newimages[i].onerror=function(){
            imageloadpost(false);
        }
    }
    return {
        done:function(f){
            postaction=f || postaction;
        }
    }
}

//控制根字大小
function init_font_size(){
    var _width = document.documentElement.clientWidth;
    var _root = document.getElementsByTagName('body')[0];
    if (_width < 768) {
        _root.style.fontSize = 12 * _width/320+'px';
    }
}
init_font_size();
