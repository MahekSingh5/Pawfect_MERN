// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (simple: 10-15 digits, can include +, -, spaces)
const phoneRegex = /^[\d\s+\-()]{10,15}$/;

// Sanitize input: remove leading/trailing spaces, prevent XSS
const sanitizeInput = (str) => {
  if (typeof str !== "string") return str;
  return str.trim().replace(/[<>]/g, "");
};

// Email validation middleware
exports.validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  next();
};

// Phone validation middleware
exports.validatePhone = (req, res, next) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone format (10-15 characters)" });
  }
  next();
};

// Password validation middleware (min 6 chars, at least one number and one letter)
exports.validatePassword = (req, res, next) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({ message: "Password must contain letters and numbers" });
  }
  next();
};

// Required fields validation
exports.validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`
      });
    }
    next();
  };
};

// Sanitize all string fields in request body
exports.sanitizeBody = (req, res, next) => {
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === "string") {
      req.body[key] = sanitizeInput(req.body[key]);
    }
  });
  next();
};

// Combined validation for registration
exports.validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({ message: "Name must be at least 2 characters" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({ message: "Password must contain letters and numbers" });
  }

  next();
};

// Combined validation for volunteer application
exports.validateVolunteerApplication = (req, res, next) => {
  const { phone, city, availability, preferredAnimals } = req.body;

  if (!phone || !city || !availability) {
    return res.status(400).json({ message: "Phone, city, and availability are required" });
  }

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone format" });
  }

  if (city.trim().length < 2) {
    return res.status(400).json({ message: "City must be at least 2 characters" });
  }

  const validAvailability = ["full-time", "part-time", "weekends", "on-call"];
  if (!validAvailability.includes(availability)) {
    return res.status(400).json({
      message: "Invalid availability. Must be: full-time, part-time, weekends, or on-call"
    });
  }

  next();
};
