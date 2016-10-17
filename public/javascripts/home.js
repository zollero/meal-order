

;(function(window, document, $) {

    var teamListEle = $('#team-list');

    $('#team-modal-btn').on('click', function(e) {

        $.get('/home/getTeamList', function(data) {
            console.log(data);
            if (data.success) {
                var teamListHtml = '';
                if (data.list && data.list.length > 0) {
                    $.each(data.list, function(index, value) {
                        teamListHtml += '<tr><td>' + value.teamName + '</td><td>' + value.creatorName + '</td><td><a href="#" class="launch-btn" team-id="' + value._id + '">发起</a></td></tr>';
                    });
                } else {
                    teamListHtml += '<span class="glyphicon glyphicon-exclamation-sign text-danger"></span>&nbsp;你还没有加入任何团队';
                }
                teamListEle.html(teamListHtml);
                teamListEle.find('.launch-btn').on('click', launchHandler);
            }
        }, 'json');
    });

    function launchHandler(e) {
        console.log(e.target);
    }

}(window, document, $));