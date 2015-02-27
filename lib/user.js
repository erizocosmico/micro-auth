var mongoose = require('mongoose'),
    _ = require('lodash'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema,
    DEFAULT_SALT_WORK_FACTOR = 10,
    util = require('./util');

/**
 * Creates the user model
 * @param {Object} options Options object. Can contain the following keys:
 * - {Number} saltWorkFactor: the bcrypt salt work factor
 * - {Object} customSchemaFields: object with the fields to add to the token Mongoose schema
 * - {Object} methods: Object with the methods to add to the model. The key will be the method name and its value will be the method itself
 * - {Object} statics: Object with the static methods to add to the model. The key will be the method name and its value will be the method itself
 * @returns {Model}
 */
function createUserModel(options) {
    options = options || {};

    var userSchema = new Schema(_.merge({
        username: {type: String, trim: true},
        password: String,
        creationDate: {type: Date, 'default': Date.now}
    }, options.customSchemaFields || {}));

    /**
     * Compares a password against the hashed password to see if they match
     * @param {String} password Password
     * @returns {Boolean}
     */
    userSchema.methods.passwordMatches = function (password) {
        return bcrypt.compareSync(password, this.password);
    };

    /**
     * Finds all users with the given username
     * @param {String}   username    Email
     * @param {Function} callback    Callback function
     */
    userSchema.statics.findByUsername = function (username, callback) {
        this.findOne({username: new RegExp(username, 'i')}, callback);
    };

    util.addMethods(userSchema, options);

    // Automatically hash the password before it's saved
    userSchema.pre('save', function (next) {
        var user = this;

        if (!user.isModified('password')) return next();

        bcrypt.genSalt(options.saltWorkFactor || DEFAULT_SALT_WORK_FACTOR, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);

                user.password = hash;
                next();
            });
        });
    });

    return mongoose.model('User', userSchema);
}

module.exports = createUserModel;
