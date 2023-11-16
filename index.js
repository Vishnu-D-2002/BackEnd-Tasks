const express = require('express');
const fs = require('fs');
const {MongoDB_URI,PORT} = require('./utils/config');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');

mongoose.connect(MongoDB_URI)
  .then(() => {
    console.log('connected to MongoDB...');
  })
  .catch((err) => {
    console.error(err);
  });

const noteSchema = new mongoose.Schema({
  id: Number,
  content: String,
  important: Boolean
});

const Note = mongoose.model("Note", noteSchema, "notes");

app.get('/', (req, res) => {
  Note.find({}, {})
    .then(notes => {
      res.status(200).json(notes);
    })
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});