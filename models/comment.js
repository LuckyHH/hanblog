var mongodb = require('mongodb');
var settings = require('../settings');
// var mongodb = require('./db');
//评论用户的用户名,评论内容post,email,website,来源,评论时间
function Comment(user,post,website,email,artical_id,sort_time,time){
	var t = new Date();
    var month = (t.getMonth()+1) > 9?(t.getMonth()+1):'0'+(t.getMonth()+1);
    var day = t.getDate()>9?t.getDate():'0'+t.getDate();
    var hour =  t.getHours()>9?t.getHours():'0'+t.getHours();
    var minute =  t.getMinutes()>9?t.getMinutes():'0'+t.getMinutes();
    var second =  t.getSeconds()>9?t.getSeconds():'0'+t.getSeconds();

	this.user = user;
	this.post = post;
	this.email = email?email:'#';
	this.website = website?website:'#';
	this.artical_id = artical_id;

	if (time) {
		this.sort_time = sort_time ;
		this.time = time ;
	}else{
		this.sort_time = new Date();
		this.time = time?time:t.getFullYear()+'-'+month+'-'+day+' '+hour+':'+
		minute+':'+second;
	}

}

Comment.prototype.save = function(callback){
	var comment = {
		user : this.user,
		post : this.post,
		email : this.email,
		website : this.website,
		artical_id : this.artical_id,
		sort_time : this.sort_time,
		time : this.time
	}
    mongodb.MongoClient.connect(settings.url, function (err, db) {
		if(err){
			return callback(err);
		}
		db.collection('comments',function(err,collection){
			if (err) {
                db.close();
                return callback(err);
            }
            collection.ensureIndex('user');
            collection.insert(comment, {safe: true}, function(err, comment) {
                db.close();
                callback(err, comment);
            });
		})
	})
}

// 查找评论按文章时间查找。文章时间为null则查找全部
Comment.comment_get = function(artical_id,callback){
    mongodb.MongoClient.connect(settings.url, function (err, db) {
	if (err) {
		return callback(err);
	}
	db.collection('comments',function(err,collection){
		if (err) {
			db.close();
			return callback(err);
		}
// 如果是在文章下面评论的,按文章时间查找评论
        var query = {};
        if (artical_id) {
            query.artical_id = artical_id;
        }

        collection.find(query).sort({sort_time: -1}).toArray(function(err, docs) {
            db.close();
            if (err) {
                callback(err, null);
            }
            var comments = [];

            docs.forEach(function(doc, index) {
                var comment = new Comment(doc.user,doc.post,
                	doc.website, doc.email,
                	doc.artical_id , doc.sort_time,doc.time);
                comments.push(comment);
            });
            callback(null, comments);
	        });
		})
	})
}

//按评论时间删除评论
Comment.comment_delete = function(obj,callback){
	    mongodb.MongoClient.connect(settings.url, function (err, db) {
	    // mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('comments',function(err,collection){
			if (err) {
				db.close();
				return callback(err);
			}
//往里面传一个obj对象进行删除
           collection.remove(obj,{safe:true},function(err,comments){
                    db.close();
                    callback(err,comments);
           });
		})
	})
}

module.exports = Comment;
