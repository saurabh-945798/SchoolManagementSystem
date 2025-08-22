import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Teacher from '../models/Teacher.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// ✅ Admin creates/registers a new teacher
export const adminCreateTeacher = async (req, res) => {
  try {
    const {
      name,
      gender,
      dob,
      email,
      phone = '',
      address = '',
      password,
      photoUrl = '',
      teacherID,
      qualification = '',
      experience = 0,
      subjects = [],
      classesAssigned = [], // now string array like ["7A", "12B"]
      department = '',
      joiningDate,
      teacherType = '',
    } = req.body;

    // ✅ Required Fields
    if (!name || !email || !password || !gender) {
      return res.status(400).json({
        message: 'Name, Email, Password, and Gender are required',
      });
    }

    // ✅ Gender check
    const allowedGenders = ['Male', 'Female', 'Other'];
    if (!allowedGenders.includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender value' });
    }

    // ✅ Check existing email
    const existingEmail = await Teacher.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists. Try another.' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Format subjects and classes
    const formattedSubjects = Array.isArray(subjects)
      ? subjects.map((s) => s.trim())
      : [];
    const formattedClasses = Array.isArray(classesAssigned)
      ? classesAssigned.map((c) => c.trim().toUpperCase())
      : [];

    // ✅ Create teacher document
    const newTeacher = new Teacher({
      name,
      gender,
      dob: dob ? new Date(dob) : null,
      email,
      phone,
      address,
      password: hashedPassword,
      photoUrl,
      teacherID: teacherID || `TID-${Date.now()}`,
      qualification,
      experience: Number(experience) || 0,
      subjects: formattedSubjects,
      classesAssigned: formattedClasses,
      department,
      joiningDate: joiningDate ? new Date(joiningDate) : null,
      teacherType,
      role: 'teacher',
    });

    await newTeacher.save();

    res.status(201).json({
      message: '✅ Teacher created successfully',
      teacher: {
        _id: newTeacher._id,
        name: newTeacher.name,
        email: newTeacher.email,
        teacherID: newTeacher.teacherID,
        role: newTeacher.role,
      },
    });
  } catch (err) {
    console.error('❌ adminCreateTeacher:', err);

    if (err.code === 11000) {
      const dupField = Object.keys(err.keyPattern)[0];
      const friendlyField =
        dupField === 'email'
          ? 'Email'
          : dupField === 'teacherID'
          ? 'Teacher ID'
          : dupField;

      return res.status(400).json({
        message: `❌ ${friendlyField} already exists. Try something different.`,
      });
    }

    res.status(500).json({
      message: 'Failed to create teacher',
      error: err.message,
    });
  }
};


// ✅ Teacher login
export const handleTeacherLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({ message: '❌ Teacher not found' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: '❌ Invalid credentials' });
    }

    const token = jwt.sign({ id: teacher._id, role: 'teacher' }, JWT_SECRET, {
      expiresIn: '2d',
    });

    res.status(200).json({
      message: '✅ Login successful',
      token,
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        photoUrl: teacher.photoUrl || '',
        assignedClasses: teacher.classesAssigned || [],
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: '❌ Login failed', error: err.message });
  }
};

// ✅ Get logged-in teacher's profile
export const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).lean();

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.status(200).json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || 'N/A',
      subjects: teacher.subjects || [],
      assignedClasses: teacher.classesAssigned || [],
      joiningDate: teacher.joiningDate || null,
    });
  } catch (err) {
    console.error('❌ Error fetching teacher profile:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};