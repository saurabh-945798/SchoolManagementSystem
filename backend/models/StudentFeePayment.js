import mongoose from "mongoose";

const studentFeePaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "offline"],
      default: "razorpay",
    },
    razorpayPaymentId: {
      type: String,
      required: function () {
        return this.paymentMethod === "razorpay";
      },
    },
    paymentType: {
      type: String,
      enum: ["full", "half", "custom"], // ✅ allow custom bhi
      required: true,
      default: "full",
    },
    monthsPaid: {
      type: [String], // e.g., ["Jan", "Feb"]
      default: [],
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("StudentFeePayment", studentFeePaymentSchema);
