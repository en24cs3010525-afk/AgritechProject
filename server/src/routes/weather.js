import { Router } from 'express';
const router = Router();
router.get('/', async (req, res) => {
  const city = String(req.query.city || 'Ujjain').trim();
  if (!process.env.WEATHER_API_KEY) {
    return res.status(503).json({ message: 'Live weather is not configured. Add WEATHER_API_KEY to server/.env.', city });
  }
  try {
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.set('q', city);
    url.searchParams.set('appid', process.env.WEATHER_API_KEY);
    url.searchParams.set('units', 'metric');
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ message: data.message || 'Weather provider error' });
    res.json({ city: data.name, temperature: data.main.temp, feelsLike: data.main.feels_like, humidity: data.main.humidity, description: data.weather?.[0]?.description, windSpeed: data.wind?.speed });
  } catch { res.status(502).json({ message: 'Could not fetch weather right now.' }); }
});
export default router;
