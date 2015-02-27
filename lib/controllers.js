/**
 * Creates a new user controller given a token and an user model
 * @param {Model}            TokenModel Token model
 * @param {Model}            UserModel  User model
 * @param {Object|undefined} options    Options object
 * @returns {Object}
 */
module.exports = function (TokenModel, UserModel, options) {
    options = options || {};

    /**
     * Handler for signing the user up if there is no account associated with the given username or sign the user in in
     * case there is.
     * @method loginOrSignup
     * @param req  HTTP Request
     * @param res  HTTP Response
     * @param next Call next handler
     */
// TODO: On create hook & stuff
    var loginOrSignup = function (req, res, next) {
        var createToken = function (user) {
                TokenModel.create(TokenModel.newToken(user._id), function (err, token) {
                    if (err) next(err);

                    res.send({
                        error: false,
                        token: token.token,
                        expiration: token.expiration
                    });
                });
            },
            error = function () {
                var err = new Error('invalid username or password');
                err.status = 400;
                next(err);
            },
            username = (req.body.username || '').trim(),
            password = req.body.password || '';

        if (username.length < 2 || username.length > 50 || password.length < 8) {
            error();
        } else {
            UserModel.findByUsername(username, function (err, user) {
                if (err) next(err);

                if (user && !user.passwordMatches(password)) {
                    error();
                } else if (user) {
                    createToken(user);
                } else {
                    UserModel.create({username: username, password: password}, function (err, user) {
                        if (err) next(err);
                        createToken(user);
                    });
                }
            });
        }
    };

    /**
     * Handler to logout an user. Expects a token to be the id of the token to delete passed with the request.
     * @method logout
     * @param req  HTTP Request
     * @param res  HTTP Response
     * @param next Call next handler
     */
    var logout = function (req, res, next) {
        var error = function () {
            var err = new Error('the token does not exist');
            err.status = 404;
            next(err);
        };

        if (!req.token) {
            error();
        } else {
            TokenModel.remove({_id: req.token}, function (err) {
                if (err) {
                    error();
                } else {
                    if (options.onLogout && typeof options.onLogout === 'function') {
                        options.onLogout(req.user, function () {
                            res.send({
                                error: false
                            });
                        });
                    } else {
                        res.send({
                            error: false
                        });
                    }
                }
            });
        }
    };

    /**
     * Handler for deleting the user account. Expects an 'user' entity to be passed with the request.
     * @method eraseAccount
     * @param req  HTTP Request
     * @param res  HTTP Response
     * @param next Call next handler
     */
    var eraseAccount = function (req, res, next) {
        var error = function (msg) {
            var err = new Error(msg);
            err.status = 400;
            next(err);
        };

        if (req.user && req.user._id && req.body.password && req.body.password.trim()) {
            if (req.user.passwordMatches(req.body.password.trim())) {
                UserModel.remove({_id: req.user._id}, function () {
                    TokenModel.remove({userId: req.user._id}, function () {
                        if (options.onEraseAccount && typeof options.onEraseAccount === 'function') {
                            options.onEraseAccount(req.user._id, function () {
                                res.send({
                                    error: false
                                });
                            });
                        } else {
                            res.send({
                                error: false
                            });
                        }
                    });
                });
            } else {
                error('the given password is not correct');
            }
        } else {
            error('missing data');
        }
    };

    return {
        loginOrSignup: loginOrSignup,
        logout: logout,
        eraseAccount: eraseAccount
    };
};
