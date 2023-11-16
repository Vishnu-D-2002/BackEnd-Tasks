const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Local variables to store data
const rooms = [
  { id: 1, seats: 10, amenities: ['Projector', 'Whiteboard'], pricePerHour: 50 },
  { id: 2, seats: 8, amenities: ['TV', 'Coffee Machine'], pricePerHour: 40 },
  { id: 3, seats: 12, amenities: ['Projector', 'Conference Phone'], pricePerHour: 60 },
  { id: 4, seats: 6, amenities: ['Whiteboard'], pricePerHour: 30 },
  { id: 5, seats: 15, amenities: ['Projector', 'Coffee Machine'], pricePerHour: 70 },
  { id: 6, seats: 20, amenities: ['TV', 'Whiteboard'], pricePerHour: 80 },
  { id: 7, seats: 8, amenities: ['Coffee Machine'], pricePerHour: 35 },
  { id: 8, seats: 10, amenities: ['TV', 'Whiteboard', 'Conference Phone'], pricePerHour: 65 },
  { id: 9, seats: 12, amenities: ['Projector'], pricePerHour: 55 },
  { id: 10, seats: 6, amenities: ['Coffee Machine', 'Whiteboard'], pricePerHour: 40 },
  { id: 11, seats: 15, amenities: ['TV', 'Conference Phone'], pricePerHour: 75 },
  { id: 12, seats: 8, amenities: ['Projector'], pricePerHour: 45 },
  { id: 13, seats: 10, amenities: ['Coffee Machine', 'Whiteboard'], pricePerHour: 55 },
  { id: 14, seats: 12, amenities: ['TV', 'Conference Phone'], pricePerHour: 70 },
];

const bookings = [
  { id: 1, customerName: 'John Doe', date: '2023-11-15', startTime: '10:00 AM', endTime: '12:00 PM', roomId: 1 },
  { id: 2, customerName: 'Jane Smith', date: '2023-11-16', startTime: '02:00 PM', endTime: '04:00 PM', roomId: 2 },
  { id: 3, customerName: 'Bob Johnson', date: '2023-11-17', startTime: '01:00 PM', endTime: '03:00 PM', roomId: 3 },
  { id: 4, customerName: 'Alice Brown', date: '2023-11-18', startTime: '03:00 PM', endTime: '05:00 PM', roomId: 4 },
  { id: 5, customerName: 'Charlie Davis', date: '2023-11-19', startTime: '11:00 AM', endTime: '01:00 PM', roomId: 5 },
  { id: 6, customerName: 'Eva White', date: '2023-11-20', startTime: '09:00 AM', endTime: '11:00 AM', roomId: 6 },
  { id: 7, customerName: 'David Lee', date: '2023-11-21', startTime: '12:00 PM', endTime: '02:00 PM', roomId: 7 },
  { id: 8, customerName: 'Grace Miller', date: '2023-11-22', startTime: '10:00 AM', endTime: '12:00 PM', roomId: 8 },
  { id: 9, customerName: 'Samuel Turner', date: '2023-11-23', startTime: '02:00 PM', endTime: '04:00 PM', roomId: 9 },
  { id: 10, customerName: 'Sophia Moore', date: '2023-11-24', startTime: '11:00 AM', endTime: '01:00 PM', roomId: 10 },
  { id: 11, customerName: 'Liam Harris', date: '2023-11-25', startTime: '03:00 PM', endTime: '05:00 PM', roomId: 11 },
  { id: 12, customerName: 'Olivia Clark', date: '2023-11-26', startTime: '09:00 AM', endTime: '11:00 AM', roomId: 12 },
  { id: 13, customerName: 'Noah Allen', date: '2023-11-27', startTime: '01:00 PM', endTime: '03:00 PM', roomId: 13 },
  { id: 14, customerName: 'Ava Hall', date: '2023-11-28', startTime: '12:00 PM', endTime: '02:00 PM', roomId: 14 },
];

// Welcome message for the root path
app.get('/', (req, res) => {
  res.send(`<h2><strong>Welcome to the room booking system!</strong></br><br>
    "/"  -<strong> Welcome message for the root path</strong><br>
    "/createRoom"  -<strong>To Create a Room</strong><br>
    "/bookRoom " -<strong> for booking a bookRoom</strong><br>
    "/listRooms " -<strong> List all Rooms with Booked Data</strong><br>
    "/listCustomers " - <strong> List all customers with booked Data</strong><br>
    "/customerBookingHistory/:customerName"  - <strong>List how many times a customer has booked the room</strong>
  </h2>`);
});

// Create a Room
app.post('/createRoom', (req, res) => {
  const { seats, amenities, pricePerHour } = req.body;
  const room = {
    id: rooms.length + 1,
    seats,
    amenities,
    pricePerHour,
  };
  rooms.push(room);
  res.json(room);
});

// Book a Room
app.post('/bookRoom', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;
  const room = rooms.find((r) => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  const booking = {
    id: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
  };
  bookings.push(booking);
  res.json(booking);
});

// List all Rooms with Booked Data
app.get('/listRooms', (req, res) => {
  const roomList = rooms.map((room) => {
    const bookedData = bookings.filter((booking) => booking.roomId === room.id);
    return {
      roomName: `Room ${room.id}`,
      bookedData,
    };
  });
  res.json(roomList);
});

// List all customers with booked Data
app.get('/listCustomers', (req, res) => {
  const customerList = bookings.map((booking) => {
    const room = rooms.find((r) => r.id === booking.roomId);
    return {
      customerName: booking.customerName,
      roomName:` Room ${room.id}`,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    };
  });
  res.json(customerList);
});

// List how many times a customer has booked the room
app.get('/customerBookingHistory/:customerName', (req, res) => {
  const { customerName } = req.params;
  const customerHistory = bookings.filter((booking) => booking.customerName === customerName);
  res.json(customerHistory);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
