/**
 * 
 * @param {boolean} conditionalStatement 
 * @param {number} status 
 * @param {string} message 
 * @param {} next 
 */
const errorServices = (conditionalStatement, status = 400, message, next) => {
    if(conditionalStatement) {
        const error = {
            status: status,
            message: message
        }
        return next(error)
    }
}

export default errorServices