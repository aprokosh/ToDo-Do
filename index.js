const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(__dirname))
const urlencodedParser = bodyParser.urlencoded({extended: false});
var helmet = require('helmet');
app.use(helmet())
var Crypto = require('crypto-js')

var port = process.env.PORT || 3000;
app.listen(process.env.PORT ||port, () => {

    console.log(`Listening on port ${port}`)
})

const mongoClient = require("mongodb").MongoClient;
//const url = "mongodb://localhost:27017/";
const url = process.env.MONGODB_URI || "mongodb://tododo:ToDoDo1st@ds135036.mlab.com:35036/tododo";

app.use(session({
    secret: 'mylittlesecret',
    store: new MongoStore({url: process.env.MONGODB_URI || "mongodb://tododo:ToDoDo1st@ds135036.mlab.com:35036/tododo"}),
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 1000
    },
    resave: false,
    saveUninitialized: false
})
);

check_regex = function (regex, string){
    let ch = string.match(regex);
    if ((ch==null)||(ch[0]!==string)) return false;
    else return true;
}

app.post("/reg", urlencodedParser, function (req, res) {
    const regex = /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{6,16}/;
    let check = check_regex(regex, req.body.password1)
    mongoClient.connect(url, function (err, client) {
        client.db("tododo").collection("users").findOne({login: req.body.name}, function(err,result){
            if (result) {
                console.log("Имя пользователя уже используется")
                res.redirect('/regist')
            }
            else if (req.body.password1 != req.body.password2){
                console.log("Введенные пароли не совпадают!")
                res.redirect('/regist')
            }
            else if (!check) {
                console.log("Слабый пароль")
                res.redirect('/regist')
            }
            else {
                client.db("tododo").collection("users").insertOne({login: req.body.name, password: Crypto.SHA256(req.body.password1).toString(), tasks: []});
                res.sendFile(__dirname + '/autho.html')
            }
        });
    });
});

app.post("/login", urlencodedParser, function (req, res) {
    mongoClient.connect(url, function (err, client) {
        client.db("tododo").collection("users").findOne({login: req.body.login}, function(err,result){
            if (result) {
                if (Crypto.SHA256(req.body.password).toString() === result.password) {
                    req.session.authorized = true;
                    req.session.username = req.body.login;
                    res.redirect('/menu');
                }
                else {
                    console.log('Неверный пароль');
                    res.redirect('/')
                }
            }
            else {
                console.log('Пользователя с таким именем не существует');
                res.redirect('/')
            }
        });
    });
});

app.get('/logout', (req, res) => {
    delete req.session.authorized;
    delete req.session.username;
    mongoClient.connect(url, function (err, client) {
        client.db("tododo").collection("tasks").delete({"author": "deleted_task__"})
    });
    res.redirect('/')
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/autho.html')
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/autho.html')
});

app.get('/regist', (req, res) => {
    res.sendFile(__dirname + '/regist.html')
});

app.get('/tasks', (req, res) => {
    if (req.session.authorized) {
        res.sendFile(__dirname + '/main.html')
    }
    else
        res.redirect('/')
});

//some functions

find_task_by_id = function(id) {
    return new Promise(function (resolve, reject) {
        mongoClient.connect(url, async function (err, client) {
            await client.db("tododo").collection("tasks").findOne({"_id": ObjectId(id)}).then((res) => {
                resolve(res);
            });
        });
    });
}

get_task_id = function(name, author) {
    return new Promise(function (resolve, reject) {
        mongoClient.connect(url, async function (err, client) {
            await client.db("tododo").collection("tasks").findOne({"name": name, "author": author}).then((res) => {
                resolve(res._id);
            });
        });
    });
}

app.post("/add", urlencodedParser, function (req, res) {
    mongoClient.connect(url, function (err, client) {
        client.db("tododo").collection("tasks").insertOne({
            name: req.body.name,
            description: req.body.desc,
            deadline: req.body.date,
            author: req.session.username,
            status: "active"
        })
    });
    new_id = get_task_id(req.body.name, req.session.username);
    mongoClient.connect(url, function (err, client) {
        client.db("tododo").collection("users").findOneAndUpdate(
            { "login" : req.session.username},{$addToSet: { fav: new_id}})
    });
    res.redirect('/tasks')
});


app.get('/getusername', (req, res) => {
    res.send(req.session.username);
});

ObjectId = require("mongodb").ObjectID;

app.get('/gettasks', (req, res) => {
    let tsks = [];
    mongoClient.connect(url, async function (err, client) {
        client.db("tododo").collection("users").findOne({login: req.session.username}, async function (err, result) {
            for (var i = 0; i < result.tasks.length; ++i) {
                find_task_by_id(result.tasks[i]).then(function(res) {
                    tsks.push({
                        id: res._id,
                        name: res.name,
                        deadline: res.deadline,
                        description: res.description,
                        status: "active"
                    });
                });
            }
            setTimeout(function() {
                console.log(JSON.stringify(tsks));
                res.status(200).send({data: tsks})
            }, 3000);
        });
    });
});

app.post('/delete', (req, res) => {
    let id = req.body.id;
    mongoClient.connect(url, function (err, client) {
        client.db("tododo").collection("users").findOneAndUpdate(
            { "login" : req.session.username},{$pull: { fav: ObjectId(id)}})
        client.db("tododo").collection("tasks").findOneAndUpdate(
            { "_id" : ObjectId(id)},{"author": "deleted_task__"})
    });
});

app.post('/undelete', (req, res) => {
    let id = req.body.id;
    mongoClient.connect(url, function (err, client) {
        client.db("tododo").collection("users").findOneAndUpdate(
            { "login" : req.session.username},{$addToSet: { tasks: ObjectId(id)}})
        client.db("tododo").collection("tasks").findOneAndUpdate(
            { "_id" : ObjectId(id)},{"author": req.session.username})
    });
});

app.post('/done', (req, res) => {
    let id = req.body.id;
    mongoClient.connect(url, function (err, client) {
        client.db("tododo").collection("tasks").findOneAndUpdate(
            { "_id" : ObjectId(id)},{"status": "done"});
});

app.post('/undone', (req, res) => {
    let id = req.body.id;
    mongoClient.connect(url, function (err, client) {
        client.db("metodbase").collection("mero").findOneAndUpdate(
            { "_id" : ObjectId(id)},{"status": "active"});
});