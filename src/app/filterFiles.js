

const filterObj = (reqBody, allowedFields) => {
    // log_func("obj=", obj)
    const newObj = {};
    Object.keys(reqBody).forEach(el => {
        // console.log("el=", el, allowedFields)
        if (allowedFields.includes(el)) newObj[el] = reqBody[el];
    });
    // console.log("new", newObj)
    return newObj;
};


/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
const pick = (object, keys) => {
    return keys.reduce((obj, key) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            // eslint-disable-next-line no-param-reassign
            obj[key] = object[key];
        }
        return obj;
    }, {});
};

exports.filterObj=filterObj
exports.pick=pick
module.exports = pick;