

;(function (window, document, $) {

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


}(window, document, $));