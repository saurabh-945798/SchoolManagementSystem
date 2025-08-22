import mongoose from "mongoose";

const transportRouteSchema = new mongoose.Schema({
  routeName: { type: String, required: true, unique: true },
  fee: { type: Number, required: true }, // yearly fee
});

export default mongoose.model("TransportRoute", transportRouteSchema);
