

;(function (window, document, $) {

    $('.edit-btn').on('click', function () {
        //TODO 考虑怎么将参数传递给后端，后端需要对这些参数做怎样的处理
        var menuId = $(this).parent().attr('_id');
        //$.post('/menu/edit', { menuId: menuId }, function(data) {
        //    if (!data.success) {
        //        alert(data.message);
        //    }
        //}, 'json');
        window.location.href = '/menu/edit?menuId=' + menuId;
    });

    $('.del-btn').on('click', function () {
        //TODO 给一个确认提示
    });

}(window, document, $));