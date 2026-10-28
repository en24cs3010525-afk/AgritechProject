import React from 'react';
import { useEffect, useState } from 'react';
import { Sprout, CloudSun, Droplets, Leaf, LayoutDashboard, Tractor, Bell, LogOut, Plus, MapPin, Menu, X, Sun, Wind, ShieldCheck } from 'lucide-react';
import api from './api';

const initialStats = [
  { label: 'My Farms', value: 'â€”', note: 'Your registered farms', icon: Tractor },
  { label: 'Active Crops', value: 'â€”', note: 'Growing this season', icon: Sprout },
  { label: 'Weather', value: 'â€”', note: 'Local conditions', icon: CloudSun },
  { label: 'Alerts', value: '2', note: 'Seasonal reminders', icon: Bell }
];

export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('agritech_user')); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('agritech_token'));
  const [view, setView] = useState('dashboard');
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('Ujjain');
  const [notice, setNotice] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [farmForm, setFarmForm] = useState({ name: '', location: '', area: '', soilType: 'Loamy' });
  const [cropForm, setCropForm] = useState({ name: '', season: 'Kharif', status: 'Growing', notes: '' });
  const [busy, setBusy] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function loadData() {
    if (!token) return;
    try {
      const [farmRes, cropRes] = await Promise.all([api.get('/farms'), api.get('/crops')]);
      setFarms(farmRes.data); setCrops(cropRes.data);
    } catch (e) { setNotice(e.response?.data?.message || 'Could not load your records. Is the API running?'); }
  }
  useEffect(() => { loadData(); }, [token]);
  async function getWeather(e) {
    e?.preventDefault();
    try { const { data } = await api.get('/weather', { params: { city } }); setWeather(data); setNotice(''); }
    catch (e) { setWeather(null); setNotice(e.response?.data?.message || 'Weather lookup failed.'); }
  }
  useEffect(() => { getWeather(); }, []);
  async function submitAuth(e) {
    e.preventDefault(); setBusy(true); setNotice('');
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, authForm);
      localStorage.setItem('agritech_token', data.token);
      localStorage.setItem('agritech_user', JSON.stringify(data.user));
      setToken(data.token); setUser(data.user); setAuthForm({ name: '', email: '', password: '' });
      setNotice(`Welcome${data.user.name ? `, ${data.user.name}` : ''}!`);
    } catch (e) { setNotice(e.response?.data?.message || 'Authentication failed.'); }
    finally { setBusy(false); }
  }
  function logout() {
    localStorage.removeItem('agritech_token'); localStorage.removeItem('agritech_user');
    setToken(null); setUser(null); setFarms([]); setCrops([]); setView('dashboard');
  }
  async function addFarm(e) {
    e.preventDefault();
    try { await api.post('/farms', { ...farmForm, area: Number(farmForm.area) || 0 }); setFarmForm({ name: '', location: '', area: '', soilType: 'Loamy' }); setNotice('Farm added successfully.'); await loadData(); }
    catch (e) { setNotice(e.response?.data?.message || 'Could not add farm.'); }
  }
  async function addCrop(e) {
    e.preventDefault();
    try { await api.post('/crops', cropForm); setCropForm({ name: '', season: 'Kharif', status: 'Growing', notes: '' }); setNotice('Crop added successfully.'); await loadData(); }
    catch (e) { setNotice(e.response?.data?.message || 'Could not add crop.'); }
  }
  async function deleteFarm(id) {
    try { await api.delete(`/farms/${id}`); await loadData(); setNotice('Farm deleted.'); }
    catch (e) { setNotice(e.response?.data?.message || 'Could not delete farm.'); }
  }
  async function deleteCrop(id) {
    try { await api.delete(`/crops/${id}`); await loadData(); setNotice('Crop deleted.'); }
    catch (e) { setNotice(e.response?.data?.message || 'Could not delete crop.'); }
  }

  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'farms', label: 'My Farms', icon: Tractor },
    { id: 'crops', label: 'Crop Monitor', icon: Leaf },
    { id: 'weather', label: 'Weather', icon: CloudSun },
    { id: 'alerts', label: 'Pest & Alerts', icon: Bell }
  ];
  const stats = [
    { ...initialStats[0], value: farms.length },
    { ...initialStats[1], value: crops.filter(c => c.status === 'Growing').length },
    { ...initialStats[2], value: weather?.temperature != null ? `${Math.round(weather.temperature)}Â°C` : 'â€”' },
    initialStats[3]
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Sprout size={23}/></div><div><strong>AgriTech</strong><small>SMART FARMING</small></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={20}/></button></div>
      <div className="farm-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.id} className={`nav-link ${view === item.id ? 'active' : ''}`} onClick={() => { setView(item.id); setMobileOpen(false); }}><item.icon size={18}/><span>{item.label}</span>{item.id === 'alerts' && <span className="nav-count">2</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="support-card"><div className="support-icon"><ShieldCheck size={19}/></div><strong>Grow with confidence</strong><p>Keep your farm records organized and make informed decisions.</p></div>{user ? <button className="profile-row" onClick={logout}><div className="avatar">{user.name?.[0]?.toUpperCase() || 'F'}</div><div className="profile-text"><strong>{user.name}</strong><small>Farmer account</small></div><LogOut size={17}/></button> : <button className="profile-row" onClick={() => {setView('account')}}><div className="avatar">F</div><div className="profile-text"><strong>Guest farmer</strong><small>Sign in to sync data</small></div></button>}</div>
    </aside>
    {mobileOpen && <button className="scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="menu-toggle" onClick={() => setMobileOpen(!mobileOpen)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{nav.find(n => n.id === view)?.label || 'Account'}</strong></div><div className="topbar-right"><span className="status-dot"/> <span className="status-label">Farm workspace</span><button className="icon-button" onClick={() => setView('alerts')} aria-label="View alerts"><Bell size={19}/><i/></button><div className="top-avatar">{user?.name?.[0]?.toUpperCase() || 'F'}</div></div></header>
      <div className="content">
        {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss notice"><X size={16}/></button></div>}
        {view === 'account' && <section className="auth-card"><div className="section-eyebrow">YOUR ACCOUNT</div><h2>{authMode === 'login' ? 'Welcome back' : 'Create your farmer account'}</h2><p>Sign in to save your farms and crop records securely.</p><form onSubmit={submitAuth} className="form-stack">{authMode === 'register' && <label>Full name<input required value={authForm.name} onChange={e => setAuthForm({...authForm, name:e.target.value})} placeholder="Your name"/></label>}<label>Email address<input required type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email:e.target.value})} placeholder="farmer@example.com"/></label><label>Password<input required minLength="8" type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password:e.target.value})} placeholder="At least 8 characters"/></label><button className="btn-primary-custom" disabled={busy}>{busy ? 'Please waitâ€¦' : authMode === 'login' ? 'Sign in' : 'Create account'}</button></form><button className="text-action" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'New here? Create an account' : 'Already registered? Sign in'}</button></section>}
        {view === 'dashboard' && <>
          <section className="welcome-row"><div><div className="section-eyebrow"><span className="eyebrow-line"/> SMART AGRICULTURE, SIMPLIFIED</div><h1>Good day{user?.name ? `, ${user.name.split(' ')[0]}` : ', Farmer'} <span className="wave">âœ³</span></h1><p className="muted-lead">Here's what's happening across your farm today.</p></div><button className="btn-primary-custom add-btn" onClick={() => setView('farms')}><Plus size={18}/> Add your farm</button></section>
          <section className="hero-banner"><div className="hero-copy"><span className="hero-tag"><Sprout size={14}/> YOUR FARM, YOUR FUTURE</span><h2>Smarter farming starts<br/>with better insights.</h2><p>Track your crops, understand your local weather, and plan the season ahead â€” all in one place.</p><button className="hero-button" onClick={() => setView('crops')}>Explore crop monitor <span>â†—</span></button></div><div className="hero-art"><div className="sun-disc"><Sun size={34}/></div><div className="hill hill-back"/><div className="hill hill-front"/><div className="crop-stalk stalk-one"><i/><i/><i/></div><div className="crop-stalk stalk-two"><i/><i/><i/></div><div className="crop-stalk stalk-three"><i/><i/><i/></div></div><div className="hero-index">01 <span>/ FARM OVERVIEW</span></div></section>
          <section className="stats-grid">{stats.map((s, i) => <article className="stat-card" key={s.label}><div className={`stat-icon tone-${i}`}><s.icon size={20}/></div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div><div className="stat-note">{s.note}</div></article>)}</section>
          <section className="dashboard-grid"><article className="panel crop-panel"><div className="panel-head"><div><div className="section-eyebrow">FIELD NOTES</div><h3>Crop monitor</h3></div><button className="view-all" onClick={() => setView('crops')}>View all <span>â†’</span></button></div>{crops.length ? crops.slice(0,4).map(c => <div className="crop-row" key={c._id}><div className="crop-thumb"><Sprout size={21}/></div><div className="crop-info"><strong>{c.name}</strong><small>{c.season || 'Current season'}</small></div><span className={`pill ${c.status === 'Harvested' ? 'pill-done' : 'pill-growing'}`}>{c.status}</span></div>) : <div className="empty-state"><div className="empty-icon"><Leaf/></div><strong>Your crop list starts here</strong><p>Add crops to track their progress throughout the season.</p><button className="text-action" onClick={() => setView('crops')}>Add first crop â†’</button></div>}</article>
          <article className="panel weather-panel"><div className="panel-head"><div><div className="section-eyebrow">LOCAL CONDITIONS</div><h3>Weather snapshot</h3></div><div className="weather-symbol"><CloudSun size={23}/></div></div><form className="city-form" onSubmit={getWeather}><MapPin size={15}/><input value={city} onChange={e => setCity(e.target.value)} aria-label="City for weather" placeholder="Enter city"/><button aria-label="Search weather">â†—</button></form>{weather?.temperature != null ? <><div className="weather-temp">{Math.round(weather.temperature)}<span>Â°C</span></div><div className="weather-desc">{weather.description}</div><div className="weather-details"><div><Droplets size={16}/><span>Humidity</span><strong>{weather.humidity}%</strong></div><div><Wind size={16}/><span>Wind</span><strong>{weather.windSpeed} m/s</strong></div></div></> : <div className="weather-placeholder"><CloudSun size={32}/><strong>Weather at a glance</strong><p>Add a weather API key to view live conditions for your area.</p><button className="text-action" onClick={() => setView('weather')}>Weather details â†’</button></div>}</article></section>
          <section className="bottom-tip"><div className="tip-icon"><Sun size={21}/></div><div><strong>A little planning goes a long way.</strong><p>Record your soil type and planting dates to make your farm dashboard more useful.</p></div><button onClick={() => setView('farms')}>Manage farm details <span>â†’</span></button></section>
        </>}
        {view === 'farms' && <section><div className="page-heading"><div className="section-eyebrow">YOUR LAND</div><h1>My farms</h1><p>Keep your farm locations and soil information in one place.</p></div><div className="two-col"><form className="panel form-panel" onSubmit={addFarm}><h3>Add a farm</h3><label>Farm name<input required value={farmForm.name} onChange={e=>setFarmForm({...farmForm,name:e.target.value})} placeholder="e.g. Green Valley Farm"/></label><label>Location<input value={farmForm.location} onChange={e=>setFarmForm({...farmForm,location:e.target.value})} placeholder="Village, district"/></label><div className="form-inline"><label>Area (acres)<input type="number" min="0" step="0.1" value={farmForm.area} onChange={e=>setFarmForm({...farmForm,area:e.target.value})} placeholder="0"/></label><label>Soil type<select value={farmForm.soilType} onChange={e=>setFarmForm({...farmForm,soilType:e.target.value})}><option>Loamy</option><option>Clay</option><option>Sandy</option><option>Silty</option><option>Black soil</option><option>Unknown</option></select></label></div><button className="btn-primary-custom"><Plus size={17}/> Save farm</button>{!token && <small className="form-hint">Sign in first to save farm records.</small>}</form><div className="farm-list">{farms.length ? farms.map(f=><article className="panel farm-card" key={f._id}><div className="farm-card-icon"><Tractor/></div><div className="farm-card-main"><h3>{f.name}</h3><p><MapPin size={14}/>{f.location || 'Location not added'}</p><div className="farm-meta"><span>{f.area} acres</span><span>{f.soilType} soil</span></div></div><button className="delete-button" onClick={()=>deleteFarm(f._id)}>Delete</button></article>) : <div className="panel empty-large"><Tractor size={28}/><h3>No farms yet</h3><p>Add your first farm using the form.</p></div>}</div></div></section>}
        {view === 'crops' && <section><div className="page-heading"><div className="section-eyebrow">GROW WITH INSIGHT</div><h1>Crop monitor</h1><p>Track crop types, growing seasons, and notes.</p></div><div className="two-col"><form className="panel form-panel" onSubmit={addCrop}><h3>Add a crop</h3><label>Crop name<input required value={cropForm.name} onChange={e=>setCropForm({...cropForm,name:e.target.value})} placeholder="e.g. Soybean, Wheat"/></label><div className="form-inline"><label>Season<select value={cropForm.season} onChange={e=>setCropForm({...cropForm,season:e.target.value})}><option>Kharif</option><option>Rabi</option><option>Zaid</option><option>Perennial</option></select></label><label>Status<select value={cropForm.status} onChange={e=>setCropForm({...cropForm,status:e.target.value})}><option>Planned</option><option>Growing</option><option>Harvested</option></select></label></div><label>Notes<textarea rows="3" value={cropForm.notes} onChange={e=>setCropForm({...cropForm,notes:e.target.value})} placeholder="Planting date, observations, remindersâ€¦"/></label><button className="btn-primary-custom"><Plus size={17}/> Save crop</button>{!token && <small className="form-hint">Sign in first to save crop records.</small>}</form><div className="crop-list">{crops.length ? crops.map(c=><article className="panel crop-detail" key={c._id}><div className="crop-thumb"><Sprout/></div><div className="crop-detail-content"><div className="crop-detail-title"><h3>{c.name}</h3><span className={`pill ${c.status==='Harvested'?'pill-done':'pill-growing'}`}>{c.status}</span></div><p>{c.season} season {c.farm?.name ? `Â· ${c.farm.name}` : ''}</p>{c.notes && <small>{c.notes}</small>}</div><button className="delete-button" onClick={()=>deleteCrop(c._id)}>Delete</button></article>) : <div className="panel empty-large"><Sprout size={28}/><h3>No crop records yet</h3><p>Use the form to add crops you are growing.</p></div>}</div></div></section>}
        {view === 'weather' && <section><div className="page-heading"><div className="section-eyebrow">PLAN AROUND THE ELEMENTS</div><h1>Weather outlook</h1><p>Check current conditions for your selected location.</p></div><article className="panel weather-page"><form className="city-form" onSubmit={getWeather}><MapPin size={16}/><input value={city} onChange={e=>setCity(e.target.value)} placeholder="Enter city name"/><button>Check weather â†—</button></form>{weather?.temperature != null ? <div className="weather-large"><CloudSun size={56}/><div><h2>{Math.round(weather.temperature)}Â°C</h2><strong>{weather.city}</strong><p>{weather.description} Â· Feels like {Math.round(weather.feelsLike)}Â°C</p></div><div className="weather-details"><div><Droplets/><span>Humidity</span><strong>{weather.humidity}%</strong></div><div><Wind/><span>Wind speed</span><strong>{weather.windSpeed} m/s</strong></div></div></div> : <div className="empty-large"><CloudSun size={36}/><h3>Live weather is not connected</h3><p>Set <code>WEATHER_API_KEY</code> in <code>server/.env</code>, then restart the API.</p></div>}</article><div className="info-grid"><article className="panel info-card"><Droplets/><h3>Soil moisture</h3><p>Record soil observations with your crop notes. Sensor integration can be added later.</p></article><article className="panel info-card"><Sun/><h3>Season planning</h3><p>Use local forecasts alongside guidance from your agricultural extension office.</p></article></div></section>}
        {view === 'alerts' && <section><div className="page-heading"><div className="section-eyebrow">STAY AHEAD</div><h1>Pest & farm alerts</h1><p>General reminders to help you plan regular field checks.</p></div><div className="alert-list"><article className="panel alert-card"><div className="alert-icon amber"><Bell/></div><div><span className="alert-type">FIELD CHECK Â· WEEKLY</span><h3>Inspect leaves for early pest signs</h3><p>Look for holes, discoloration, eggs, or unusual spots. Photograph symptoms and seek local expert guidance before applying treatments.</p></div></article><article className="panel alert-card"><div className="alert-icon blue"><Droplets/></div><div><span className="alert-type">WATER MANAGEMENT</span><h3>Review irrigation after rainfall</h3><p>Check soil moisture before watering and avoid over-irrigation. Needs vary by crop, soil, and growth stage.</p></div></article><article className="panel alert-card"><div className="alert-icon green"><Leaf/></div><div><span className="alert-type">CROP RECORDS</span><h3>Keep planting dates up to date</h3><p>Planting dates and field notes help you compare progress and plan seasonal activities.</p></div></article></div><p className="disclaimer">These are general reminders, not diagnosis or pesticide recommendations. For suspected outbreaks, contact a qualified local agricultural expert.</p></section>}
      </div>
      <footer className="footer"><span>Â© 2026 AgriTech</span><span>Built for a more connected farming future <Sprout size={14}/></span></footer>
    </main>
  </div>;
}

