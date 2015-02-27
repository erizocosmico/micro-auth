/**
 * Creates a new auth middleware given an user and token model
 * @param {Model} TokenModel Token model
 * @param {Model} UserModel  User model
 * @returns {Function}
 */
module.exports = function (TokenModel, UserModel) {
    /**
     * Authentication middleware. Will check for the token on the Authorization header and if the user exists
     * the next handler will be called. Otherwise it will throw an error.
     * @param req  HTTP Request
     * @param res  HTTP Response
     * @param next Call next handler
     */
    return function (req, res, next) {
        var error = function () {
                var err = new Error('you are not allowed to access this resource');
                err.status = 401;
                next(err);
            },
            token = (req.headers.authorization || '').replace('Bearer: ', '');

        TokenModel.findByToken(token, function (err, token) {
            if (!token) {
                error();
            } else {
                UserModel.findById(token.userId, function (err, user) {
                    if (err) error();
                    req.token = token._id;
                    req.user = user;
                    next();
                });
            }
        });
    }
};
