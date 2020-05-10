function done (button) {
    let id = button.value;
    $.post('/done', { id: id });
    qq = "";
    qq += '<button type="button" onclick="undone(this)" value="' + id + '" class="btn btn-warning">Отменить выполнение</button>';
    qq += '<button type="button" onclick="del(this)" value="' + id + '" class="btn btn-warning mml">Удалить</button>';
    markername = "done_marker" + id;
    document.getElementById(markername).innerHTML = '<img class="mml" src="style/img/ok.png">';
    activename = "isActive" + id;
    document.getElementById(activename).className = "done";
    idname = "buttons_done" + id
    document.getElementById(idname).innerHTML = qq;
}

function undone (button) {
    let id = button.value;
    $.post('/undone', { id: id });
    qq = "";
    qq += '<button type="button" onclick="done(this)" value="' + id + '" class="btn btn-warning">Выполнено</button>';
    qq += '<button type="button" onclick="del(this)" value="' + id + '" class="btn btn-warning mml">Удалить</button>';
    markername = "done_marker" + id;
    document.getElementById(markername).innerHTML = '';
    activename = "isActive" + id;
    document.getElementById(activename).className = "active";
    idname = "buttons_done" + id;
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
                qq += '<h3 id="isActive'  + this_id + '" class="done">'
            }
            else {
                qq+= '<h3 id="isActive'  + this_id + '" class="active">'
            }
            qq += '<span id="' + this_id + '"><span>' + tasks.data[i].name + '</span>'
            if (tasks.data[i].status === "done") qq += '<span id="done_marker'  + this_id + '"><img class="mml" src="style/img/ok.png"></span>'
            qq += '</span></h3>';
            qq += '<block>';
            qq += '<div>' + tasks.data[i].description + '</div>';
            qq += '<div>' + parsing_date(tasks.data[i].deadline) + '</div>';
            if (tasks.data[i].status === "done") {
                qq += '<div id="buttons_done'  + this_id + '">';
                qq += '<button type="button" onclick="undone(this)" value="' + this_id + '" class="btn btn-warning">Отменить выполнение</button>';
                qq += '<button type="button" onclick="del(this)" value="' + this_id + '" class="btn btn-warning mml">Удалить</button>';
                qq += '</div>'
            }
            else {
                qq += '<div id="buttons_done'  + this_id + '">';
                qq += '<button type="button" onclick="done(this)" value="' + this_id + '" class="btn btn-warning">Выполнено</button>';
                qq += '<button type="button" onclick="del(this)" value="' + this_id + '" class="btn btn-warning mml">Удалить</button>';
                qq += '</div>'
            }
            qq += '</block></div>';
        }

        document.getElementById('result').innerHTML = qq;
        $('.accord h3').on('click', function (e) {
            if (!$(this).parent().find('block').is(':visible')) {
                $(this).parent().find('block').show(350)
            } else {
                $(this).parent().find('block').hide(350)
            }
        });
    }
    xhr.send()
};
$(document).ready(function() {
    $('.accord1 h3').on('click', function (e) {
        if ($(this).parent().find('block').is(':visible')) {
            $(this).parent().find('block').hide(350)
        } else {
            $(this).parent().find('block').show(350)
        }
    });
});

function parsing_date(date_){
    var parsed = new Date(date_);
    day = parseInt(parsed.getDate())
    mon = parseInt(parsed.getMonth())+1
    if (mon <10) {
        mon = '0' + mon
    }
    if (day <10){
        day = '0' + day
    }
    else q = parsed.getDate()+1
    var date   =  day + '.' + mon + '.' + parsed.getFullYear();
    return date
}


getTasks();