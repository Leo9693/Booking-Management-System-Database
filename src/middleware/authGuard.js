const { validateToken } = require('../utils/jwt');

const authGuard = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json('Check the authorization setting');
    }

    const authContentArr = authHeader.split(' ');
    if (authContentArr.length !== 2 || authContentArr[0] !== 'Bearer') {
        return res.status(401).json('Invalid authorization content');
    }

    const decodedInfo = validateToken(authContentArr[1]);
    if (decodedInfo) {
        req.user = decodedInfo;
        return next();
    }

    return res.status(401).json('Invalid authorization Token');
}

module.exports = authGuard;