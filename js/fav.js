function unfav (button) {
    let id = button.value;
    $.post('/unfav', { id: id });
    document.getElementById(id).innerHTML = '';
}

function getTasks () {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/gettasks', true);

    xhr.onload = function () {
        let tasks = JSON.parse(xhr.responseText);
        let qq = '';
        if (tasks.data.length == 0){
            qq += '<div><h1> Ваш список дел пуст</h1>';
        }
        for (let i = 0; i < tasks.data.length; ++i) {
            let this_id = tasks.data[i].id;
            qq += '<div class="mero">';
            qq += '<h3>' + tasks.data[i].name + '<span id="' + this_id + '"><img src="style/img/star.png"><span></h3>';
            qq += '<block>';
            qq += '<div> Описание: ' + tasks.data[i].description + '</div>';
            qq += '<div> Дедлайн: ' + tasks.data[i].deadline + '</div>';
            qq += '<button type="button" onclick="unfav(this)" value="' + this_id + '" class="btn btn-warning">Выполнено</button>';
            qq += '</block></div>';
        }

        document.getElementById('result').innerHTML = qq;
        $('.mero h3').click(function () {
            if (!$(this).parent().find('block').is(':visible')) {
                $(this).parent().find('block').show(200)
            }
            else {
                $(this).parent().find('block').hide(200)
            }
        });
        $( ".change").click(function() {
            window.location.href = `/mero`;
        });
    }
    xhr.send()
};

getFav();