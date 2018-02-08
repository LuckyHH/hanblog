var mongodb = require('mongodb');
var settings = require('../settings');

//文章浏览量，点赞
//click表示文章点击,zan表示点赞数,当传入参数为1,点击量加一
var Click = function(id,click,zan,cai){
    this.id = id;
    this.click = click ;
    this.zan = zan ;
    this.cai = cai ;
};

module.exports = Click;

Click.prototype.save = function(callback){
    var _click = {
        id : this.id,
        click : this.click,
        zan : this.zan,
        cai : this.cai
    };

    // mongodb.open(function(err, db) {
        mongodb.MongoClient.connect(settings.url, function (err, db) {
        if (err) {
            return callback(err);
        }
// 读取 _clicks 集合
        db.collection('_clicks', function(err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
// 为 id 属性添加索引
            collection.ensureIndex('id');
// 写入 _click 文档
            collection.insert(_click, {safe: true}, function(err, _click) {
                db.close();
                callback(err, _click);
            });
        });
    });
}

Click.update = function(id,obj,callback){
        mongodb.MongoClient.connect(settings.url, function (err, db) {
        // mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('_clicks', function(err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
        collection.update({id:id},{$set:{click:obj.click,zan:obj.zan,cai:obj.cai}},
            function(err,result){
                if (err) {
                    db.close();
                    return callback(err);
                }
                db.close();
                callback();
            });
        });
    });


}
Click.get = function(id,callback){
        mongodb.MongoClient.connect(settings.url, function (err, db) {
        // mongodb.open(function(err, db) {
        if (err) {
            console.log("链接错误"+err);
            return callback(err);
        }
// 读取 posts 集合
        db.collection('_clicks', function(err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }

        var query = {};
        if(id){
            query.id = id;
        }
        collection.find(query).sort({click: -1}).toArray(function(err, docs) {
            db.close();
            if (err) {
                callback(err, null);
            }
            var _clicks = [];
            docs.forEach(function(doc, index) {
                var _click = new Click(doc.id , doc.click , doc.zan , doc.cai);
                _clicks.push(_click);
            });
            callback(null, _clicks);
        });
    });
});


}
