const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Session = require('../models/Session');

// Register User (Simple for demo purposes, you can use Google Login ID as username)
router.post('/auth/register', async (req, res) => {
  try {
    const { username, nama } = req.body;
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username, nama });
      await user.save();
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User
router.post('/auth/login', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save Quiz Session
router.post('/session', async (req, res) => {
  try {
    const { userId, quizType, totalScore, totalTime, questionsDetail } = req.body;
    const newSession = new Session({
      userId,
      quizType,
      totalScore,
      totalTime,
      questionsDetail
    });
    await newSession.save();
    res.status(201).json({ success: true, session: newSession });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Analytics for a User
router.get('/analytics/:userId', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Data for Admin Dashboard
router.get('/admin/all-data', async (req, res) => {
  const { pin } = req.query;
  if (pin !== 'guru123') {
    return res.status(401).json({ error: 'PIN Admin salah atau tidak valid.' });
  }
  try {
    const users = await User.find({});
    const sessions = await Session.find({});
    res.status(200).json({ success: true, users, sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public Leaderboard API
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({});
    const sessions = await Session.find({});
    
    const userMap = {};
    users.forEach(u => {
       userMap[u._id] = { nama: u.nama, totalScore: 0, totalExams: 0 };
    });

    sessions.forEach(s => {
       if (userMap[s.userId]) {
          userMap[s.userId].totalScore += s.totalScore;
          userMap[s.userId].totalExams += 1;
       }
    });

    // Compute average and sort
    const leaderboard = Object.values(userMap).map(u => ({
       nama: u.nama,
       totalExams: u.totalExams,
       averageScore: u.totalExams > 0 ? Math.round(u.totalScore / u.totalExams) : 0
    })).filter(u => u.totalExams > 0);

    // Sort by Average Score descending
    leaderboard.sort((a,b) => b.averageScore - a.averageScore);

    // Return Top 10
    res.status(200).json({ success: true, leaderboard: leaderboard.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset Database API (DANGEROUS)
router.delete('/admin/reset', async (req, res) => {
  const { pin } = req.query;
  if (pin !== 'guru123') {
    return res.status(401).json({ error: 'PIN Admin salah atau tidak valid.' });
  }
  try {
    await User.deleteMany({});
    await Session.deleteMany({});
    res.status(200).json({ success: true, message: 'Database reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
