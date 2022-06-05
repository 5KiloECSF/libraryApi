
const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY, JWT_EXPIRES_IN} = require("../config/constants");

const signJwtToken = (payload) => {
    const payload_data = {
        ...payload,
        name: payload.name.split(' ')[0]
    }

    return jwt.sign(payload_data, JWT_SECRET_KEY, {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: 'HS256'
    });
}


const verifyJwtToken = async (token) => {
    return jwt.verify(token, JWT_SECRET_KEY, {
        algorithms: ['HS256'],
    });
}
exports.signJwtToken = signJwtToken
exports.verifyJwtToken = verifyJwtToken

