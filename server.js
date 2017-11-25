const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const bodyParser = require('body-parser');

const User = require('./models/user').User;

const PORT = 3000;
const mongodbAdress = '127.0.0.1:27017';

var adminIsAuthentificated = false;

mongoose.connect('mongodb://' + mongodbAdress + '/premierjc',{
    useMongoClient: true,
    autoReconnect: true
}, (err) => {
    if(err) throw err;
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.use(express.static(__dirname + '/public'));

app.post('/login', (req, res) => {
    if(req.body.login === 'admin' && req.body.password === 'admin'){
        adminIsAuthentificated = true;
        res.status(200).send({redirect: '/admin'});
    } else res.status(200).send(false);
});

app.get('/admin', (req, res) => {
    if(adminIsAuthentificated)
        res.sendFile('admin.html', { root: __dirname + '/public' });
    else res.redirect('/');
});

app.get('/users', (req, res) => {
    User.find((err, users) => {
        if(err) res.send({ err: 'Bad connection with db' });
        res.send(users);
    });
});

app.post('/user/removePassword', (req, res) => {
    var newUser = new User ({
        _id: req.body._id,
        username: req.body.username,
        name: req.body.name,
        lastname: req.body.lastname,
        mail: req.body.mail,
        created: req.body.created,
        phone: req.body.phone,
        travelStory: req.body.travelStory
    });
    User.findByIdAndRemove(req.body._id, (err, user) => {
        if (err) throw err;
    });
    newUser.save((err) => {
        if(err) res.status(500).send(err);
        res.status(200).send(newUser);
    });
    
});

app.post('/user/login', (req, res) => {
        User.findOne({ username: req.body.username }, (err, user) => {
            if(err) throw err;
            if (!user){
                res.status(500).send({err: 'Invalid user', loggedIn: false});
                return res.end();
            }
            if(!user.password && req.body.password){
                user.password = req.body.password;
                user.save((err) => {
                    if (err) res.send(err);
                    res.status(200).send({
                        username: user.username,
                        name: user.name,
                        lastname: user.lastname,
                        bonus: user.bonus,
                        mail: user.mail,
                        travelStory : user.travelStory,
                        loggedIn: true
                    });
                });
            }
            else if(user.password && req.body.password){
                    user.comparePassword(req.body.password, (err, isMatch) => {
                    if(err) return res.status(500).send({err: err, loggedIn: false});
                    if(isMatch){
                        res.status(200).send({
                            username: user.username,
                            name: user.name,
                            lastname: user.lastname,
                            bonus: user.bonus,
                            mail: user.mail,
                            travelStory : user.travelStory,
                            loggedIn: true
                        });
                    }
                else res.status(500).send({err: 'Invalid password', loggedIn: false});
            });
        }
        else res.send({err: 'Invalid Password', loggedIn: false});
    });
});

app.post('/user/changePassword', (req, res) => {
    User.findOne({ username: req.body.username}, (err, user) => {
        if (err) return res.status(500).send({err: "Invalid user"});
        user.comparePassword( req.body.oldPassword, (err, isMatch) => {
            if (err) return res.status(500).send({ err: "Invalid old Password" });
            if (isMatch) {
                user.password = req.body.newPassword;
                user.save((err) => {
                    if (err) return res.status(500).send(err);
                    res.status(200).send({
                        status: 'Password changed',   
                    });
                });
            }
            else return res.status(500).send({err: "Invalid old Password"});
        });
    });
});

app.get('/user/:id', (req, res) => {
    User.findById(req.params.id ,(err, user) => {
        if (err) throw err;
        res.send(user);
    });
});

app.post('/users/edit', (req, res) => {
        User.findByIdAndUpdate(req.body._id, { 
            $set: req.body,
        }, { new: true }, (err, user) => {
            if (err) throw err;
            console.log(user.travelStory);
            res.send();
        });
});

app.post('/travels/edit', (req, res) => {
    User.findByIdAndUpdate(req.body._id, { 
        $set: req.body,
    }, { new: true }, (err, user) => {
        if (err) throw err;
        res.send(user);
    });
});

app.post('/travels/add', (req, res) => {
    User.findByIdAndUpdate(req.body._id, { 
        $set: req.body,
    }, { new: true }, (err, user) => {
        if (err) throw err;
        res.status(200).send(user.travelStory[user.travelStory.length-1]._id);
    });
});

app.get('/travels/:id', (req, res) => {
    User.findOne({_id: req.params.id}, (err, user) => {
        res.send({
            _id: user._id,
            username: user.username,
            travelStory: user.travelStory,
        });
    });
});

app.post('/users/add', (req, res) => {
    let user = new User({
        username: req.body.username,
        name: req.body.name,
        lastname: req.body.lastname,
        mail: req.body.mail,
        phone: req.body.phone,
        bonus: req.body.bonus
    });
    user.save((err) => {
        if (err) res.send(err);
        res.send('200');
    });
})

app.post('/users/remove', (req, res) => {
    User.findByIdAndRemove(req.body._id, (err) => {
        if (err) res.send('err');
        res.send('User removed');
    });
});

app.get('/logout', function(req, res, next) {
    adminIsAuthentificated = false;
    res.status(200).send({redirect: '/'});
  });

app.listen(PORT, () => console.log('http://localhost:' + PORT));
