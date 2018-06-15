var express = require('express');
var events = require('events');
var cookie = require('cookie');
var router = express.Router();
var cookieParser = require('cookie-parser');
var crypto = require('crypto'); //加密用的
var User = require('../models/user'); //导入两个模型模块
var Post = require('../models/post');
var Ipmsg = require('../models/IPsave'); //IP记录相关
var Comment = require('../models/comment');
var Click = require('../models/tips'); //点赞相关
var format_time = require('../models/format_time');

//转发函数
var after = function(times, ejs, res) {
    var result = {},
        count = 0;
    if (arguments.length > 3) {
        for (var i = 3; i < arguments.length; i = i + 2) {
            result[arguments[i]] = arguments[i + 1];
        }
    }
    return function(key, value) {
        count++;
        if (arguments.length > 2) {
            for (var i = 2; i < arguments.length; i = i + 2) {
                result[arguments[i]] = arguments[i + 1];
            }
        }
        result[key] = value;
        if (count === times) {
            res.render(ejs, result);
        }
    };
};



//heroku部署开始ip记录
// router.get('/', function(req, res, next) {
//     //优化数据库访问速度
//     Post.get(null,function(){});
//     Click.get(null,function(){});
//     Comment.comment_get(null,function(){});

//     res.render('htmls/preEnter');
// });

// router.post('/',function(req,res,next){
//     var newIP =new Ipmsg(
//          req.body.ip ,
//          req.body.ip_content,
//          'myblog'
//     );
//     newIP.save(function(err){
//         return res.redirect('/idx/0');
//     });
// });

router.get('/', function(req, res, next) {
    res.redirect('/idx/0');
});


(function() {
    var status = ["ready", "ready"];
    router.get('/idx/:number', function(req, res, next) {
        if (status[0] === 'ready' && status[1] === 'ready') {
            status[0] = 'pending';
            status[0] = 'pending';

            var emitter = new events.EventEmitter();
            var done = after(2, 'index', res, 'title', '主页', 'idxn', req.params.number, 'src', false);
            emitter.on('done', done);

            Post.get(null, function(err, posts) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/idx/0');
                }
                status[0] = 'ready';
                emitter.emit('done', 'posts', posts, '_posts', posts);
            });
            Click.get(null, function(err, _clicks) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/idx/0');
                }
                status[1] = 'ready';
                emitter.emit('done', '_clicks', _clicks);
            });
        }
    });
})();


router.get('/about', function(req, res, next) {
    var emitter = new events.EventEmitter();
    var done = after(2, 'about', res, 'title', '关于');
    emitter.on('done', done);

    Post.get(null, function(err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        emitter.emit('done', '_posts', posts);
    });
    Click.get(null, function(err, _clicks) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/idx/0');
        }
        emitter.emit('done', '_clicks', _clicks);
    });
});

router.get('/link', function(req, res, next) {
    var emitter = new events.EventEmitter();
    var done = after(2, 'link', res, 'title', '链接');
    emitter.on('done', done);

    Post.get(null, function(err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        emitter.emit('done', '_posts', posts);
    });
    Click.get(null, function(err, _clicks) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/idx/0');
        }
        emitter.emit('done', '_clicks', _clicks);
    });
});

router.get('/archive', function(req, res, next) {

    var emitter = new events.EventEmitter();
    var done = after(2, 'archive', res, 'title', '归档');
    emitter.on('done', done);

    Post.get(null, function(err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        emitter.emit('done', 'posts', posts, '_posts', posts);
    });
    Click.get(null, function(err, _clicks) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/idx/0');
        }
        emitter.emit('done', '_clicks', _clicks);
    });
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
    req.session.user = null;
    res.redirect('/login');
});


router.get('/login', function(req, res, next) {
    if (req.session.user && cookie.parse(req.headers.cookie).user && req.session.user.name == cookie.parse(req.headers.cookie).user) {
        res.redirect('/manage');
    } else {
        var emitter = new events.EventEmitter();
        var done = after(2, 'login', res, 'title', '登录');
        emitter.on('done', done);

        Post.get(null, function(err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/idx/0');
            }
            emitter.emit('done', 'posts', posts, '_posts', posts);
        });
        Click.get(null, function(err, _clicks) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/idx/0');
            }
            emitter.emit('done', '_clicks', _clicks);
        });
    }
});

router.get('/login', checkNotLogin);
router.post('/login', function(req, res) { //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    User.get(req.body.username, function(err, user) {
        if (!user) {
            req.flash('error', '哎呀，用户不存在');
            return res.redirect('/login');
        }
        if (user.password != password) {
            req.flash('error', '你的密码输错了');
            return res.redirect('/login');
        }
        req.session.user = user;
        req.flash('success', '登录成功');
        res.cookie('user', req.session.user.name, { httpOnly: true, maxAge: 360000 });
        res.redirect('/manage');
    });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res, next) {
    req.flash('error', '管理员登录');
    res.redirect('/login');
    // res.render('reg',{title:'注册'});
})

router.get('/reg', checkNotLogin);
router.post('/reg', function(req, res, next) {
    if (req.body['password-repeat'] != req.body['password']) {
        req.flash('error', '两次输入的口令不一致');
        return res.redirect('/reg');
    } else if ((req.body['mypwd'] || req.body['repeat_mypwd'] || req.body['myname']) == '') {
        req.flash('error', '请补全输入');
        return res.redirect('/reg');
    }
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.mypwd).digest('base64');

    var newUser = new User({
        name: req.body.myname,
        password: password
    });
    //检查用户名是否已经存在
    User.get(newUser.name, function(err, user) {
        if (user) {
            req.flash('error', '用户已存在.');
            return res.redirect('/reg');
        }
        //如果不存在则新增用户
        newUser.save(function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            req.session.user = newUser;
            req.flash('success', '注册成功');
            res.redirect('/manage');
        });
    });
});

router.get('/tags/:tag', function(req, res, next) {
    res.redirect('/tags/' + req.params.tag + '/0');
});

//标签
router.get('/tags/:tag/:number', function(req, res, next) {
    var emitter = new events.EventEmitter();
    var done = after(3, 'index', res, 'title', req.params.tag, 'idxn', req.params.number, 'src', true);
    emitter.on('done', done);

    Post.get(null, function(err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        emitter.emit('done', '_posts', posts);
    });
    Click.get(null, function(err, _clicks) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/idx/0');
        }
        emitter.emit('done', '_clicks', _clicks);
    });

    Post.get({ tag: req.params.tag }, function(err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        emitter.emit('done', 'posts', posts);
    });
});




router.get('/manage', checkLogin);
router.get('/manage', function(req, res, next) {
    Post.get(null, function(err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/manage');
        }
        var tagList = [];
        posts.forEach(function(post) {
            post.tags.forEach(function(tag) {
                if (tagList.indexOf(tag) < 0) {
                    tagList.push(tag);
                }
            });
        });
        res.render('artical_post', { title: '后台', tags: tagList, mytagList: [] });
    });
});

router.get('/manage', checkLogin);
router.post('/manage', function(req, res, next) {
    var currentUser = req.session.user;
    var artical_id = (new Date()).getTime().toString();
    //转化成数组
    var handleTags = (function() {
        return req.body.tags.split(' ');
    })();

    //数组去重和去除空格
    handleTags = (function(handleTags) {
        var result = [];
        handleTags.forEach(function(v) {
            if (result.indexOf(v) < 0 && v != '') {
                result.push(v);
            }
        });
        return result;
    })(handleTags);

    var post = new Post(currentUser.name,
        artical_id,
        req.body.artical_title,
        req.body.html_content,
        req.body.brief_introduction,
        handleTags
    );
    post.save(function(err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/manage');
        }
        //初始化文章浏览量,点赞,踩..
        var click = new Click(artical_id, 0, 0, 0);
        click.save(function(err) {
            if (err) {
                req.flash('error', '初始化Click对象失败');
            }
            req.flash('success', '发表成功');
            res.redirect('/manage');
        });

    });
})

router.get('/edit_user', checkLogin);
router.get('/edit_user', function(req, res, next) {
    res.render('change_pwd', { title: '修改密码' });
})

router.get('/edit_user', checkLogin);
router.post('/edit_user', function(req, res, next) {
    var currentUser = req.session.user;
    var md5 = crypto.createHash('md5');
    var password1 = md5.update(req.body.pwd1).digest('base64');
    User.get(currentUser.name, function(err, _user) {
        if (err) {
            req.flash('error', err)
            return res.redirect('/edit_user');
        }
        //如果输入的旧密码符合
        if (password1 === _user.password) {
            var md5 = crypto.createHash('md5');
            var password2 = md5.update(req.body.pwd2).digest('base64');
            User.update(currentUser.name, password2, function(err, user) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/edit_user');
                }
                req.flash('success', '更新成功');
                req.session.user = null;
                res.redirect('/login');
            });
        } else {
            req.flash('error', '旧密码错误');
            req.session.user = null;
            return res.redirect('/login');
        }
    });
});

router.get('/delete', checkLogin);
router.get('/delete/:user/:post_title', function(req, res, next) {
    User.get(req.params.user, function(err, user) {
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/manage');
        }
        Post.remove({ title: req.params.post_title }, function(err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/all_artical');
            }
            req.flash('success', '删除成功');
            res.redirect('/all_artical');
        });
    });
});

router.get('/update', checkLogin);
router.get('/update/:user/:id', function(req, res, next) {
    Post.get({ id: req.params.id }, function(err, mypost) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/manage');
        }
        var mytagList = [];
        mypost.forEach(function(post) {
            post.tags.forEach(function(tag) {
                if (mytagList.indexOf(tag) < 0) {
                    mytagList.push(tag);
                }
            });
        });
        Post.get(null, function(err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/manage');
            }
            var tagList = [];
            posts.forEach(function(post) {
                post.tags.forEach(function(tag) {
                    if (tagList.indexOf(tag) < 0) {
                        tagList.push(tag);
                    }
                });
            });

            res.render('artical_post', {
                title: '编辑',
                post: mypost,
                tags: tagList,
                mytagList: mytagList
            });
        });
    });
});

router.get('/update', checkLogin);
router.post('/update/:user/:id', function(req, res, next) {
    //转化成数组
    var handleTags = (function() {
        return req.body.tags.split(' ');
    })();
    //数组去重和去除空格
    handleTags = (function(handleTags) {
        var result = [];
        handleTags.forEach(function(v) {
            if (result.indexOf(v) < 0 && v != '') {
                result.push(v);
            }
        });
        return result;
    })(handleTags);

    var t = format_time();
    Post.update(req.params.id, {
        title: req.body.artical_title,
        post: req.body.html_content,
        brief: req.body.brief_introduction,
        sort_time: t.t,
        update_time: t.format_time,
        tags: handleTags
    }, function(err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/all_artical');
        }
        req.flash('success', '更新成功');
        res.redirect('/all_artical');
    });
});

router.get('/all_artical', checkLogin);
router.get('/all_artical', function(req, res, next) {
    var done = after(3, 'all_artical', res, 'title', '所有文章');

    var emitter = new events.EventEmitter();
    emitter.on('done', done);

    Post.get({ user: req.session.user.name }, function(err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/manage');
        }
        Comment.comment_get(null, function(err, comments) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/manage');
            }
            var comment_post = [];
            for (var i = 0; i < posts.length; i++) {
                var count = 0; //每篇文章的留言数
                for (var j = 0; j < comments.length; j++) {
                    if (comments[j].artical_id === posts[i].id) {
                        count++;
                    } else {
                        continue; //这里因为评论与文章都是按照id降序排列
                    }
                }
                comment_post.push(count);
            }
            emitter.emit('done', 'posts', posts);
            emitter.emit('done', 'comments', comment_post);
        });
    });

    Click.get(null, function(err, _clicks) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/manage');
        }
        emitter.emit('done', '_clicks', _clicks);
    });
});


router.get('/artical_detiail/:user/:id', function(req, res, next) {
    var emitter = new events.EventEmitter();
    var done = after(4, 'artical_detiail', res);
    emitter.on('done', done);
    Click.get(req.params.id, function(err, _clicks) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/idx/0');
        }
        emitter.emit('done', '_myclicks', _clicks[0]);
        Click.update(req.params.id, { click: _clicks[0].click + 1, zan: _clicks[0].zan, cai: _clicks[0].cai }, function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/idx/0');
            }
        });
    });

    Post.get(null, function(err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }

        var ipost = new Array(3),
            flag = 0;
        //查找文章，返回找到的文章和该文章前后的文章。(用来写链接)
        for (var i = 0; i < posts.length; i++) {
            if (req.params.id == posts[i].id) {
                ipost[1] = posts[i];
                i == 0 ? ipost[0] = 'null' : ipost[0] = posts[i - 1];
                i == posts.length - 1 ? ipost[2] = 'null' : ipost[2] = posts[i + 1];
                flag = 1;
            }
        }
        if (!flag) {
            req.flash('error', '文章不存在');
            return res.render('index', { title: '文章不存在' });
        } else {
            emitter.emit('done', 'post', ipost, 'title', ipost[1].title, '_posts', posts);
        }
    });
    Click.get(null, function(err, _clicks) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/idx/0');
        }
        emitter.emit('done', '_clicks', _clicks);
    });

    Comment.comment_get(req.params.id, function(err, comments) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        emitter.emit('done', 'comment', comments);
    });
});

router.get('/hot', function(req, res, next) {
    var emitter = new events.EventEmitter();
    var done = after(3, 'hot', res, 'title', '文章热度榜');
    emitter.on('done', done);

    Click.get(null, function(err, _clicks) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/idx/0');
        }

        emitter.emit('done', '_clicks', _clicks);
    });
    Post.get(null, function(err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/idx/0');
        }
        emitter.emit('done', 'posts', posts, '_posts', posts);
    });
    Comment.comment_get(null, function(err, comments) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/idx/0');
        }
        emitter.emit('done', 'comments', comments);
    });
});


router.get('/comment', function(req, res, next) {
    res.redirect('/comment/idx/0');
});

router.get('/comment/idx/:number', function(req, res, next) {
    var emitter = new events.EventEmitter();
    var done = after(3, 'comment', res, 'title', '留言', 'idxn', req.params.number);
    emitter.on('done', done);

    Comment.comment_get('leftMessage', function(err, comments) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/comment');
        }
        emitter.emit('done', 'comment', comments);
    });

    Post.get(null, function(err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        emitter.emit('done', '_posts', posts);
    });

    Click.get(null, function(err, _clicks) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/idx/0');
        }
        emitter.emit('done', '_clicks', _clicks);
    });

});

router.post('/comment', function(req, res, next) {
    var comment = new Comment(
        req.body.comment_name,
        req.body.comment_connent,
        req.body.comment_website,
        req.body.comment_email,
        req.body.artical_id
    );
    comment.save(function(err, comment) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        //ops是观察到的comment数据格式
        //console.log(comment);
        res.send(comment.ops[0]);
    });
});

router.get('/comment_manage', checkLogin);
router.get('/comment_manage', function(req, res, next) {
    Comment.comment_get(null, function(err, comment) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/manage');
        }
        res.render('comment_manage', {
            title: '评论管理',
            comments: comment
        });
    });
});
router.get('/comment/delete/:time', checkLogin);
router.get('/comment/delete/:time', function(req, res, next) {
    var target = req.params.time;
    Comment.comment_delete({ time: target }, function(err) {
        if (err) {
            return res.redirect('/comment_manage');
        }
        req.flash('success', '删除成功');
        res.redirect('/comment_manage');
    });
});

router.post('/small/:zan/:id', function(req, res, next) {
    Click.get(req.params.id, function(err, _clicks) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/idx/0');
        }
        var _zan = 0,
            _cai = 0,
            obj = {};
        if (req.params.zan === 'zan') {
            _zan = _clicks[0].zan + 1;
            _cai = _clicks[0].cai;
            obj['zan_cai'] = 　_zan;
        } else if (req.params.zan === 'cai') {
            _cai = parseInt(_clicks[0].cai) - 1;
            _zan = _clicks[0].zan;
            obj['zan_cai'] = _cai;
        }
        Click.update(req.params.id, { click: _clicks[0].click, zan: _zan, cai: _cai }, function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/idx/0');
            }
        });
        res.render('zan', obj);
    });
});



router.get('/C-lex', function(req, res, next) {
    res.render('htmls/C-lex');
});

function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录');
        return res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录');
        return res.redirect('/');
    }
    next();
}

router.get('/jubao', function(req, res, next) {
    res.send('举报完成');
});
module.exports = router;