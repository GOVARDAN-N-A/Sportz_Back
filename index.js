// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const cors = require('cors');
// const path = require('path');
// const User = require('./models/user');

// const app = express();
// const upload = multer();

// app.use(express.json());
// app.use(cors({ origin: 'http://localhost:5173' }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// mongoose.connect('mongodb+srv://govardan:dWAviAc4dvF6D9lH@mafia.he8xjst.mongodb.net/Mafia', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('Connected to MongoDB Atlas'))
// .catch(error => console.error('Error connecting to MongoDB Atlas:', error));



// app.post('/signup', upload.single('profilePicture'), async (req, res) => {
//   try {
//     const { fullName, email, password, dateOfBirth, gender, city, state, country, sportsInterests, skillLevel, preferredPlayingTimes, contactNumber, socialMediaProfiles, bio } = req.body;

//     let profilePicture;
//     if (req.file) {
//       profilePicture = {
//         data: req.file.buffer,
//         contentType: req.file.mimetype
//       };
//     }

//     const newUser = new User({
//       fullName,
//       email,
//       password,
//       profilePicture,
//       dateOfBirth,
//       gender,
//       city,
//       state,
//       country,
//       sportsInterests,
//       skillLevel,
//       preferredPlayingTimes,
//       contactNumber,
//       socialMediaProfiles,
//       bio
//     });

//     const savedUser = await newUser.save();
//     res.status(201).json(savedUser);
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({ message: 'Error occurred while signing up user' });
//   }
// });

// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (user && user.password === password) {
//       res.status(200).json({ message: 'Login successful', userFullName: user.fullName, userEmail: user.email });
//     } else {
//       res.status(401).json({ message: 'Invalid email or password' });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.get('/profile', async (req, res) => {
//   try {
//     const userEmail = req.query.userEmail;
//     const user = await User.findOne({ email: userEmail });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.status(200).json(user);
//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.get('/profile-picture/:userId', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.userId);
//     if (!user || !user.profilePicture) {
//       return res.status(404).json({ message: 'Profile picture not found' });
//     }
//     res.set('Content-Type', user.profilePicture.contentType);
//     res.send(user.profilePicture.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.get('/user/:fullName', async (req, res) => {
//   try {
//     const userFullName = req.params.fullName;
//     const user = await User.findOne({ fullName: userFullName });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.status(200).json(user);
//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.get('/search', async (req, res) => {
//   try {
//     const city = req.query.city;
//     const users = await User.find({ city: city }).select('fullName city'); // Adjust the fields you want to retrieve
//     res.status(200).json({ users });
//   } catch (error) {
//     console.error('Error fetching users by city:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const User = require('./models/user');
require('dotenv').config();
const app = express();
const upload = multer();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(error => console.error('Error connecting to MongoDB Atlas:', error));


// Follow a user
app.post('/follow/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUser = req.user; // Assuming user is authenticated
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUser._id);
    await Promise.all([currentUser.save(), userToFollow.save()]);
    res.status(200).json({ message: 'You are now following this user' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unfollow a user
app.post('/unfollow/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUser = req.user; // Assuming user is authenticated
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }
    currentUser.following = currentUser.following.filter(id => id !== userId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id !== currentUser._id);
    await Promise.all([currentUser.save(), userToUnfollow.save()]);
    res.status(200).json({ message: 'You have unfollowed this user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Signup route
app.post('/signup', upload.single('profilePicture'), async (req, res) => {
  try {
    const { fullName, email, password, dateOfBirth, gender, city, state, country, sportsInterests, skillLevel, preferredPlayingTimes, contactNumber, socialMediaProfiles, bio } = req.body;

    let profilePicture;
    if (req.file) {
      profilePicture = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const newUser = new User({
      fullName,
      email,
      password,
      profilePicture,
      dateOfBirth,
      gender,
      city,
      state,
      country,
      sportsInterests,
      skillLevel,
      preferredPlayingTimes,
      contactNumber,
      socialMediaProfiles,
      bio
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error occurred while signing up user' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && user.password === password) {
      res.status(200).json({ message: 'Login successful', userFullName: user.fullName, userEmail: user.email });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch user profile
app.get('/profile', async (req, res) => {
  try {
    const userEmail = req.query.userEmail;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch profile picture
app.get('/profile-picture/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.profilePicture) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }
    res.set('Content-Type', user.profilePicture.contentType);
    res.send(user.profilePicture.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by fullName
app.get('/user/:fullName', async (req, res) => {
  try {
    const userFullName = req.params.fullName;
    const user = await User.findOne({ fullName: userFullName });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search users by city
app.get('/search', async (req, res) => {
  try {
    const city = req.query.city;
    const users = await User.find({ city: city }).select('fullName city'); // Adjust the fields you want to retrieve
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users by city:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
