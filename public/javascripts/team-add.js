

;(function (window, document, $) {

    var addForm = $('#add-team-form'),
        memberSearchList = $('#member-list'),
        selectedMemberList = $('#selectedMemberList'),
        selectedMenuListEle = $('#selectedMenuList');

    var lastTime;

    //搜索成员名进行查询，完整查询，非模糊查询
    //给搜索到的成员列添加点击事件，选择后添加到已选列表中
    $('#team-keyword').keyup(function (e) {
        lastTime = e.timeStamp;
        setTimeout(function () {
            if (lastTime - e.timeStamp === 0) {
                var keyWord = e.target.value.trim();
                if (keyWord.length === 0) return;
                $.ajax({
                    url: '/user/getUserByName',
                    data: { keyword: keyWord },
                    dataType: 'json',
                    success: function (data) {
                        if (data.status === 200) {
                            if (data.users && data.users.length > 0) {
                                var selectedMemberEles = selectedMemberList.find('label').toArray();
                                $.each(data.users, function (index, value) {
                                    var selectedFlag = selectedMemberEles.some(function (v) {
                                        return v.getAttribute('username') === value.username;
                                    });
                                    if (selectedFlag) {
                                        memberSearchList.html('<li class="list-group-item" username="' + value.username + '"><span class="glyphicon glyphicon-ok-sign text-success"></span>&nbsp;&nbsp;' + value.username + '</li>');
                                    } else {
                                        memberSearchList.html('<li class="list-group-item" username="' + value.username + '"><span class="glyphicon glyphicon-plus-sign text-info" role="button"></span>&nbsp;&nbsp;' + value.username + '</li>');
                                    }
                                });
                                memberSearchList.find('li span[role=button]').on('click', selectTeamMemberHandler);
                            } else {
                                memberSearchList.html('<span class="glyphicon glyphicon-exclamation-sign text-danger"></span>&nbsp;没查到，换一个试试吧');
                            }
                        } else {
                            if (data.message) alert(data.message);
                        }
                    }
                });
            }
        }, 300);
    });

    $('#member-modal').on('hidden.bs.modal', function () {
        $('#team-keyword').val('');
        memberSearchList.empty();
    });

    function selectTeamMemberHandler() {
        var dataLi = $(this).parent();
        var username = dataLi.attr('username');
        selectedMemberList.append('<label style="padding: 5px;margin-right: 5px;border-radius:5px;background:#00e7af" username="' + username + '">' + username + '&nbsp;<span class="glyphicon glyphicon-remove text-danger" role="button"></span></label>');
        $(this).removeAttr('role');
        $(this)[0].classList = 'glyphicon glyphicon-ok-sign text-success';
        $(this).off('click', selectTeamMemberHandler);
    }

    //添加已选成员的删除按钮的方法
    selectedMemberList.on('click', function (e) {
        var target = e.target;
        var targetNodeName = target.nodeName;
        if (targetNodeName === 'SPAN') {
            $(target).parent().remove();
        }
    });

    $('#submit-btn').on('click', function () {
        var teamInfo = validateForm();
        if (teamInfo) {
            //将数据添加到数据库
            var btn = $(this).parent().find('button').button('loading');
            $.ajax({
                url: '/team/add',
                method: 'post',
                data: teamInfo,
                dataType: 'json',
                success: function(data) {
                    if (data.success) {
                        window.location.href = '/team';
                    } else {
                        alert(data.message);
                    }
                },
                error: function() {
                    alert('创建失败');
                },
                complete: function() {
                    btn.button('reset');
                }
            });
        }
    });

    $.get('/team/getRelatedMenu', function (data) {
        if (data.status === 200) {
            var menuListEle = $('#menu-list');
            var selectedMenus = selectedMenuListEle.find('span').toArray();
            if (data.menus.length === 0) {
                //提示没有关联菜单，请添加菜单后再与团队关联
                menuListEle.append('<p class="text-center"><span class="glyphicon glyphicon-exclamation-sign text-danger"></span>&nbsp;你还没有创建任何菜单，可在创建团队后添加</p>')
            } else {
                var menuList = '';
                $.each(data.menus, function (index, value) {
                    var selectedFlag = selectedMenus.some(function (v) {
                        return v.getAttribute('menu-id') === value._id;
                    });
                    menuList += '<li class="list-group-item checkbox"><label><input type="checkbox" menu-id="' + value._id + '"' + (selectedFlag ? ' checked="checked" ' : '') + ' menu-name="' + value.menuName + '" />' + value.menuName + '</label></li>'
                });
                menuListEle.append(menuList);
                menuListEle.find('li input').on('click', function () {
                    var checked = $(this)[0].checked,
                        menuId = $(this).attr('menu-id'),
                        menuName = $(this).attr('menu-name');
                    if (checked) {
                        //添加选择
                        selectedMenuListEle.append('<span menu-id="' + menuId + '" menu-name="' + menuName + '">' + menuName + '、</span>')
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
            var selectedMembers = selectedMemberList.find('label'),
                selectedMenus = selectedMenuListEle.find('span');
            var members = [], menus = [];
            $.each(selectedMembers, function (i, v) {
                members.push(v.getAttribute('username'));
            });
            $.each(selectedMenus, function (i, v) {
                menus.push({
                    menuId: v.getAttribute('menu-id'),
                    menuName: v.getAttribute('menu-name')
                });
            });

            return {
                teamName: teamName,
                teamDesc: teamDesc,
                members: members,
                menus: menus
            };
        }
        return false;
    }

}(window, document, $));