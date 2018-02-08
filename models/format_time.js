var formatTime = function(){
  var t = new Date();
  var month = (t.getMonth()+1) > 9?(t.getMonth()+1):'0'+(t.getMonth()+1);
  var day = t.getDate()>9?t.getDate():'0'+t.getDate();
  var hour =  t.getHours()>9?t.getHours():'0'+t.getHours();
  var minute =  t.getMinutes()>9?t.getMinutes():'0'+t.getMinutes();
  var second =  t.getSeconds()>9?t.getSeconds():'0'+t.getSeconds();
  var format_time =  t.getFullYear()+'年'+month+'月'+day+'日'+hour+':'+minute+':'+second;
  return {
    t:t,
    format_time:format_time
  };
};
module.exports = formatTime;
