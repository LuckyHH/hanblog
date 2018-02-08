var mongodb = require('mongodb');
var settings = require('../settings');
// var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.password = user.password;
}
module.exports = User;

User.prototype.save = function save(callback) { // 存入 Mongodb 的文档
    var user = {
        name: this.name,
        password: this.password
    };

    mongodb.MongoClient.connect(settings.url, function (err, db) {
      // mongodb.open(function(err, db) {
        if (err) {
          return callback(err);
    }
// 读取 users 集合
        db.collection('users', function(err, collection) {
            if (err) {
                db.close();
                return callback(err);
            }
// 为 name 属性添加索引
            collection.ensureIndex('name', {unique: true});
// 写入 user 文档
            collection.insert(user, {safe: true}, function(err, user) {
                db.close();
                callback(err, user);
        });
    });
}); };

User.get = function get(username, callback) {

     mongodb.MongoClient.connect(settings.url, function (err, db) {
      // mongodb.open(function(err, db) {
    if (err) {
        return callback(err);
    }
// 读取 users 集合
    db.collection('users', function(err, collection) {
        if (err) {
            db.close();
            return callback(err);
        }

// 查找 name 属性为 username 的文档
        collection.findOne({name: username}, function(err, doc) {
            db.close();
             if (doc) {
                   var user = new User(doc);
                   callback(err, user);
             } else {
                   callback(err, null);
             } });
}); });

};

User.update = function (username,password,callback){
    mongodb.MongoClient.connect(settings.url, function (err, db) {
      if(err){
        return callback(err);
      }
      db.collection('users',function(err,collection){
        if (err) {
          db.close();
          return callback(err);
        }
        collection.update({name:username},{$set:{password:password}},function(err,result){
          db.close();
          if(err){
            return callback(err);
          }
          callback();
        })
      })
    })
}
