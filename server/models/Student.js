import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    course: { type: String, required: true, trim: true },
    year: { type: Number, min: 1, max: 6, default: 1 },
    gender: { type: String, enum: ['Female', 'Male', 'Other'], default: 'Other' },
    dateOfBirth: { type: Date },
    address: { type: String, trim: true, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
