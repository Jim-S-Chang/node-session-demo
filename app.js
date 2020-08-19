const express = require('express')
const bodyParser = require('body-parser')
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

app.post('/login', bodyParser.json(), function(req, res) {
    console.log(req.body)
    res.send(req.body)
})

const server = app.listen(8080, function() {
    const host = 'localhost'
    const port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port)
})