const express = require('express')
const bodyParser = require('body-parser')
let session = require('express-session')
let RedisStore = require('connect-redis')(session);
const redis = require('redis');
const { Store } = require('express-session');
const app = express()

// 解决跨域
app.all("*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "content-type")
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS")
    if (req.method.toLowerCase() == 'options')
        res.send(200)
    else
        next()
})

app.use(session({
    name : "sessionId",
    secret : 'Jim_secret',
    resave : false,
    rolling: true,
    saveUninitialized : false,
    cookie : {
        maxAge: 1000 * 60,
        httpOnly: true
    },
    store : new RedisStore({client: redis.createClient({
        host: '127.0.0.1',
        port: 6379
    })})
}))

app.use((req, res, next) => {
    req.session.cookie.maxAge = 1000 * 60
    next()
})

app.post('/login', bodyParser.json(), function(req, res) {
    console.log(`req.session`, req.session);
    const userInfo = { name: "Jim", address: "South Park", age: "18" }
    let expireTime = new Date().getTime() + 60000
    req.session.save()
    res.send({
        userInfo,
        expireTime: new Date(expireTime).toISOString()
    })
})

const server = app.listen(8080, function() {
    const host = 'localhost'
    const port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)
})