import Student from '../models/Student.js';
import jwt from 'jsonwebtoken';

export const studentLogin = async (req, res) => {
  try {
    const { email, dob } = req.body;

    if (!email || !dob) {
      return res.status(400).json({ message: 'Email and DOB are required' });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'No student found with this email' });
    }

    const inputDOB = new Date(dob).toISOString().split('T')[0];
    const dbDOB = new Date(student.dob).toISOString().split('T')[0];

    if (inputDOB !== dbDOB) {
      return res.status(401).json({ message: 'Incorrect DOB' });
    }

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        class: student.class,
        section: student.section,
        rollNumber: student.rollNumber,
      },
    });
  } catch (err) {
    console.error('Student login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



// ✅ Get logged-in student info
export const getLoggedInStudent = async (req, res) => {
    try {
      const student = await Student.findById(req.user.id).select('-password');
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      res.status(200).json(student);
    } catch (err) {
      console.error('Error fetching student profile:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  