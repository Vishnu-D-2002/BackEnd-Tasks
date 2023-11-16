const express = require('express');
const fs = require('fs').promises;

const app = express();
const PORT = 3001;

app.use(express.json());

// Handle GET requests to the root endpoint ('/')
app.get('/', async (req, res) => {
  try {
    // Read the list of files in the current directory
    const files = await fs.readdir('./', { withFileTypes: true });

    // Read the contents of each file (not directories) and filter out non-text files
    const fileContents = [];
    for (const file of files) {
      // Check if it's a text file and not the 'doc.txt' file
      if (file.isFile() && file.name.endsWith('.txt') && file.name !== 'doc.txt') {
        // Read the content of the file
        const data = await fs.readFile(`./${file.name}`, 'utf-8');
        // Push the filename and content to the array
        fileContents.push({ filename: file.name, content: data });
      }
    }

    console.log('All text files are read successfully');
    // Send the array of file contents as the response
    res.json(fileContents);
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Handle POST requests to the root endpoint ('/')
app.post('/', async (req, res) => {
  try {
    // Create a timestamp for the filename
    const currentTime = new Date().toISOString().replace(/:/g, '_');
    // Create the filename with the timestamp
    const filename = `./${currentTime}.txt`;

    // Write the current timestamp into a new file
    await fs.writeFile(filename, currentTime, { flag: 'w+' });
    console.log('File added successfully');

    // Send the filename and content in the response
    res.status(201).json({ filename, content: currentTime });
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the Express server, listening on the specified port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
