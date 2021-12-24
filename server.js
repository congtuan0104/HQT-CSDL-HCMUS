const express = require('express');
const app = express();
const path = require('path');
const route = require('./routes/index');
const port = 3000;
const handlebars = require('express-handlebars');
const sql = require('mssql/msnodesqlv8');
const session = require('express-session');


const hbs = handlebars.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: {
        ifStr(s1, s2, option) {
            if (s1 === s2) {
                return options.fn(this)
            }
            return options.inverse(this)
        },

        eq(s1,s2,option){
            if(s1==s2){
                return option.fn(this)
            }
            return option.inverse(this)
        },

        sum(s1,s2){
            return s1+s2;
        }
    }
})


//app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: true }
}))

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({
    extended: true,
}));
app.use(express.json());



//Init routes
route(app);
const server = app.listen();
server.setTimeout(30000);
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})

