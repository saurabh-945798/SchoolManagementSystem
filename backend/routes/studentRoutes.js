import express from 'express';
import {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentsByClassSection,
} from '../controllers/studentController.js';
import Student from '../models/Student.js';

const router = express.Router();

/**
 * @route   POST /api/students
 * @desc    Add a new student
 */
router.post('/', addStudent);

/**
 * @route   GET /api/students
 * @desc    Get all students (filter by class/section optional)
 */
router.get('/', getAllStudents);

/**
 * @route   GET /api/students/:id
 * @desc    Get a student by MongoDB ID
 */
router.get('/:id', getStudentById);

/**
 * @route   PUT /api/students/:id
 * @desc    Update student by ID
 */
router.put('/:id', updateStudent);

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student by ID
 */
router.delete('/:id', deleteStudent);

/**
 * @route   GET /api/students/by-class/:classSection
 * @desc    Get students by class+section (e.g., 9A)
 */
router.get('/by-class/:classSection', getStudentsByClassSection);

/**
 * @route   GET /api/students/roll/:rollNo
 * @desc    Get student by Roll Number
 */
router.get('/roll/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const student = await Student.findOne({ rollNumber: rollNo });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error('❌ Error fetching student by roll number:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
