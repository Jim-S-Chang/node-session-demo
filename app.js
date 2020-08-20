const express = require('express')
const bodyParser = require('body-parser')
// let session = require('express-session')
// let RedisStore = require('connect-redis')(session);
const redis = require('redis');
let redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6379
})
const JWT = require('./jwt')
// const { Store } = require('express-session');
const app = express()

// 解决跨域
app.all("*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    res.header("Access-Control-Expose-Headers", ["token","userId"])
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS")
    if (req.method.toLowerCase() == 'options')
        res.send(200)
    else
        next()
})

// app.use(session({
//     name : "sessionId",
//     secret : 'Jim_secret',
//     resave : false,
//     rolling: true,
//     saveUninitialized : false,
//     cookie : {
//         maxAge: 1000 * 60,
//         httpOnly: true
//     },
//     store : new RedisStore({client: redis.createClient({
//         host: '127.0.0.1',
//         port: 6379
//     })})
// }))

// app.use((req, res, next) => {
//     req.session.cookie.maxAge = 1000 * 60
//     next()
// })

app.use(async (req, res, next) => {
    if (req.url != '/login') {
        let token = req.headers.token
        let userId = req.headers.userid
        let tokenInRedis = await new Promise((resolve => {
            redisClient.get(userId, function (err, res) {
                if (err) {
                    console.log(`err`, err);
                } else {
                    return resolve(res)
                }
            })
        }))
        
        let jwtInRedis = new JWT(tokenInRedis)
        let resultInRedis = jwtInRedis.verifyToken()
        if (resultInRedis == 'err') {
            console.log('resultInRedis', resultInRedis)
            res.status(403)
            res.send({msg: '登录已过期,请重新登录'})
        } else {
            let jwt = new JWT(token)
            let result = jwt.verifyToken()
            if (result == 'err') {
                console.log('result',result)
                res.status(403)
                res.send({msg: '登录已过期,请重新登录'})
            }else {
                next();
            }
        }
    } else {
        next();
    }
});

app.get('/status', function (req, res) {
    res.send()
})

app.post('/login', bodyParser.json(), function(req, res) {
    // console.log(`req.session`, req.session);
    const userInfo = { id:'12344', name: "Jim", address: "South Park", age: "18" }
    // let expireTime = new Date().getTime() + 60000
    // req.session.save()
    let jwt = new JWT(userInfo.name)
    let token = jwt.generateToken()
    redisClient.set(userInfo.id, token)
    res.setHeader('token', token)
    res.setHeader('userid', userInfo.id)
    res.send({
        userInfo
        // expireTime: new Date(expireTime).toISOString()
    })
})

const server = app.listen(8080, function() {
    const host = 'localhost'
    const port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)
})