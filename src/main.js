function done (button) {
    let id = button.value;
    $.post('/done', { id: id });
    qq = "";
    qq += '<button type="button" onclick="undone(this)" value="' + id + '" class="btn btn-warning">Отменить выполнение</button>';
    qq += '<button type="button" onclick="del(this)" value="' + id + '" class="btn btn-warning mml">Удалить</button>';
    document.getElementById("done_marker").innerHTML = '<img class="mml" src="style/img/ok.png">';
    document.getElementById("isActive").className = "done";
    idname = "buttons_done" + id
    document.getElementById(idname).innerHTML = qq;
}

function undone (button) {
    let id = button.value;
    $.post('/undone', { id: id });
    qq = "";
    qq += '<button type="button" onclick="done(this)" value="' + id + '" class="btn btn-warning">Выполнено</button>';
    qq += '<button type="button" onclick="del(this)" value="' + id + '" class="btn btn-warning mml">Удалить</button>';
    document.getElementById("done_marker").innerHTML = '';
    document.getElementById("isActive").className = "active";
    dname = "buttons_done" + id
    document.getElementById(idname).innerHTML = qq;
}

function del (button) {
    let id = button.value;
    $.post('/delete', { id: id });
    idname = "accord" + id
    document.getElementById(idname).innerHTML = '';
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
            qq += '<div id="accord' + this_id + '" class="accord">';
            if (tasks.data[i].status === "done"){
                qq += '<h3 id="isActive" class="done">'
            }
            else {
                qq+= '<h3 id="isActive" class="active">'
            }
            qq += '<span id="' + this_id + '"><span>' + tasks.data[i].name + '</span>'
            if (tasks.data[i].status === "done") qq += '<span id="done_marker"><img class="mml" src="style/img/ok.png"></span>'
            qq += '</span></h3>';
            qq += '<block>';
            qq += '<div>' + tasks.data[i].description + '</div>';
            qq += '<div>' + parsing_date(tasks.data[i].deadline) + '</div>';
            if (tasks.data[i].status === "done") {
                qq += '<div id="buttons_done'  + id + '">'
                qq += '<button type="button" onclick="undone(this)" value="' + this_id + '" class="btn btn-warning">Отменить выполнение</button>';
                qq += '<button type="button" onclick="del(this)" value="' + this_id + '" class="btn btn-warning mml">Удалить</button>';
                qq += '</div>'
            }
            else {
                qq += '<div id="buttons_done'  + id + '">'
                qq += '<button type="button" onclick="done(this)" value="' + this_id + '" class="btn btn-warning">Выполнено</button>';
                qq += '<button type="button" onclick="del(this)" value="' + this_id + '" class="btn btn-warning mml">Удалить</button>';
                qq += '</div>'
            }
            qq += '</block></div>';
        }

        document.getElementById('result').innerHTML = qq;
        $('.accord h3').on('click', function (e) {
            if (!$(this).parent().find('block').is(':visible')) {
                $(this).parent().find('block').show(200)
            } else {
                $(this).parent().find('block').hide(200)
            }
        });
    }
    xhr.send()
};

$('.accord h3').click( function (e) {
    if (!$(this).parent().find('block').is(':visible')) {
        $(this).parent().find('block').show(200)
    } else {
        $(this).parent().find('block').hide(200)
    }
});

function parsing_date(date_){
    var parsed = new Date(date_);
    var q = '';
    if ((parsed.getMonth()+1) <10){
        q = '0'+parsed.getMonth()+1
    }
    else q = parsed.getMonth()+1
    var date   =  parsed.getDate() + '.' + q + '.' + parsed.getFullYear();
    return date
}


getTasks();