
'use strict';

const ONE_SECOND = 1,
      ONE_MINUTE = 60 * ONE_SECOND,
      ONE_HOUR = 60 * ONE_MINUTE,
      ONE_DAY = 24 * ONE_HOUR;

function formatDate2Local(date) {
    const year = date.getFullYear(),
          month = date.getMonth() + 1,
          day =  date.getDate(),
          hour = date.getHours(),
          minute = date.getMinutes(),
          second = date.getSeconds();
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

/**
 * 校验用户是否登录,若未登录,则跳转到登录页面
 * @param req
 * @param res
 */
const authentication = function(req, res) {
    if (!req.session.user) {
        req.session.error = '请先登录';
        res.redirect('/user/login');
        return false;
    }
    return true;
};

const dateFormat = function (date) {
    const currentDate = new Date();
    const daysOfThisMonth = (new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)).getDate();
    const diffTime = (currentDate.getTime() - date.getTime()) / 1000;
    if (diffTime >= ONE_SECOND && diffTime < ONE_MINUTE) {
        return Math.floor(diffTime / ONE_SECOND) + '秒前';
    } else if (diffTime >= ONE_MINUTE && diffTime < ONE_HOUR) {
        return Math.floor(diffTime / ONE_MINUTE) + '分钟前';
    } else if (diffTime >= ONE_HOUR && diffTime < ONE_DAY) {
        return Math.floor(diffTime / ONE_HOUR) + '小时前';
    } else if (diffTime >= ONE_DAY && diffTime < ONE_DAY * daysOfThisMonth) {
        return Math.floor(diffTime / ONE_DAY) + '天前';
    }
    return formatDate2Local(date);
};

const formatOrderStatus = status => {
    switch (status){
        case 0:
            return '未完成';
        case 1:
            return '已完成';
        case 2:
            return '已取消';
        case 3:
            return '超时自动取消';
        default:
            return status;
    }
};

module.exports = {
    authentication: authentication,
    dateFormat: dateFormat,
    formatOrderStatus: formatOrderStatus
};