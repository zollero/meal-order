

;(function (window, document, $) {

    var addForm = $('#add-team-form');

    var lastTime;

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
        console.log(data);
        if (data.status === 200) {
            if (data.menus.length === 0) {
                //提示没有关联菜单，请添加菜单后再与团队关联
            } else {
                var menuList = '';
                $.each(data.menus, function (index, value) {
                    menuList += '<li class="list-group-item">' + value.menuName + '</li>'
                });
                $('#menu-list').append(menuList);
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