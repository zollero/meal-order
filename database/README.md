
# 数据库设计

## 说明

数据库使用Mongodb，在nodeJS环境中，使用mongoose来进行数据库的连接及增删改查的操作。


## 数据库列表

1. 用户表

* 表名： food_user
* 表结构 
        
        {
            _id: String,    //唯一ID，数据库自动生成
            username: String,   //用户名
            password: String,   //密码
            email: String       //邮箱
        }
        
2. 菜单表

* 表名： food_menu
* 表结构

        {   
            _id: String,    //唯一id，数据库自动生成
            creatorName: String,   //创建者用户名
            menuName: String,   //菜单名
            dishes: [{
                dishName: String,   
                price: Float
            }]
        }
        
3. 团队表

* 表名： food_team
* 表结构

        {   
            _id: String,    //唯一id,数据库自动生成
            teamName: String,   //团队名
            creatorName: String,    //创建者用户名
            teamDesc: String,   //团队描述
            members: ['feiyu', 'corona'],   //团队成员
            menus: ['_menuid1', '_menuid2'] //该团队关联菜单
        }

