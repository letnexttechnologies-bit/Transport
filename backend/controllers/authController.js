const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* REGISTER */
exports.register = async (req, res) => {
  try {
    await User.create(req.body);
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(400).json({ message: "User already exists" });
  }
};

/* LOGIN */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      vehicleNumber: user.vehicleNumber,
      role: user.role
    }
  });
};
