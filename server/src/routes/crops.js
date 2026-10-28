import { Router } from 'express';
import Crop from '../models/Crop.js';
import auth from '../middleware/auth.js';
const router = Router();
router.use(auth);
router.get('/', async (req, res, next) => {
  try { res.json(await Crop.find({ owner: req.user.id }).populate('farm', 'name').sort({ createdAt: -1 })); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { name, season, plantedOn, status, notes, farm } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Crop name is required.' });
    res.status(201).json(await Crop.create({ owner: req.user.id, name: name.trim(), season, plantedOn: plantedOn || null, status, notes, farm: farm || null }));
  } catch (e) { next(e); }
});
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['name', 'season', 'plantedOn', 'status', 'notes'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const crop = await Crop.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, updates, { new: true, runValidators: true });
    if (!crop) return res.status(404).json({ message: 'Crop not found.' });
    res.json(crop);
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const crop = await Crop.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!crop) return res.status(404).json({ message: 'Crop not found.' });
    res.json({ message: 'Crop deleted.' });
  } catch (e) { next(e); }
});
export default router;
