# µAuth [![Build Status](https://travis-ci.org/mvader/micro-auth.svg)](https://travis-ci.org/mvader/micro-auth)
µAuth is a small and configurable user system with login/signup, logout, erase user account and authentication middleware for Express framework.

## Install

```
npm install micro-auth
```

## Usage

```javascript
var microAuth = require('micro-auth');

// Because the token model can be customized we need to create a new token model
// passing an options object is optional
var tokenModel = microAuth.createTokenModel();

// Because the user model can be customized we need to create a new user model
// passing an options object is optional
var userModel = microAuth.createUserModel();

// Since the user and the token models are created by the user, it is needed to pass it
// to the auth middleware
var auth = microAuth.createAuthMiddleware(tokenModel, userModel);

// Since the user and the token models are created by the user, it is needed to pass it
// to the controller
var controller = microAuth.createUserController(tokenModel, userModel);

// app is an Express.js app
app.post('/login', controller.loginOrSignup);
app.delete('/logout', auth, controller.logout);
app.delete('/account', auth, controller.eraseAccount);
```

### Options for TokenModel

* *{Number} defaultTokenExpiration:* the number of seconds the token will be valid
* *{Object} customSchemaFields:* custom fields for the Token schema. Must be valid Mongoose fields
* *{Number} tokenLength:* default length of the token random string
* *{Object} defaultTokenValues:* provide some default values for the custom schema fields you defined when creating a new token
* *{Object} statics:* Static methods to be added to the schema. The object key will be the method name and the value will be the method. The value must be a function.
* *{Object} methods:* Instance methods to be added to the schema. The object key will be the method name and the value will be the method. The value must be a function.

### Options for UserModel

* *{Object} customSchemaFields:* custom fields for the User schema. Must be valid Mongoose fields
* *{Object} statics:* Static methods to be added to the schema. The object key will be the method name and the value will be the method. The value must be a function.
* *{Object} methods:* Instance methods to be added to the schema. The object key will be the method name and the value will be the method. The value must be a function.
* *{Number} saltWorkFactor:* BCrypt salt work factor for crypting passwords

### Methods of the UserController

### loginOrSignup
If the provided data is valid and does not exist on the server the user will be signed up and a token for that user will be returned.
If the data already exists on the server the user will be signed in.

*This controller expects 2 params in the body:"
* *username*: User username
* *password*: User password

A successful request (either login or signup) will respond with this:
```json
{
    "error": false,
    "token": "my token",
    "expiration": expiration of my token
}
```

An invalid request will respond with this:
```json
{
    "error": true,
    "message": "Error message"
}
```

#### logout

Will erase the token you use to authenticate yourself. Auth middleware must precede this handler's invocation in the endpoint.
The error response is the same as the one that loginOrSignup would send. If the request is successfuly you will get this:

```json
{
    "success": true
}
```

#### eraseAccount

Destroys the user account associated to the token you used to authenticate yourself. Auth middleware must precede this handler's invocation in the endpoint.
The error response is the same as the one that loginOrSignup would send. If the request is successfuly you will get this:

```json
{
    "success": true
}
```

### Options for user controller

There are a few hooks you can use to customize the user controllers. All hooks are functions that will receive the same parameters an express middleware would receive.
**Note:** they will not send any response. If you use these hooks you will have to send a response yourself on your handler.

* **onLogin:** invoked after the user is logged in or signed up and the token is created. In order to know if it was a register or a login you can access the ```isLogin``` or ```isSignup``` available on the ```req``` parameter. The generated token is also available as ```token``` on the request.
* **onLogout** invoked after the user is logged out.
* **onEraseAccount:** invoked after the user and its tokens are removed.

**Example hook:**
```javascript
function onEraseAccount(req, res, next) {
    // Remove user-related stuff after it is deleted
    MyOtherModel.remove({userId: req.user._id}, function (err) {
        if (err) next(err);

        res.send({
            'error': false
        });
    });
}

microAuth.createUserController(tokenModel, userModel, {
    onEraseAccount: onEraseAccount
});
```

### Authentication

The authentication middleware will the for a value like "Bearer: MY TOKEN" in the Authorization header. If the token is valid an is associated to the user it will pass to the next handler, otherwise it will throw a 401 error using the Express next(error) mechanism (which you really should be using for managing errors in your express app).
An invalid request will respond with something like this:
```json
{
    "error": false,
    "message": "Error message"
}
```

### TODO
* Test custom options