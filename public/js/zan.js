      var ext_zan = ku.$('ext_zan');
      var background_id = ku.getByClass('background_id')[0].innerHTML;
      var store_title = ku.$('artical_detiail_title').innerHTML ; 
      var zan = ku.getByClass('zan')[0];
      var cai = ku.getByClass('cai')[0];

      EventUtil.addHandler(ext_zan,'click',function(e){
        var e = EventUtil.getEvent(e);
        var target = EventUtil.getTarget(e);
        function _post_(type,id){
              var url = "/small/"+type+"/"+id;
              var xmlhttp=new XMLHttpRequest();
              xmlhttp.onreadystatechange=function(){
                if (xmlhttp.readyState==4 && xmlhttp.status==200){
                    if (type === 'zan') {
                      zan.innerHTML='👍 '+xmlhttp.responseText;
                    }else{
                      cai.innerHTML='👎 '+xmlhttp.responseText;
                    }
                    
                }
              }
              xmlhttp.open("post",url,true);
              xmlhttp.send();
        }

      if(localStorage.getItem('already') === store_title){
          alert('别再点了，逗比');
      }else{
        localStorage.setItem('already',store_title);
        if(target.className === 'zan'){
          _post_('zan',background_id);
        }else if(target.className === 'cai'){
          _post_('cai',background_id);
        }
      }
    })