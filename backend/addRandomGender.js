// // // checkPassword.js
// // import bcrypt from 'bcrypt';

// // const hash = "$2a$10$H4/ayk6GnYlNCDd42c0p5eVrC03vHwFzhpp9ys39Ean3Lg7lKBoee";

// // // Try a list of common or expected passwords
// // const possiblePasswords = [
// //   '123456',
// //   'password',
// //   'admin123',
// //   'student123',
// //   'secret',
// //   'school2025',
// //   'test@123',
// //   'sex',   // <-- Add your guesses here
// // ];

// // (async () => {
// //   for (const password of possiblePasswords) {
// //     const match = await bcrypt.compare(password, hash);
// //     if (match) {
// //       console.log(`✅ Password matched: "${password}"`);
// //       return;
// //     }
// //   }
// //   console.log("❌ No password matched the hash.");
// // })();





// // pass.js
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import Teacher from "./models/Teacher.js";
// import Class from "./models/Class.js";

// dotenv.config(); // ✅ Load variables from .env

// const runFix = async () => {
//   try {
//     // ✅ Connect to MongoDB Atlas using your MONGO_URI key from .env
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ Connected to MongoDB Atlas");

//     // 🔍 Get all teachers
//     const teachers = await Teacher.find();

//     for (const teacher of teachers) {
//       // Check if classesAssigned has string class names instead of ObjectIds
//       if (
//         teacher.classesAssigned &&
//         teacher.classesAssigned.length > 0 &&
//         typeof teacher.classesAssigned[0] === "string"
//       ) {
//         console.log(`🔁 Fixing: ${teacher.name} - ${teacher.classesAssigned.join(", ")}`);

//         // Find corresponding Class documents
//         const foundClasses = await Class.find({
//           name: { $in: teacher.classesAssigned },
//         });

//         if (foundClasses.length !== teacher.classesAssigned.length) {
//           console.warn(
//             `⚠️ Some classes not found for teacher ${teacher.name}:`,
//             teacher.classesAssigned
//           );
//           continue; // skip this teacher if any class is missing
//         }

//         // Convert to ObjectIds
//         teacher.classesAssigned = foundClasses.map((cls) => cls._id);
//         await teacher.save();

//         console.log(`✅ Updated: ${teacher.name}`);
//       }
//     }

//     console.log("🎉 All teachers cleaned up successfully!");
//     mongoose.disconnect();
//   } catch (err) {
//     console.error("❌ Fix failed:", err);
//   }
// };

// runFix();





// addRandomGender.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// ✅ Replace with your actual MongoDB URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_db';

// ✅ Define Student Schema (partial, just for update)
const studentSchema = new mongoose.Schema({
  gender: String,
}, { strict: false });

const Student = mongoose.model('Student', studentSchema, 'students'); // 'students' is collection name

const assignRandomGender = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 🔍 Find all students where gender is missing
    const students = await Student.find({ gender: { $exists: false } });

    console.log(`👦👧 Found ${students.length} students without gender.`);

    for (const student of students) {
      const randomGender = Math.random() < 0.5 ? 'Male' : 'Female';

      await Student.updateOne(
        { _id: student._id },
        { $set: { gender: randomGender } }
      );

      console.log(`✅ Updated ${student._id} → ${randomGender}`);
    }

    console.log("🎉 All missing genders updated successfully.");
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

assignRandomGender();
