require('dotenv').config();

const MongoDB_URI = process.env.MongoDB_URI;
const PORT = process.env.PORT;

module.exports = {
    MongoDB_URI,
    PORT
}