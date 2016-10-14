

;(function (window, document, $) {

    $('.edit-btn').on('click', function () {
        var menuId = $(this).parent().attr('_id');
        window.location.href = '/menu/edit?menuId=' + menuId;
    });

    $('.del-btn').on('click', function () {
        //TODO 给一个确认提示
        var menuId = $(this).parent().attr('_id');
        $.post('/menu/del', {menuId: menuId}, function(data) {
            if (data.success) {
                window.location.reload();
            } else {
                alert(data.message);
            }
        });
    });

}(window, document, $));