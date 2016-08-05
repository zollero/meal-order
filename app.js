
let express = require('express');
let path = require('path');
let app = express();
let router = require('./routes/index');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

app.listen(3000, function () {
    console.log('Server started on port 3000');
});