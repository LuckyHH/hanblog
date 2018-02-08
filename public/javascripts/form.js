    var comment_wrap = ku.getByClass('comment_wrap')[0];
    var comment_board = ku.getByClass('comment_board')[0];
    var comment_name = ku.getByClass('comment_name')[0];
    var comment_email = ku.getByClass('comment_email')[0];
    var comment_website = ku.getByClass('comment_website')[0];
    var comment_connent = ku.getByClass('comment_connent')[0];
    var comment_total = ku.getByClass('comment_total_num')[0];
    var src_url = ku.$('src_url');
    var has_log_in = ku.getByClass('has_log_in')[0];
    var hello_name = ku.getByClass('hello_name')[0];
    var imessage = ku.getByClass('message')[0];
    var isubmit = ku.getByClass('isubmit')[0];


function showLogIn(){

}
    isubmit.onclick = function(e){
        var e = EventUtil.getEvent(e);
        var flag = true ;   //标志位，表示用户输入有效
        imessage.style.display = 'none';

        var showmsg = function(msg){
            imessage.style.display = 'block';
            imessage.innerHTML = ''+msg ;
            flag = false ;
        };

//用户名和评论内容检测
        if(comment_name.value == '' || comment_connent.value == ''){
            showmsg('输入不完整');
        }else if(comment_name.value == 'null' || comment_name.value == 'undefined'){
            showmsg('用户名输入不合法');
        }
// //邮箱检测
        if(comment_email.value != ''&&comment_email.value != '#'){
          if(!/.{3,}@.{2,}\.[com|cn|net]/g.test(comment_email.value)){
            showmsg('邮箱输入不正确');
          }
        }

// //网址检测
        if (comment_website.value != ''&&comment_website.value != '#'){
          if (!/http:\/\/.{2,}\..{2,}|https:\/\/.{2,}\..{2,}/g.test(comment_website.value)){
            showmsg('网址输入不正确');
          }
        }

//数据没问题，设置用户信息本地缓存
        if (flag) {
          if (typeof(Storage) !== "undefined") {
              localStorage.setItem("name", comment_name.value);
              localStorage.setItem("email", comment_email.value);
              localStorage.setItem("website", comment_website.value);
          }
          send_get_data();      //进行数据处理
        }
    };


    function send_get_data(){
        var xmlHttp = new XMLHttpRequest();
        var postData =
            "comment_name="+comment_name.value+
            '&comment_website='+comment_website.value+
            '&comment_email='+comment_email.value+
            '&comment_connent='+comment_connent.value+
            '&artical_id='+src_url.value;

        xmlHttp.open("POST", '/comment', true);
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                comment_total.innerHTML = parseInt(comment_total.innerHTML)+1;
                comment_connent.value = null;
                //传入的数据解析成对象
                var result = JSON.parse(xmlHttp.responseText);
                //保证每次插入都在第一
                var comment_board = ku.getByClass('comment_board')[0];
                var newNode = document.createElement('div');
                newNode.className = 'comment_board';
                newNode.innerHTML = `<a class="comment_user" href="${result.website}" target="_blank">${result.user}</a><div class="comment_post">${result.post}</div><p class="comment_time">${result.time}<a href="/jubao" class="report" target="_blank">举报</a>　<span class="reply">回复</span></p><div class="temp"></div>`;
                comment_wrap.insertBefore(newNode,comment_board);
                comment_total = parseInt(comment_total)+1;
            }
        };
        xmlHttp.send(postData);
        setLocalStroge();
    }


    function setLocalStroge(){
        if (localStorage.getItem("name")) {
            comment_name.value = localStorage.getItem("name");
            comment_website.value = localStorage.getItem("website")||'#';
            comment_email.value = localStorage.getItem("email")||'#';

            comment_name.style.display = 'none';
            comment_website.style.display = 'none';
            comment_email.style.display = 'none';
            has_log_in.style.display = 'block';

            hello_name.innerHTML = localStorage.getItem("name");
        }
    }
    setLocalStroge();

    function clearLocalStroge(){
      localStorage.removeItem('name');
      localStorage.removeItem('website');
      localStorage.removeItem('email');
      comment_name.style.display = 'block';
      comment_website.style.display = 'block';
      comment_email.style.display = 'block';
      has_log_in.style.display = 'none';
    }
