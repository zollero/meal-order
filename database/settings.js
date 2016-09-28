/**
 * 连接mongodb数据库的配置项
 * @type {{COOKIE_SECRET: string, URL: string, DB: string, HOST: string, PORT: number, NAME: string, PASSWORD: string}}
 */

module.exports = {
    COOKIE_SECRET: 'bear',
    URL: 'mongodb://admin:123456@127.0.0.1:27017/food',
    DB: 'food',
    HOST: '127.0.0.1',
    PORT: 27017,
    NAME: 'admin',
    PASSWORD: '123456'
};
