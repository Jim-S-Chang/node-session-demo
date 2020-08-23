const express = require('express')
const bodyParser = require('body-parser')
const redis = require('redis');
let redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6379
})
const JWT = require('./jwt')
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

app.use(async (req, res, next) => {
    if (req.url != '/login') {
        let token = req.headers.token
        let userId = req.headers.userid
        let tokenInRedis = ''
        try {
            tokenInRedis = await new Promise(((resolve, reject) => {
                redisClient.get(userId, function (err, res) {
                    if (err) {
                        console.log(`err`, err)
                        reject()
                    } else {
                        return resolve(res)
                    }
                })
            }))
        } catch (error) {
            res.status(403)
            res.send({msg: '登录已过期,请重新登录'})
        }
        let jwtInRedis = new JWT(tokenInRedis)
        let resultInRedis = jwtInRedis.verifyToken()
        if (resultInRedis == 'err') {
            res.status(403)
            res.send({msg: '登录已过期,请重新登录'})
        } else {
            let jwt = new JWT(token)
            let result = jwt.verifyToken()
            if (result == 'err') {
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
    const userInfo = { id:'12344', name: "Jim", address: "South Park", age: "18" }
    let jwt = new JWT(userInfo.name)
    let token = jwt.generateToken()
    redisClient.set(userInfo.id, token)
    res.setHeader('token', token)
    res.setHeader('userid', userInfo.id)
    res.send({
        userInfo
    })
})

app.post('/logout', function (req, res) {
    res.send()
})

const server = app.listen(8080, function() {
    const host = 'localhost'
    const port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)
})