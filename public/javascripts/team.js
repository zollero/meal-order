

;(function (window, document, $) {

    var lastTime;
    var teamListEle = $('#team-list');

    $('.edit-btn').on('click', function () {
        var teamId = $(this).attr('_id');
        window.location.href = '/team/edit?teamId=' + teamId;
    });

    $('.del-btn').on('click', function () {
        //TODO 给一个确认提示
        var teamId = $(this).attr('_id');
        $.post('/team/del', {teamId: teamId}, function(data) {
            if (data.success) {
                window.location.reload();
            } else {
                alert(data.message);
            }
        });
    });

    $('#team-keyword').on('keyup', function (e) {
        lastTime = e.timeStamp;
        setTimeout(function () {
            if (lastTime - e.timeStamp === 0) {
                var keyWord = e.target.value.trim();
                if (keyWord.length === 0) return;
                $.ajax({
                    url: '/team/getTeamList',
                    data: { keyword: keyWord },
                    dataType: 'json',
                    success: function (data) {
                        console.log(data);
                        if (data.success) {
                            if (data.list && data.list.length > 0) {
                                var teamListHtml = '';
                                $.each(data.list, function (index, value) {
                                    if (value.in) {
                                        teamListHtml += '<li class="list-group-item" _id="' + value.teamId + '"><span class="glyphicon glyphicon-ok-sign text-success"></span>&nbsp;&nbsp;' + value.teamName + '</li>';
                                    } else {
                                        teamListHtml += '<li class="list-group-item" _id="' + value.teamId + '"><span class="glyphicon glyphicon-plus-sign text-info" role="button"></span>&nbsp;&nbsp;' + value.teamName + '</li>';
                                    }

                                });
                                teamListEle.html(teamListHtml);
                                teamListEle.find('li span[role=button]').on('click', selectTeamHandler);
                            } else {
                                teamListEle.html('<span class="glyphicon glyphicon-exclamation-sign text-danger"></span>&nbsp;没查到，换一个试试吧');
                            }
                        } else {
                            if (data.message) alert(data.message);
                        }
                    }
                });
            }
        }, 300);
    });

    function selectTeamHandler() {
        var _this = $(this);
        var teamId = _this.parent().attr('_id');
        $.post('/team/join', {teamId: _id}, function (data) {
            console.log(data);
            if (data.success) {
                _this.removeAttr('role');
                _this[0].classList = 'glyphicon glyphicon-ok-sign text-success';
                _this.off('click', selectTeamHandler);
                //TODO 将添加成功的团队添加到列表中展示
            } else {
                _this.attr('role', 'button');
                _this[0].classList = 'glyphicon glyphicon-plus-sign text-info';
                _this.on('click', selectTeamHandler);
            }
            if (data.message) alert(data.mesage);
        });
    }


}(window, document, $));