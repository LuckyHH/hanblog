var mongodb = require('mongodb');
var settings = require('../settings');


function Ipmsg(ip,from,url,time){
    var t = new Date();
    // t.setHours(t.getHours()+8);    
	this.ip = ip ;
	this.from = from;
    this.url = url ;
    this.time = time?time:t.toLocaleString();
    this.sort_time = new Date();
} 
module.exports = Ipmsg;
Ipmsg.prototype.save = function(callback){
	var ipmsg = {
        ip: this.ip,
        from: this.from,
        url: this.url,
        sort_time : this.sort_time,
        time : this.time
    };

	mongodb.MongoClient.connect(settings.url, function (err, db) {
        // mongodb.open(function(err, db) {
		if (err) {
          return callback(err);
        }
        db.collection('ipmsg', function(err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
// 为 ip 属性添加索引
            collection.ensureIndex('ip', {unique: true});
// 写入 ipmsg 文档
            collection.insert(ipmsg, {safe: true}, function(err, ipmsg) {
                db.close();
                callback(err, ipmsg);
        	});
		})
	})
}

Ipmsg.get = function(callback){
    mongodb.MongoClient.connect(settings.url, function (err, db) {
        // mongodb.open(function(err, db) {
    if (err) {
        return callback(err);
    }
    db.collection('ipmsg',function(err,collection){
        if (err) {
            db.close();
            return callback(err);
        }

        collection.find({}).sort({sort_time: -1}).toArray(function(err, docs) {           
            db.close();
            if (err) {
                callback(err, null);
            }
            var ipmsgs = [];
            docs.forEach(function(doc, index) {               
                var ipmsg = new Ipmsg(doc.ip , doc.from , 
                    doc.url ,doc.time );

                ipmsgs.push(ipmsg);
            });
            callback(null,ipmsgs);
            });
    })
})
}