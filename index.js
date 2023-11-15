// Import required modules
const express = require('express');
const fs = require('fs');

// Create an Express application
const app = express();

// Generate a timestamp to be used in the filename
const currentTime = new Date().toISOString().replace(/:/g, '_');

// Specify the port on which the server will listen
const PORT = 3001;

// Configure Express to parse incoming JSON data
app.use(express.json());

// Define a route to handle GET requests to the root endpoint ('/')
app.get('/', (req, res) => {
  // Read the content of a file with the generated filename
  fs.readFile(`./${currentTime}.txt`, 'utf-8', (err, data) => {
    if (err) {
      throw err;
    } else {
      console.log('All files are read successfully');
      res.send(data);
    }
  });
});

// Write the current timestamp into a new file
fs.writeFile(`./${currentTime}.txt`, currentTime, { flag: 'w+' }, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('File added successfully');
  }
});

// Start the Express server, listening on the specified port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});