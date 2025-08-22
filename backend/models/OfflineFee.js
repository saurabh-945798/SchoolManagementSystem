import mongoose from "mongoose";

const offlineFeeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    months: [
      {
        type: String, // e.g., "March", "April"
        required: true,
      },
    ],
    paymentMode: {
      type: String,
      enum: ["Cash", "Cheque", "Bank Transfer", "Other"],
      default: "Cash",
    },
    remark: {
      type: String,
      default: "",
    },
    receivedBy: {
      type: String, // admin/staff name (who is managing entry)
      required: true,
    },
    cashier: {
      type: String, // who actually collected cash
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("OfflineFee", offlineFeeSchema);
