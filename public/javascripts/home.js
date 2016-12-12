

;(function(window, document, $) {

    var teamListEle = $('#team-list');

    $('#team-modal-btn').on('click', function(e) {

        $.get('/home/getTeamList', function(data) {
            if (data.success) {
                var teamListHtml = '';
                if (data.list && data.list.length > 0) {
                    $.each(data.list, function(index, value) {
                        var menuListHtml = '';
                        if (value.menus && value.menus.length > 0) {
                            $.each(value.menus, function(i, v) {
                                menuListHtml += "<a class='menu-btn' href='#' menu-id='" + v.menuId + "'>" + v.menuName + "</a>&nbsp;&nbsp;";
                            });
                        } else {
                            menuListHtml = "<span class='glyphicon glyphicon-ban-circle text-danger'></span>&nbsp;该团队没有菜单";
                        }
                        teamListHtml += '<tr><td>' + value.teamName + '</td><td>' + value.creatorName + '</td>' +
                            '<td><a href="#" class="launch-btn" popover-content="' + menuListHtml + '" team-id="' + value._id + '" team-name="' + value.teamName + '">发起</a></td></tr>';
                    });
                } else {
                    teamListHtml += '<tr><td colspan="3" style="text-align: center;"><span class="glyphicon glyphicon-exclamation-sign text-danger"></span>&nbsp;你还没有加入任何团队</td></tr>';
                }
                teamListEle.html(teamListHtml);
                teamListEle.find('.launch-btn').on('click', launchHandler);
            } else {
                teamListEle.html('<span class="glyphicon glyphicon-ban-circle text-danger"></span>&nbsp;' + data.message);
            }
        }, 'json');
    });

    function launchHandler(e) {
        var teamId = $(this).attr('team-id');
        var popoverContent = $(this).attr('popover-content');

        var $activatePopover = $(this).popover({
            placement: 'top',
            trigger: 'focus',
            title: '<strong>选择菜单</strong>',
            content: popoverContent,
            html: true
        });
        $activatePopover.popover('show');

        $('.menu-btn').on('click', function(ee) {
            var menuId = ee.target.getAttribute('menu-id');
            $.post('/home/launchOrder', {
                teamId: teamId,
                menuId: menuId,
            }, (data) => {
                if (data.success) {
                    window.location.href = '/home/meal?orderId=' + data.orderId;
                } else {
                    alert(data.message);
                }
            });
        });
    }

}(window, document, $));