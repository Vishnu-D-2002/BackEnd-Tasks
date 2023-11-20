const express = require('express');
const {MONGODB_URI,PORT} = require('./utils/config');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB...');
    app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
  })
  .catch((err) => {
    console.error(err);
  });

const noteSchema = new mongoose.Schema({
  id: Number,
  content: String,
  important: Boolean
},{versionKey:false});

const Note = mongoose.model("Note", noteSchema, "notes");

app.get('/', (req, res) => {
  Note.find({}, {}).sort({id:1})
    .then(notes => {
      res.status(200).json(notes);
    })
});

app.get('/:id', (req, res) => {
  const ID = req.params.id;
  Note.findOne({ id: ID })
    .then((note) => {
      res.status(200).json(note);
    })
    .catch(err => {
      res.status(404).json({ message: "Note not found" });
  })
});

app.post('/', (req, res) => {
  const note = new Note(req.body);
  note.save()
    .then(note => {
      res.status(201).json({message:"Note created successfully",note});
    })
    .catch(err => {
      res.status(404).json({ message: "Error in finding id" })
    })
});

app.put('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if(!note)
      return  res.status(404).json({ message: "ID not found" });
    res.status(200).json({message:"Note changed successfully", note});
  } catch (err) {
    res.status(500).json({ message: "server error"});
  }
});

app.patch('/:id', async (req, res) => {
  try {
    // Exclude the _id field from the update
    const { _id, ...updateData } = req.body;
    const note = await Note.findOneAndUpdate({ id: req.params.id },updateData,{ new: true });
    if (!note) {
      return res.status(404).json({ message: "Id not found" });
    } else {
      return res.status(200).json({ message: "Note patched successfully", note });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal error" });
  }
});

app.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ id: req.params.id });
    if (!note) {
      return res.status(404).json({ message: "Id not found" });
    }
    else {
      return res.status(200).json({ message: "Note deleted successfully" });
    }
  } catch (error) {
    console.error('error', error);
    res.status(500).json({ message: "Internal error" });
  }
});