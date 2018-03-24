var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ueditor = require("ueditor")

var settings = require('./settings');
var session = require('express-session');
var flash = require('connect-flash');

var index = require('./routes/index');
var sitemap = require('./routes/sitemap');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var MongoStore = require('connect-mongo')(session);
app.use(session({
             secret: settings.cookieSecret,
             resave: false,
             saveUninitialized: true,
             cookie: {maxAge:3600000},
             store: new MongoStore({
                       db : settings.db,
                       url : settings.url,
                   })
             })
      );

app.use(flash());

app.use(function(req, res, next){
       res.locals.user = req.session.user;
       res.locals.post = req.session.post;
       var error = req.flash('error');
       res.locals.error = error.length ? error : null;
       var success = req.flash('success');
       res.locals.success = success.length ? success : null;
       next();
     });

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser({limit:'1000mb'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'),{maxAge:1000*60*60}));
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/sitemap.xml', sitemap);

//UEditor
app.use("/editor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
    var imgDir = '/upload/image/plain';
    var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo'||ActionType === 'uploadscrawl'||ActionType === 'catchimage') {
        var file_url = imgDir;//默认图片上传地址
        /*其他上传格式的地址*/
        if (ActionType === 'uploadfile') {
            file_url = '/upload/file'; //附件
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/upload/video'; //视频
        }
        if (ActionType === 'uploadscrawl') {
            file_url = '/upload/image/paint';//涂鸦
        }
        if(ActionType === 'catchimage'){
            file_url = '/upload/image/romate';//抓图
        }
        res.ue_up(file_url);
    }

  else if (ActionType === 'listimage' || ActionType === 'listfile'){
    if (ActionType === 'listimage') {
      var dir_url = '/upload/image/plain';
    }else{
      var dir_url = '/upload/file';
    }
    res.ue_list(dir_url)
    res.setHeader('Content-Type', 'application/html');
  }
  // 客户端发起其它请求
  else {
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/editor/php/config.json');
}}));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{title:'错误-月光博客'});
});

module.exports = app;
