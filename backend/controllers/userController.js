import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, age, gender, phone, vehicleNumber, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ phone });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this phone number' });
    }

    // Create user
    const user = await User.create({
      name,
      age,
      gender,
      phone,
      vehicleNumber,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        vehicleNumber: user.vehicleNumber,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check for user phone
    const user = await User.findOne({ phone }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        vehicleNumber: user.vehicleNumber,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid phone or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        vehicleNumber: user.vehicleNumber,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.age = req.body.age || user.age;
      user.gender = req.body.gender || user.gender;
      user.phone = req.body.phone || user.phone;
      user.vehicleNumber = req.body.vehicleNumber || user.vehicleNumber;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        age: updatedUser.age,
        gender: updatedUser.gender,
        phone: updatedUser.phone,
        vehicleNumber: updatedUser.vehicleNumber,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin login (special endpoint for demo)
// @route   POST /api/users/admin-login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    // Demo credentials: both fields = "o"
    if (adminId?.trim() === 'o' && password === 'o') {
      // Find or create admin user
      let adminUser = await User.findOne({ phone: 'admin', role: 'admin' });

      if (!adminUser) {
        // Create admin user if doesn't exist
        adminUser = await User.create({
          name: 'Admin',
          age: 30,
          gender: 'Other',
          phone: 'admin',
          vehicleNumber: 'ADMIN-001',
          password: 'admin123',
          role: 'admin',
        });
      }

      res.json({
        _id: adminUser._id,
        name: adminUser.name,
        phone: adminUser.phone,
        role: adminUser.role,
        token: generateToken(adminUser._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

