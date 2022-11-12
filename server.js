if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const mongoose = require('mongoose')
const express = require('express');
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bcrypt = require('bcrypt')
const initializePassport = require('./passport-config');
const passport = require('passport');
const flash = require('express-flash')
const session = require('express-session')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')

app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(express.urlencoded({ extended: false }))
app.use(expressLayouts)
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))


mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error',error => console.error(error))
db.once('open',() => console.log('seccses conecting'))


app.get('/', checkAuthenticated ,(req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

app.get('/login', checkNotAuthenticated ,(req, res) => {
    res.render('login.ejs')
})

app.get('/register', checkNotAuthenticated ,(req, res) => {
    res.render('register.ejs')
})

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')   
    }
    console.log(users)
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true 
}))

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3000)