const dotenv = require('dotenv');
dotenv.config();

const express = require("express");
const colors = require('colors');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require("./config/db");
const path = require("path")

//dot config
//dotenv.config();


//mongodb connection
connectDB();

//rest object
const app = express();

// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON');
        return res.status(400).send({ status: 400, message: 'Bad JSON' });
    }
    next();
});


//routes
// 1 test route
app.use('/api/v1/test', require('./routes/testRoutes'));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/inventory', require('./routes/inventoryRoutes.js'));
app.use('/api/v1/analytics', require('./routes/analyticsRoutes.js'));
app.use('/api/v1/admin', require('./routes/AdminRoutes.js'));

// STATIC FOLDER
app.use(express.static(path.join(__dirname,'./client/build')));

// STATIC ROUTES
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname,"./client/build/index.html"));
});



// http://localhost:3000

//port
const PORT = process.env.PORT || 3000;

//listen
app.listen(PORT, () => {
    console.log(`Node Server Running In ${process.env.DEV_MODE} ModeOn Port ${process.env.PORT}`. bgBlue.white);
});