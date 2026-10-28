import mongoose from 'mongoose';
const farmSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  location: { type: String, default: '' },
  area: { type: Number, min: 0, default: 0 },
  soilType: { type: String, default: 'Unknown' }
}, { timestamps: true });
export default mongoose.model('Farm', farmSchema);
