const dotenv = require('dotenv');
dotenv.config();

console.log('JWT_SECRET:', process.env.JWT_SECRET);

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
} else {
    console.log('JWT_SECRET is defined');
}
