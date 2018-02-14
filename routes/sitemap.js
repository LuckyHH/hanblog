var express = require('express');
var sm = require('sitemap');
var events = require('events');
var Post = require('../models/post');
// var Comment = require('../models/comment');
var router = express.Router();

var getUrls = function(res){
    var urls = [];
    var getStaticUrl = function(){
      urls.push(
            { url: '/about',  changefreq: 'monthly',  priority: 0.7 },
            { url: '/archive' , changefreq: 'daily' , priority:0.7 },  
            { url: '/link' , changefreq: 'weekly' , priority:0.7 }
      );
      var sitemap = sm.createSitemap ({
        hostname: 'https://www.docmobile.cn',
        cacheTime: 600000,   
        urls: urls
      });
      sitemap.toXML( function (err, xml) {
          if (err) {
            return res.status(500).end();
          }
          res.header('Content-Type', 'application/xml');
          res.send(xml);
      });    
    }

    var getActiveUrl = function(callback){
        Post.get(null, function(err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/idx/0');
            }
            //首页页面
            var count = 0 ;
            for (var i = 0; i < posts.length; i = i + 10) {
              urls.push({ url : '/idx/'+(count++) , changefreq : 'daily' , priority : 0.8 });
            }

          //文章链接与标签种类
          var tagsOnly = [];      //标签个数
          posts.forEach(function(post){
            urls.push({ url : '/artical_detiail/'+post.user+'/'+post.id , changefreq : 'daily' , priority : 0.7});
            for (var i = 0; i < post.tags.length; i++) {
              if(tagsOnly.indexOf(post.tags[i]) == -1){
                tagsOnly.push(post.tags[i]);
              }
            }
          });


          //标签链接
          var emitter = new events.EventEmitter();
          var handle = function(numb){
            var count = 1 ;
            return function(){
              if(count == numb){
                getStaticUrl();
              }
              count++;
            }
          }
          var done  = handle(tagsOnly.length);
          emitter.on('done',done);


          for(var i = 0 ; i < tagsOnly.length ; i++){
            (function(tag){
              Post.get({tag:tag},function(err,posts){
                  if(err){
                    req.flash('error',err);
                    return res.redirect('/idx/0');
                  }
                  var count = 0 ;
                  for (var i = 0; i < posts.length; i = i + 10) {
                    urls.push({ url : '/tags/'+tag+'/'+count++ , changefreq : 'daily' , priority :0.5 });
                  }
                  emitter.emit('done');
              });               
            })(tagsOnly[i]);
          }
        });
    }    

    getActiveUrl();
}

router.get('/', function(req, res) {
  getUrls(res);
});

module.exports = router;
