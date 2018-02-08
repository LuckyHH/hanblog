var mongodb = require('mongodb');
var settings = require('../settings');
var formatTime = require('./format_time');

function Post(username,id ,title , post , brief , tags ,index, time , t , update_time) {
    this.user = username;
    this.title = title;
    this.id = id ;
    this.post = post;
    this.brief = brief;
    this.index = index;
    this.tags = tags;
    this.update_time = update_time;
    if (time) {
        this.time = time;
        this.sort_time =  t;
    } else {
        var t = formatTime();
        this.sort_time =  t.t;
        this.time = t.format_time;
    }
}

module.exports = Post;

Post.prototype.save = function save(callback) { // 存入 Mongodb 的文档
    var post = {
        user: this.user,
        title:this.title,
        id : this.id,
        post: this.post,
        brief : this.brief,
        sort_time : this.sort_time,
        time: this.time,
        update_time: this.update_time,
        tags: this.tags
    };
        mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
// 读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
// 为 user 属性添加索引
            collection.ensureIndex('user');
// 写入 post 文档
            collection.insert(post, {safe: true}, function(err, post) {
                db.close();
                callback(err, post);
            });
        });
    });
};

Post.update = function(id,obj,callback){
        mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
        collection.update({id:id},{$set:{title:obj.title,post:obj.post,brief:obj.brief,sort_time:obj.sort_time,update_time:obj.update_time,tags:obj.tags}},
            function(err,relust){
                if (err) {
                    db.close();
                    return callback(err);
                }
                db.close();
                callback();
            });
        });
    });
};

Post.remove = function(obj,callback){
        mongodb.MongoClient.connect(settings.url, function (err, db) {
        // mongodb.open(function(err, db) {
        if (err) {
            console.log("删除函数错误"+err);
            return callback(err);
        }
        db.collection('posts', function(err, collection) {
                if (err) {
                    console.log("删除函数读取数据错误");
                    db.close();
                    return callback(err);
                }
                collection.remove(obj,{safe:true},function(err,posts){
                        db.close();
                        callback(err, posts);
                });
        });
    });
};


Post.get = function get(findObj,callback) {
      mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            console.log("链接错误"+err);
            return callback(err);
        }
// 读取 posts 集合
    db.collection('posts', function(err, collection) {
        if (err) {
            db.close();
            return callback(err);
        }

//null为查询所有
//按照用户名查询
//按照文章ID查询
//按标签查询
        var query = {};
        if(findObj){
            if(findObj.user){
              query.user = findObj.user;
            }
            if(findObj.id){
              query.id = findObj.id;
            }
            if(findObj.tag){
              query = {tags:{$in:[findObj.tag]}};
            }
        }
        collection.find(query).sort({sort_time: -1}).toArray(function(err, docs) {
            db.close();
            if (err) {
                callback(err, null);
            }

// 封装 posts 为 Post 对象
            var posts = [];
            docs.forEach(function(doc, index) {
                var post = new Post(doc.user , doc.id , doc.title , doc.post, doc.brief ,doc.tags,
                  index , doc.time , doc.t , doc.update_time);
                posts.push(post);
            });
            callback(null, posts);
        });
    });
});
};
