import express from 'express';
import {
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  assignClassesToTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';

import Class from '../models/Class.js';

const router = express.Router();

/**
 * @route   GET /api/teachers/
 * @desc    Get all teachers (excluding passwords)
 * @access  Admin or authorized users
 */
router.get('/', getAllTeachers);

/**
 * @route   GET /api/teachers/:teacherId
 * @desc    Get teacher details by ID (excluding password)
 * @access  Admin or authorized users
 */
router.get('/:teacherId', getTeacherById);

/**
 * @route   PUT /api/teachers/update/:teacherId
 * @desc    Update full teacher details (expects classesAssigned as array of class IDs or names)
 * @access  Admin only
 */
router.put('/update/:teacherId', updateTeacher);

/**
 * @route   PUT /api/teachers/assign-classes/:teacherId
 * @desc    Assign or update teacher's classes using array of class names (e.g., ["8C", "7A"])
 * @access  Admin only
 */
router.put('/assign-classes/:teacherId', assignClassesToTeacher);

/**
 * @route   DELETE /api/teachers/:teacherId
 * @desc    Delete a teacher by ID
 * @access  Admin only
 */
router.delete('/:teacherId', deleteTeacher);

/**
 * @route   POST /api/teachers/get-class-ids
 * @desc    Helper route: convert array of class names (e.g. ["11A", "12B"]) into array of Class ObjectIds
 *          Returns { classIds: [...] }
 * @access  Admin or authorized users
 */
router.post('/get-class-ids', async (req, res) => {
  try {
    const { classNames } = req.body;

    if (!Array.isArray(classNames)) {
      return res.status(400).json({ message: "classNames must be an array" });
    }

    const missing = [];
    const classIds = [];

    // Loop through each className string, parse and lookup in DB
    for (const classStr of classNames) {
      // Expect format like "11A", "9B"
      const match = classStr.match(/^(\d+)([A-Za-z])$/);
      if (!match) {
        missing.push(classStr);
        continue;
      }

      const [, name, section] = match;
      const foundClass = await Class.findOne({ name, section });

      if (foundClass) {
        classIds.push(foundClass._id);
      } else {
        missing.push(classStr);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({ message: "Some classes not found", missing });
    }

    return res.status(200).json({ classIds });
  } catch (err) {
    console.error("❌ get-class-ids error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
