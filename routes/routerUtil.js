
'use strict';

/**
 * 校验用户是否登录,若未登录,则跳转到登录页面
 * @param req
 * @param res
 */
let authentication = function(req, res) {
    if (!req.session.user) {
        req.session.error = '请先登录';
        res.redirect('/user/login');
        return false;
    }
    return true;
};

module.exports = {
    authentication: authentication
};