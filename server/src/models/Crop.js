import mongoose from 'mongoose';
const cropSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', default: null },
  name: { type: String, required: true, trim: true },
  season: { type: String, default: 'Current season' },
  plantedOn: { type: Date, default: null },
  status: { type: String, enum: ['Planned', 'Growing', 'Harvested'], default: 'Growing' },
  notes: { type: String, default: '' }
}, { timestamps: true });
export default mongoose.model('Crop', cropSchema);
