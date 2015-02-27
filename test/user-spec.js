var expect = require('expect'),
    testApp = require('./test-app'),
    TokenModel = testApp.TokenModel,
    UserModel = testApp.UserModel,
    utils = require('./utils');

var validData = {username: 'valid', password: '12345678'},
    invalidPasswordData = {username: 'valid', password: '12345679'};

describe('User', function () {
    describe('loginOrSignup', function () {
        this.timeout(15000);
        before(function (done) {
            utils.clearDb(done);
        });

        describe('when invalid username or password are provided', function () {
            var sets = [
                {},
                {username: ' a           '},
                {password: '1 '},
                {username: ' a               ', password: '1'},
                {username: ' a', password: '1'}
            ];

            sets.forEach(function (s) {
                it(JSON.stringify(s) + ' should return an error with status 400', function (done) {
                    utils.request('post', '/login', s, 400, function (err, result) {
                        expect(result.body.error).toBe(true);

                        done();
                    });
                });
            });
        });

        describe('when valid username and password are provided', function () {
            describe('and the user did not exist', function () {
                it('should sign up the user and return the created token', function (done) {
                    utils.request('post', '/login', validData, 200, function (err, result) {
                        console.log(result.body);
                        expect(result.body.error).toBe(false);
                        expect(result.body.token).toExist();
                        expect(result.body.token.length).toBeGreaterThan(0);
                        expect(result.body.expiration).toBeGreaterThan(0);
                        done();
                    });
                });
            });

            describe('and the user exists', function () {
                describe('and the given password does not match the user password', function () {
                    it('should return an error and status 400', function (done) {
                        utils.request('post', '/login', invalidPasswordData, 400, function (err, result) {
                            expect(result.body.error).toBe(true);
                            done();
                        });
                    });
                });

                describe('and the given password matches the user password', function () {
                    it('should sign in the user and return the created token', function (done) {
                        utils.request('post', '/login', validData, 200, function (err, result) {
                            expect(result.body.error).toBe(false);
                            expect(result.body.token).toExist();
                            expect(result.body.token.length).toBeGreaterThan(0);
                            expect(result.body.expiration).toBeGreaterThan(0);
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('logout', function () {
        it('should remove the used token', function (done) {
            utils.createUserAndToken(function (token) {
                utils.request('delete', '/logout', undefined, 200, function (err, result) {
                    expect(result.body.error).toBe(false);

                    TokenModel.find({_id: token._id}, function (err, results) {
                        if (err) utils.fail();
                        expect(results.length).toBe(0);
                        done();
                    });
                }, token.token);
            });
        });
    });

    describe('eraseAccount', function () {
        var userToken;

        beforeEach(function (done) {
            utils.createUserAndToken(function (token) {
                userToken = token;
                done();
            });
        });

        describe('when no password is sent', function () {
            it('should return an error', function (done) {
                utils.request('delete', '/account', undefined, 400, function (err, result) {
                    expect(result.body.error).toBe(true);
                    done();
                }, userToken.token);
            });
        });

        describe('when the password is not correct', function () {
            it('should return an error', function (done) {
                utils.request('delete', '/account', {password: '1234'}, 400, function (err, result) {
                    expect(result.body.error).toBe(true);
                    done();
                }, userToken.token);
            });
        });

        describe('when the password is correct', function () {
            it('should erase the account', function (done) {
                utils.request('delete', '/account', {password: '12345678'}, 200, function (err, result) {
                    expect(result.body.error).toBe(false);

                    UserModel.find({_id: userToken.userId}, function (err, results) {
                        if (err) utils.fail();
                        expect(results.length).toBe(0);

                        TokenModel.find({userId: userToken.userId}, function (err, results) {
                            if (err) utils.fail();
                            expect(results.length).toBe(0);

                            done();
                        });
                    });
                }, userToken.token);
            });
        });
    });
});
