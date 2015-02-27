var supertest = require('supertest'),
    testApp = require('./test-app'),
    UserModel = testApp.UserModel,
    TokenModel = testApp.TokenModel,
    expect = require('expect'),
    app = testApp.app,
    clearDb = require('mocha-mongoose')('mongodb://localhost:27017/micro-auth', {noClear: true});

var request = function (method, route, body, status, callback, token) {
    supertest(app)
        [method === 'delete' ? 'del' : method](route)
        .send(body)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer: ' + (token || ''))
        .expect('Content-Type', /json/)
        .expect(status)
        .end(callback);
};

var createUserAndToken = function (done) {
    UserModel.create({username: 'user', password: '12345678'}, function (err, user) {
        TokenModel.create(TokenModel.newToken(user._id), function (err, token) {
            done(token);
        });
    });
};

var fail = function () {
    expect(false).toBe(true);
};

var ok = function () {
    expect(true).toBe(true);
};

module.exports = {
    clearDb: clearDb,
    request: request,
    createUserAndToken: createUserAndToken,
    fail: fail,
    ok: ok
};
