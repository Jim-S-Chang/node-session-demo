const jwt = require('jsonwebtoken')

const NodeRSA = require('node-rsa');
const key = new NodeRSA({ b: 2048 }); //生成2048位的密钥
let publicDer = key.exportKey('pkcs1-public-pem'); //公钥
let privateDer = key.exportKey('pkcs1-private-pem');//私钥

class JWT {
    constructor(data) {
        this.data = data
    }

    generateToken() {
        let data = this.data
        let createdTime = Math.floor(Date.now() / 1000)
        let token = jwt.sign({
            data,
            expireTime: createdTime + 60,
        }, privateDer, {algorithm: 'RS256'})
        const encryptedToken = key.encrypt(token, 'base64')
        return encryptedToken
    }

    verifyToken() {
        let token = this.data
        let res
        try {
            const decryptedToken = key.decrypt(token, 'utf8')
            let result = jwt.verify(decryptedToken, publicDer, {algorithms: ['RS256']})
            let { expireTime } = result, current = Math.floor(Date.now() / 1000)
            if (current <= expireTime) {
                res = result.data
            } else {
                res = 'err'
            }
        } catch (e) {
            res = 'err'
        }
        return res
    }
}

module.exports = JWT