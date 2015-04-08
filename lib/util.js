/**
 * Adds methods in options to the given schema
 * @param {Schema} schema  Schema object
 * @param {Object} options Options object
 * @param {String} kind    Kind of methods to add
 */
function addMethods(schema, options, kind) {
    if (options[kind] && typeof options[kind] === 'object') {
        for (var name in options[kind]) {
            if (options[kind].hasOwnProperty(name) && typeof options[kind][name] === 'function') {
                schema[kind][name] = options[kind][name];
            }
        }
    }
}

module.exports = {
    /**
     * Adds methods and static methods in options to the schema
     * @param {Schema} schema  Schema
     * @param {Object} options Options object
     */
    addMethods: function (schema, options) {
        addMethods(schema, options, 'methods');
        addMethods(schema, options, 'statics');
    }
};
