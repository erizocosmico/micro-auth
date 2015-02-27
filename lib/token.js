var mongoose = require('mongoose'),
    randToken = require('rand-token'),
    _ = require('lodash'),
    Schema = mongoose.Schema,
    util = require('./util');

/**
 * Creates the token model
 * @param {Object} options Options object. Can contain the following keys:
 * - {Number} defaultTokenExpiration: the token will expire X seconds after its creation
 * - {Object} customSchemaFields: object with the fields to add to the token Mongoose schema
 * - {Object} methods: Object with the methods to add to the model. The key will be the method name and its value will be the method itself
 * - {Object} statics: Object with the static methods to add to the model. The key will be the method name and its value will be the method itself
 * @returns {Model}
 */
function createTokenModel(options) {
    options = options || {};
    /**
     * Returns the token expiration date, that is, now + 30 days
     * @returns {Number}
     */
    var defaultTokenExpirationDate = function () {
        return new Date().getTime() + (options.defaultTokenExpiration || 2592000);
    };

    var tokenSchema = new Schema(_.merge({
        token: String,
        userId: Schema.Types.ObjectId,
        expiration: {type: Number, 'default': defaultTokenExpirationDate}
    }, options.customSchemaFields || {}));

    /**
     * Generates a new token
     * @param {ObjectId} userId ID of the user who owns the token
     * @returns {Object}
     */
    tokenSchema.statics.newToken = function (userId) {
        return _.merge({
            token: randToken.suid(options.tokenLength || 32),
            userId: userId,
            expiration: defaultTokenExpirationDate()
        }, options.defaultTokenValues || {});
    };

    /**
     * Finds a non-expired token with the given token
     * @param {String}   token       Token
     * @param {Function} callback    Callback function
     */
    tokenSchema.statics.findByToken = function (token, callback) {
        this.findOne({token: token})
            .where('expiration')
            .gt(new Date().getTime())
            .exec(callback);
    };

    util.addMethods(tokenSchema, options);

    return mongoose.model('Token', tokenSchema);
}

module.exports = createTokenModel;
