var expect = require('expect'),
    testApp = require('./test-app'),
    auth = testApp.auth,
    utils = require('./utils');

var app = testApp.app,
    userToken;

app.get('/test-auth', auth, function (req, res) {
    res.send({error: !req.user});
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500).send({
        error: true,
        message: err.message || err || 'unexpected error occurred'
    });
});

describe('Auth', function () {
    before(function (done) {
        utils.clearDb(function () {
            utils.createUserAndToken(function (token) {
                userToken = token;
                done();
            });
        });
    });

    describe('when the provided token does not exist', function () {
        it('should return an error with status 401', function (done) {
            utils.request('get', '/test-auth', {}, 401, function (err, result) {
                expect(result.body.error).toBe(true);
                done();
            });
        });
    });

    describe('when the provided token exists', function () {
        it('should pass the user and the token along with the request to the next handler', function (done) {
            utils.request('get', '/test-auth', {}, 200, function (err, result) {
                expect(result.body.error).toBe(false);
                done();
            }, userToken.token);
        });
    });
});
