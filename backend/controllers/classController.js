import ClassModel from '../models/ClassModel.js';

export const createClass = async (req, res) => {
  try {
    const { className, section } = req.body;
    if (!className || !section) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exists = await ClassModel.findOne({ className, section });
    if (exists) {
      return res.status(409).json({ message: 'Class already exists' });
    }

    const newClass = await ClassModel.create({ className, section });
    res.status(201).json({ message: 'Class created successfully', newClass });
  } catch (error) {
    res.status(500).json({ message: 'Error creating class', error });
  }
};
