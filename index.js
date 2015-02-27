module.exports = {
    createUserModel: require('./lib/user'),
    createTokenModel: require('./lib/token'),
    createUserController: require('./lib/controllers'),
    createAuthMiddleware: require('./lib/middleware')
};