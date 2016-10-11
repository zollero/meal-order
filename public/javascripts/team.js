

;(function (window, document, $) {

    var addForm = $('#add-team-form');

    var lastTime;

    //TODO 搜索成员名进行查询，完整查询，非模糊查询
    //给搜索到的成员列添加点击事件，选择后添加到已选列表中
    $('#team-keyword').keyup(function (e) {
        lastTime = e.timeStamp;

        setTimeout(function () {
            if (lastTime - e.timeStamp === 0) {
                console.log(e.target.value);
            }
        }, 300);
    });

    $('#submit-btn').on('click', function () {
       if (validateForm()) {

       }
    });

    $.get('/team/getRelatedMenu', function (data) {
        if (data.status === 200) {
            var menuListEle = $('#menu-list');
            if (data.menus.length === 0) {
                //提示没有关联菜单，请添加菜单后再与团队关联
                menuListEle.append('<p class="text-center"><span class="glyphicon glyphicon-exclamation-sign text-danger"></span>&nbsp;你还没有创建任何菜单，可在创建团队后添加</p>')
            } else {
                var menuList = '',
                    selectedMenuListEle = $('#selectedMenuList');
                $.each(data.menus, function (index, value) {
                    menuList += '<li class="list-group-item checkbox"><label><input type="checkbox" menu-id="' + value._id + '" menu-name="' + value.menuName + '" />' + value.menuName + '</label></li>'
                });
                menuListEle.append(menuList);
                menuListEle.find('li input').on('click', function () {
                    var checked = $(this)[0].checked,
                        menuId = $(this).attr('menu-id'),
                        menuName = $(this).attr('menu-name');
                    if (checked) {
                        //添加选择
                        selectedMenuListEle.append('<span menu-id="' + menuId + '">' + menuName + '、</span>')
                    } else {
                        //取消选择
                        var unselectedMenuEle = selectedMenuListEle.find('span[menu-id=' + menuId + ']');
                        unselectedMenuEle.remove();
                    }
                });
            }
        }
    });


    function validateForm() {
        var teamNameEle = addForm.find('input[name=teamName]'),
            teamDescEle = addForm.find('textarea[name=teamDesc]');
        var teamName = teamNameEle.val(),
            teamDesc = teamDescEle.val();

        var formData = {};


        if (!teamName) {
            teamNameEle.parent().append('<label class="text-danger" style="position: absolute;top: 0;right: 30px;height: 34px;line-height: 34px;">团队名不能为空</label>');
            teamNameEle.parent().addClass('has-error');
            teamNameEle.parent().removeClass('has-success');
            formData.teamName = teamName;
        } else {
            teamNameEle.parent().find('label').remove();
            teamNameEle.parent().removeClass('has-error');
            teamNameEle.parent().addClass('has-success');
        }

        if (addForm.find('.has-error').length === 0) {
            return dishInfo;
        }
        return false;


    }



}(window, document, $));