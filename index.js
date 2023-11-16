const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { MongoDB_URI, PORT } = require('./utils/config');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());

// Connect to MongoDB (make sure MongoDB is running)
mongoose.connect(MongoDB_URI)
    .then(() => {
        console.log('Connected to MongoDB...');
    })
    .catch((err) => {
        console.log('Error connecting to MongoDB:', err);
    });

app.use(cors());

// Define Mentor and Student models
const mentorSchema = new mongoose.Schema({
    mentor_id: Number,
    name: String,
    course: String,
    mentor_name :String,
    mentees: [{ student_id: Number, student_name: String }],
}, { versionKey: false });

const studentSchema = new mongoose.Schema({
    student_id: Number,
    student_name: String,
    mentor_id: Number,
    course: String,
}, { versionKey: false });

const Mentor = mongoose.model('Mentor', mentorSchema);
const Student = mongoose.model('Student', studentSchema);

app.get('/', (req, res) => {
  res.send(`<h1 style="color: #333; text-align: center;">API END POINTS FOR Assign-Mentor</h1>

<div style="margin: 20px;">
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Endpoint</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Request</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">/students</td>
            <td style="border: 1px solid #ddd; padding: 8px;">GET</td>
            <td style="border: 1px solid #ddd; padding: 8px;">API to get all students</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">/mentors</td>
            <td style="border: 1px solid #ddd; padding: 8px;">GET</td>
            <td style="border: 1px solid #ddd; padding: 8px;">API to get all mentors</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">/createMentor</td>
            <td style="border: 1px solid #ddd; padding: 8px;">POST</td>
            <td style="border: 1px solid #ddd; padding: 8px;">API to create a Mentor</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">/createStudent</td>
            <td style="border: 1px solid #ddd; padding: 8px;">POST</td>
            <td style="border: 1px solid #ddd; padding: 8px;">API to create a Student</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">/assignStudentToMentor/:mentorName</td>
            <td style="border: 1px solid #ddd; padding: 8px;">POST</td>
            <td style="border: 1px solid #ddd; padding: 8px;">API to assign a Student to a Mentor</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">/assignMentor/:studentName</td>
            <td style="border: 1px solid #ddd; padding: 8px;">PUT</td>
            <td style="border: 1px solid #ddd; padding: 8px;">API to assign or change Mentor for a particular Student</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">/studentsForMentor/:mentorId</td>
            <td style="border: 1px solid #ddd; padding: 8px;">GET</td>
            <td style="border: 1px solid #ddd; padding: 8px;">API to get all students for mentor</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">/previousMentor/:studentId</td>
            <td style="border: 1px solid #ddd; padding: 8px;">GET</td>
            <td style="border: 1px solid #ddd; padding: 8px;">API to show the previously assigned mentor for a particular student</td>
        </tr>
    </table>
</div>
`)
});

// API to get all students
app.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching students');
    }
});

// API to get all mentors
app.get('/mentors', async (req, res) => {
    try {
        const mentors = await Mentor.find();
        res.json(mentors);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching mentors');
    }
});

// API to create a Mentor
app.post('/createMentor', async (req, res) => {
    try {
        const mentor = new Mentor(req.body);
        await mentor.save();
        res.json({ message: 'Mentor created successfully', mentor });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error creating Mentor' });
    }
});

// API to create a Student
app.post('/createStudent', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.json({ message: 'Student created successfully', student });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating Student' });
    }
});

// API to assign a Student to a Mentor
app.post('/assignStudentToMentor/:mentorName', async (req, res) => {
  const mentorName = req.params.mentorName;
  const studentName = req.body.studentName;

  try {
    // Check if the student already has a mentor
    const existingStudent = await Student.findOne({ student_name: studentName });
    if (existingStudent && existingStudent.mentor_name !== undefined && existingStudent.mentor_name !== null) {
      return res.status(400).send('Student already has a mentor');
    }

    // Assign the student to the mentor
    await Student.updateOne({ student_name: studentName }, { mentor_name: mentorName });

    // Update the mentor's mentees array
    const mentor = await Mentor.findOne({ mentor_name: mentorName });
    mentor.mentees.push({ student_id: existingStudent.student_id, student_name: studentName });
    await mentor.save();

    // Update the student's mentor_id in the /students field
    await Student.updateOne({ student_name: studentName }, { mentor_id: mentor.mentor_id });

    res.send(`Student ${studentName} assigned to Mentor ${mentorName}`);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error assigning Student to Mentor');
  }
});

// API to assign or change Mentor for a particular Student
app.put('/assignMentor/:studentName', async (req, res) => {
  const studentName = req.params.studentName;
  const newMentorName = req.body.newMentorName;

  try {
    // Find the current mentor of the student
    const student = await Student.findOne({ student_name: studentName });
    const currentMentorName = student.mentor_name;

    // Update the mentor's mentees array to remove the student
    if (currentMentorName) {
      const currentMentor = await Mentor.findOne({ mentor_name: currentMentorName });

      // Check if the mentor exists before attempting to access its properties
      if (currentMentor && currentMentor.mentees) {
        currentMentor.mentees = currentMentor.mentees.filter((mentee) => mentee.student_name !== studentName);
        await currentMentor.save();
      }
    }

    // Assign or change the mentor for the student
    await Student.updateOne({ student_name: studentName }, { mentor_name: newMentorName });

    // Update the new mentor's mentees array
    const newMentor = await Mentor.findOne({ mentor_name: newMentorName });
    if (newMentor) {
      newMentor.mentees.push({ student_id: student.student_id, student_name: studentName });
      await newMentor.save();
    }

    // Update the student's mentor_id in the /students field
    await Student.updateOne({ student_name: studentName }, { mentor_id: newMentor ? newMentor.mentor_id : null });

    res.send(`Mentor assigned to Student ${studentName}`);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error assigning Mentor to Student: ${error.message}`);
  }
});

app.get('/studentsForMentor/:mentorId', async (req, res) => {
  const mentorId = req.params.mentorId;

  try {
    console.log(`Fetching students for Mentor ID: ${mentorId}`);
    const students = await Student.find({ mentor_id: mentorId }).lean();
    console.log('Students:', students);
    res.json(students);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching students for Mentor');
  }
});

// API to show the previously assigned mentor for a particular student
app.get('/previousMentor/:studentId', async (req, res) => {
  const studentId = req.params.studentId;

  try {
    const student = await Student.findOne({ student_id: studentId });
    const previousMentor = student.mentor_id || 'No previous mentor assigned';
    res.send(`Previous Mentor for Student ID ${studentId}: ${previousMentor}`);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching previous Mentor for Student');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});