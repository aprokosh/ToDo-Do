let mongoose = require("mongoose");
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../index.js');
let should = chai.should();
chai.use(chaiHttp);
var expect = require('chai').expect;
var sinonChai = require('sinon-chai');
var sinon = require('sinon');

chai.use(sinonChai);

var assert = require('assert');
describe("get_task_id", async function() {
    it("возвращает id задания по названию и имени автора", async function() {
        assert.equal(await get_task_id("test1", "Ania"), "5eb5bf487912002b38351f1c");
        assert.equal(await get_task_id("test2", "Ania"), "5eb5c8712a0e9a239c4992b1");
    });
});


describe('/', () => {
    it('should get status 200', (done) => {
        chai.request('http://localhost:3000')
            .get('/')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
});

describe('/POST method registration', () => {
    beforeEach(function() {
        sinon.spy(console, 'log');
    });

    afterEach(function() {
        console.log.restore();
    });

    it('it should call console log', (done) => {
        let user = {
            login: "ann",
            password1: "123first",
            password2: "456wrong"
        }
        chai.request('http://localhost:3000')
            .post('/reg')
            .send(user)
            .end((err, res) => {
                expect(console.log).to.be.called;
                done();
            });
    });
});

describe('/POST method login', () => {
    beforeEach(function() {
        sinon.spy(console, 'log');
    });

    afterEach(function() {
        console.log.restore();
    });

    it('it should call console', (done) => {
        let user = {
            login: "someuser",
            password: "123",
        }
        chai.request('http://localhost:3000')
            .post('/login')
            .send(user)
            .end((err, res) => {
                expect(console.log).to.be.called;
                done();
            });
    });
});




describe('/gettasks', () => {
    it('should return Object(data)', (done) => {
        chai.request('http://localhost:3000')
            .get('/gettasks')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Object');
                done();
            });
    });
});

setTimeout(process.exit, 15000)

//postRegist, postLogin, getLogout, getMain, getLogin,
// getRegist, getTasksPage, find_task_by_id
// postAdd};

//done - get_task_id
