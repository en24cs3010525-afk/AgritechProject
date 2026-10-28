import { Router } from 'express';
import Farm from '../models/Farm.js';
import auth from '../middleware/auth.js';
const router = Router();
router.use(auth);
router.get('/', async (req, res, next) => {
  try { res.json(await Farm.find({ owner: req.user.id }).sort({ createdAt: -1 })); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { name, location = '', area = 0, soilType = 'Unknown' } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Farm name is required.' });
    res.status(201).json(await Farm.create({ owner: req.user.id, name: name.trim(), location, area, soilType }));
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Farm.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Farm not found.' });
    res.json({ message: 'Farm deleted.' });
  } catch (e) { next(e); }
});
export default router;
