import express from 'express';
import Class from '../models/Class.js';

const router = express.Router();

// ✅ Create class
router.post('/', async (req, res) => {
  try {
    const { class: className, section } = req.body;

    if (!className || !section) {
      return res.status(400).json({ message: 'Class and section are required' });
    }

    const exists = await Class.findOne({ name: className, section });
    if (exists) {
      return res.status(409).json({ message: 'Class already exists' });
    }

    const newClass = await Class.create({ name: className, section });
    res.status(201).json({ message: 'Class created', class: newClass });
  } catch (err) {
    console.error('Create class error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get all classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find().sort({ name: 1, section: 1 });
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get single class by ID
router.get('/:id', async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.status(200).json(cls);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update class
router.put('/:id', async (req, res) => {
  try {
    const { class: className, section } = req.body;
    if (!className || !section) {
      return res.status(400).json({ message: 'Class and section are required' });
    }

    const updated = await Class.findByIdAndUpdate(
      req.params.id,
      { name: className, section },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Class not found' });
    res.status(200).json({ message: 'Class updated', class: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Delete class
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Class.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Class not found' });
    res.status(200).json({ message: 'Class deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
