var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    microAuth = require('../index'),
    TokenModel = microAuth.createTokenModel(),
    UserModel = microAuth.createUserModel(),
    User = microAuth.createUserController(TokenModel, UserModel),
    auth = microAuth.createAuthMiddleware(TokenModel, UserModel),
    app = express();

// Add middlewares
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/micro-auth');

// Routing
app.post('/login', User.loginOrSignup);
app.delete('/logout', auth, User.logout);
app.delete('/account', auth, User.eraseAccount);

app.use(function (err, req, res, next) {
    res.status(err.status || 500).send({
        error: true,
        message: err.message || err || 'unexpected error occurred'
    });
});

module.exports = {
    app: app,
    UserModel: UserModel,
    TokenModel: TokenModel,
    auth: auth
};