    var comment_name = ku.getByClass('comment_name')[0];
    var comment_email = ku.getByClass('comment_email')[0];
    var comment_website = ku.getByClass('comment_website')[0];
    var comment_connent = ku.getByClass('comment_connent')[0];
    var has_log_in = ku.getByClass('has_log_in')[0];
    var hello_name = ku.getByClass('hello_name')[0];
    var imessage = ku.getByClass('message')[0];
    var isubmit = ku.getByClass('isubmit')[0];

    isubmit.onclick = function(e){
        var e = EventUtil.getEvent(e);
        imessage.style.display = 'none';
        var showmsg = function(msg){
            imessage.style.display = 'block';
            imessage.innerHTML = ''+msg ;
            EventUtil.preventDefault(e);
        }
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("name", comment_name.value);
            localStorage.setItem("email", comment_email.value);
            localStorage.setItem("website", comment_website.value);
        } 

//用户名和评论内容检测
        if(comment_name.value == '' || comment_connent.value == ''){
            showmsg('输入不完整');     
        }else if(comment_name.value == 'null' || comment_name.value == 'undefined'){
            showmsg('用户名输入不合法')           
        }
//邮箱检测
        // if(comment_email.value == ''){}
        // else if(!/.{3,}@.{2,}\.[com|cn|net]/g.test(comment_email.value)){ 
        //     showmsg('邮箱输入不正确');
        // }
//网址检测
        // if (comment_website.value == '') {}
        // else if(!/http:\/\/.{2,}\..{2,}|https:\/\/.{2,}\..{2,}/g.test(comment_website.value)){
        //     showmsg('网址输入不正确');
        // } 
}


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



