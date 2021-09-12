const adminList = ['abc@123.com']

const isAdminInWhiteList = (user) => {
    if (adminList.includes(user.email.trim())) {
        return true
    }
    return false
}
exports.isAdminInWhiteList =isAdminInWhiteList