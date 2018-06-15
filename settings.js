module.exports = {
    cookieSecret: 'hanblog',
    db: 'hanblog',
    url: 'mongodb://luckyhh:hj782161@ds259305.mlab.com:59305/hanblog'
        // url: 'mongodb://localhost:27017/hanblog'
        // url:'mongodb://luckyhh:hj782161@localhost:27017/hanblog'
};
// db.createUser({ user: 'luckyhh', pwd: 'hj782161', roles: [{ role: 'readWrite', db: 'websplider' }] })