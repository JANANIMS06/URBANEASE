import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, Bug, Zap, Hammer, Wrench, Settings, Paintbrush, Snowflake, Sprout, Search, Star, Clock, ArrowRight, UserRound, CalendarDays, Menu, X, MessageCircle, Send, ShieldCheck, CheckCircle2, LogOut, ClipboardList, ChevronLeft } from 'lucide-react';
import './styles.css';

const API = 'http://localhost:5000/api';
const categories = [
  {label:'Pest Control', icon:Bug}, {label:'Electrical', icon:Zap}, {label:'Carpentry', icon:Hammer},
  {label:'Plumbing', icon:Wrench}, {label:'Home Maintenance', icon:Settings}, {label:'Appliance Repair', icon:Settings},
  {label:'Painting', icon:Paintbrush}, {label:'Home Cleaning', icon:Home}, {label:'AC Repair', icon:Snowflake}
];
const iconMap = {bug:Bug,zap:Zap,hammer:Hammer,wrench:Wrench,settings:Settings,paintbrush:Paintbrush,house:Home,snowflake:Snowflake,sprout:Sprout};
const money = n => '₹' + Number(n).toLocaleString('en-IN', {maximumFractionDigits:0});
function readSession() { try { return {token:localStorage.getItem('ue_token'), user:JSON.parse(localStorage.getItem('ue_user')||'null')}; } catch { return {token:null,user:null}; } }
async function request(path, {token, ...options}={}) {
  const res = await fetch(API+path, { ...options, headers: { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`} : {}), ...(options.headers||{}) }});
  const data = await res.json().catch(()=>({message:'Unexpected response from server.'}));
  if (!res.ok) throw new Error(data.message || 'Request failed.');
  return data;
}
function App(){
  const [session,setSession] = useState(readSession);
  const [services,setServices] = useState([]);
  const [query,setQuery] = useState('');
  const [page,setPage] = useState('home');
  const [selected,setSelected] = useState(null);
  const [bookings,setBookings] = useState([]);
  const [notice,setNotice] = useState('');
  const [error,setError] = useState('');
  const [chatOpen,setChatOpen] = useState(false);
  const [chatText,setChatText] = useState('');
  const [chatMessages,setChatMessages] = useState([{from:'bot',text:'Hi! Welcome to UrbanEase. I can help you find a home service. What do you need help with?'}]);
  const [mobileMenu,setMobileMenu] = useState(false);
  const [loading,setLoading] = useState(true);

  const loadServices = async (q='') => {
    try { const data=await request('/services?q='+encodeURIComponent(q)); setServices(data); setError(''); }
    catch(e) { setError(e.message+' Check that the backend and PostgreSQL are running.'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ loadServices(); },[]);
  const show = (p) => { setPage(p); setNotice(''); setError(''); setMobileMenu(false); window.scrollTo({top:0,behavior:'smooth'}); };
  const signedIn = !!session.token && !!session.user;
  function saveSession(data){ localStorage.setItem('ue_token',data.token); localStorage.setItem('ue_user',JSON.stringify(data.user)); setSession({token:data.token,user:data.user}); setNotice('Welcome, '+data.user.fullName+'!'); show('home'); }
  function logout(){ localStorage.removeItem('ue_token');localStorage.removeItem('ue_user');setSession({token:null,user:null});setBookings([]);show('home');setNotice('You have signed out.'); }
  async function loadBookings(){ if(!signedIn){show('auth');return;} try{setBookings(await request('/bookings/mine',{token:session.token}));show('bookings');}catch(e){setError(e.message);}}
  const filtered = useMemo(()=>services,[services]);

  return <div className="app">
    <header className="topbar"><div className="nav-inner">
      <button className="brand" onClick={()=>show('home')}><span className="brand-icon"><Home size={23}/></span><span><b>ServiceHub</b><small>Your trusted home services</small></span></button>
      <button className="mobile-toggle" onClick={()=>setMobileMenu(!mobileMenu)}>{mobileMenu?<X/>:<Menu/>}</button>
      <nav className={mobileMenu?'nav-links open':'nav-links'}>
        {signedIn && <button className="nav-text" onClick={loadBookings}>My Bookings</button>}
        <button className="nav-text" onClick={()=>show('provider')}>Become Provider</button>
        {signedIn ? <button className="outline-btn" onClick={logout}><LogOut size={15}/> Sign Out</button> : <button className="outline-btn" onClick={()=>show('auth')}>Sign In</button>}
      </nav>
    </div></header>

    {notice && <div className="notice"><CheckCircle2 size={17}/>{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}
    {error && <div className="error-banner">{error}<button onClick={()=>setError('')}><X size={15}/></button></div>}

    {page==='home' && <main>
      <section className="hero">
        <h1>Home services at your doorstep</h1>
        <div className="category-panel">
          <h2>What are you looking for?</h2>
          <div className="category-grid">{categories.map(({label,icon:Icon})=><button className="category-tile" key={label} onClick={()=>{setQuery(label);loadServices(label);document.getElementById('all-services')?.scrollIntoView({behavior:'smooth'});}}><span><Icon size={27}/></span><b>{label}</b></button>)}</div>
          <form className="searchbox" onSubmit={e=>{e.preventDefault();loadServices(query);document.getElementById('all-services')?.scrollIntoView({behavior:'smooth'});}}><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search for services..."/>{query && <button type="button" className="clear-search" onClick={()=>{setQuery('');loadServices('')}}>Clear</button>}</form>
        </div>
      </section>
      <section className="services-section" id="all-services"><div className="section-heading"><div><h2>All Services</h2><p>{services.length} services available</p></div><span className="section-note"><ShieldCheck size={16}/> Trusted professionals</span></div>
        {loading?<div className="empty-state">Loading services…</div>:filtered.length===0?<div className="empty-state">No services match your search. Try another keyword.</div>:
        <div className="service-grid">{filtered.map(s=><ServiceCard key={s.id} service={s} onBook={()=>{setSelected(s);show(signedIn?'booking':'auth');}}/>)}</div>}
      </section>
      <section className="stats"><div><Star className="yellow" fill="currentColor"/><strong>4.8</strong><span>Service Rating*</span></div><div><UserRound/><strong>12M+</strong><span>Customers Globally*</span></div></section>
      <footer><span className="brand-icon small"><Home size={17}/></span><b>ServiceHub</b><p>Professional home services at your fingertips</p><small>*Sample display figures for this local demo.</small></footer>
    </main>}

    {page==='auth' && <AuthPage onSuccess={saveSession} onBack={()=>show('home')}/>}
    {page==='booking' && selected && <BookingPage service={selected} token={session.token} onBack={()=>show('home')} onSuccess={msg=>{setNotice(msg);show('home');}} onNeedAuth={()=>show('auth')}/>}
    {page==='provider' && <ProviderPage onBack={()=>show('home')} onSuccess={msg=>{setNotice(msg);show('home');}}/>}
    {page==='bookings' && <BookingsPage bookings={bookings} token={session.token} onRefresh={loadBookings} onBack={()=>show('home')} onError={setError} onNotice={setNotice}/>}
    <button className="chat-fab" onClick={()=>setChatOpen(!chatOpen)} aria-label="Open chat">{chatOpen?<X size={20}/>:<MessageCircle size={20}/>}</button>
    {chatOpen && <div className="chat-window"><div className="chat-head"><span><MessageCircle size={18}/> UrbanEase Assistant</span><button onClick={()=>setChatOpen(false)}><X size={17}/></button></div><div className="chat-body">{chatMessages.map((m,i)=><div key={i} className={'chat-bubble '+m.from}>{m.text}</div>)}</div><form className="chat-input" onSubmit={e=>{e.preventDefault();if(!chatText.trim())return;const t=chatText.trim();setChatMessages(prev=>[...prev,{from:'user',text:t},{from:'bot',text:'Thanks for your message! You can browse the service catalogue and book a service here. This local demo assistant is not connected to Gemini AI yet.'}]);setChatText('');}}><input value={chatText} onChange={e=>setChatText(e.target.value)} placeholder="Type your message…"/><button><Send size={17}/></button></form></div>}
  </div>;
}
function ServiceCard({service:s,onBook}){const Icon=iconMap[s.icon]||Wrench;return <article className="service-card"><div className="service-image"><img src={s.image_url} alt={s.name} loading="lazy" onError={e=>{e.currentTarget.src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80';}}/><span className="rating"><Star size={12} fill="currentColor"/> {Number(s.rating).toFixed(2)}</span></div><div className="service-content"><div className="service-title"><h3>{s.name}</h3><span className="service-icon"><Icon size={17}/></span></div><p>{s.description}</p><div className="service-meta"><span><Clock size={13}/>{s.duration_minutes} mins</span><strong>{money(s.price_inr)}</strong></div><button className="primary-btn book-btn" onClick={onBook}>Book Now <ArrowRight size={16}/></button></div></article>}
function AuthPage({onSuccess,onBack}){const [mode,setMode]=useState('login');const [form,setForm]=useState({fullName:'',email:'',password:''});const [error,setError]=useState('');const [busy,setBusy]=useState(false);
async function submit(e){e.preventDefault();setError('');setBusy(true);try{const d=await request('/auth/'+(mode==='login'?'login':'register'),{method:'POST',body:JSON.stringify(form)});onSuccess(d);}catch(e){setError(e.message);}finally{setBusy(false);}}
return <main className="subpage auth-bg"><button className="back-link" onClick={onBack}><ChevronLeft size={17}/> Back to services</button><section className="auth-card"><div className="auth-brand"><span className="brand-icon"><Home/></span></div><h1>Welcome to ServiceHub</h1><p className="muted">Your trusted home services platform</p><div className="auth-tabs"><button className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('');}}>Sign In</button><button className={mode==='register'?'active':''} onClick={()=>{setMode('register');setError('');}}>Sign Up</button></div>{error&&<p className="form-error">{error}</p>}<form onSubmit={submit} className="form-stack">{mode==='register'&&<label>Full Name<input required value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} placeholder="Enter your full name"/></label>}<label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Enter your email"/></label><label>Password<input type="password" minLength="8" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 8 characters"/></label><button className="primary-btn" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign In':'Create Account'} <ArrowRight size={17}/></button></form><p className="fineprint">Local demo authentication. Google sign-in is not connected.</p></section></main>}
function BookingPage({service,token,onBack,onSuccess,onNeedAuth}){const [form,setForm]=useState({bookingDate:'',bookingTime:'10:00',address:'',notes:''});const [error,setError]=useState('');const [busy,setBusy]=useState(false);const today=new Date().toLocaleDateString('en-CA');
async function submit(e){e.preventDefault();if(!token){onNeedAuth();return;}setBusy(true);setError('');try{await request('/bookings',{token,method:'POST',body:JSON.stringify({...form,serviceId:service.id})});onSuccess('Your '+service.name+' booking has been created.');}catch(e){setError(e.message);}finally{setBusy(false);}}
return <main className="subpage"><button className="back-link" onClick={onBack}><ChevronLeft size={17}/> Back to services</button><div className="booking-layout"><section className="booking-card"><h1>Book your service</h1><p className="muted">Choose a convenient date and time.</p>{error&&<p className="form-error">{error}</p>}<form className="form-stack" onSubmit={submit}><label>Service<input readOnly value={service.name}/></label><div className="form-row"><label>Date<input type="date" min={today} required value={form.bookingDate} onChange={e=>setForm({...form,bookingDate:e.target.value})}/></label><label>Time<select required value={form.bookingTime} onChange={e=>setForm({...form,bookingTime:e.target.value})}>{['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'].map(t=><option key={t} value={t}>{t}</option>)}</select></label></div><label>Service Address<textarea required rows="3" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Enter your full address"/></label><label>Additional details (optional)<textarea rows="2" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Tell us anything the professional should know"/></label><button className="primary-btn" disabled={busy}>{busy?'Creating booking…':'Confirm Booking'} <ArrowRight size={17}/></button></form></section><aside className="summary-card"><img src={service.image_url} alt={service.name}/><h2>{service.name}</h2><p>{service.description}</p><div className="summary-line"><span>Estimated duration</span><b>{service.duration_minutes} mins</b></div><div className="summary-line total"><span>Service price</span><strong>{money(service.price_inr)}</strong></div><p className="fineprint">Demo booking only. No payment is charged.</p></aside></div></main>}
function ProviderPage({onBack,onSuccess}){const [form,setForm]=useState({fullName:'',email:'',phone:'',city:'',address:'',experience:'1-2 years',hourlyRate:'',categories:[],skills:'',portfolioUrl:'',availability:'09:00 AM',equipment:[]});const [error,setError]=useState('');const [busy,setBusy]=useState(false);const serviceOptions=['Cleaning','Painting','Pest Control','Plumbing','Electrical','Carpentry','Appliance Repair','AC Repair','Home Maintenance','Garden Maintenance'];const equipmentOptions=['I have liability insurance','I have my own professional equipment and tools',"I'm willing to undergo background verification",'I agree to the Terms of Service and Privacy Policy'];
const update=(k,v)=>setForm({...form,[k]:v});const toggle=(key,v)=>update(key,form[key].includes(v)?form[key].filter(x=>x!==v):[...form[key],v]);
async function submit(e){e.preventDefault();setError('');setBusy(true);try{const d=await request('/providers/apply',{method:'POST',body:JSON.stringify(form)});onSuccess(d.message);}catch(e){setError(e.message);}finally{setBusy(false);}}
return <main className="subpage"><button className="back-link" onClick={onBack}><ChevronLeft size={17}/> Back to ServiceHub</button><section className="provider-card"><div className="provider-heading"><h1>Provider Application</h1><p className="muted">Join our network of trusted professionals and start earning by providing quality home services.</p></div>{error&&<p className="form-error">{error}</p>}<form className="form-stack" onSubmit={submit}><h3>Personal Information</h3><div className="form-row"><label>Full Name *<input required value={form.fullName} onChange={e=>update('fullName',e.target.value)}/></label><label>Email Address *<input type="email" required value={form.email} onChange={e=>update('email',e.target.value)}/></label></div><div className="form-row"><label>Phone Number *<input required value={form.phone} onChange={e=>update('phone',e.target.value)}/></label><label>City *<input required value={form.city} onChange={e=>update('city',e.target.value)}/></label></div><label>Full Address *<textarea required rows="2" value={form.address} onChange={e=>update('address',e.target.value)}/></label><h3>Professional Information</h3><div className="form-row"><label>Years of Experience *<select value={form.experience} onChange={e=>update('experience',e.target.value)}>{['Less than one year','1-2 years','3-5 years','6-10 years','More than 10 years'].map(x=><option key={x}>{x}</option>)}</select></label><label>Desired Hourly Rate (₹) *<input type="number" min="1" required value={form.hourlyRate} onChange={e=>update('hourlyRate',e.target.value)}/></label></div><label>Service Categories *<div className="check-grid">{serviceOptions.map(x=><label className="check-option" key={x}><input type="checkbox" checked={form.categories.includes(x)} onChange={()=>toggle('categories',x)}/>{x}</label>)}</div></label><label>Skills & Specializations *<textarea required rows="3" value={form.skills} onChange={e=>update('skills',e.target.value)} placeholder="Describe your skills and specializations"/></label><label>Portfolio / Website (Optional)<input type="url" value={form.portfolioUrl} onChange={e=>update('portfolioUrl',e.target.value)} placeholder="https://"/></label><label>Availability *<input required value={form.availability} onChange={e=>update('availability',e.target.value)} placeholder="e.g. 9 AM - 6 PM"/></label><label>Certifications & Equipment<div className="check-list">{equipmentOptions.map(x=><label className="check-option" key={x}><input type="checkbox" checked={form.equipment.includes(x)} onChange={()=>toggle('equipment',x)}/>{x}</label>)}</div></label><button className="primary-btn" disabled={busy}>{busy?'Submitting…':'Submit Application'} <ArrowRight size={17}/></button><p className="fineprint">Applications are stored locally in the database with a pending status.</p></form></section></main>}
function BookingsPage({bookings,token,onRefresh,onBack,onError,onNotice}){const [busyId,setBusyId]=useState(null);async function cancel(id){setBusyId(id);try{const d=await request(`/bookings/${id}/cancel`,{token,method:'PATCH'});onNotice(d.message);await onRefresh();}catch(e){onError(e.message);}finally{setBusyId(null);}}return <main className="subpage"><button className="back-link" onClick={onBack}><ChevronLeft size={17}/> Back to services</button><section className="bookings-wrap"><div className="section-heading"><div><h1>My Bookings</h1><p className="muted">View and manage your service appointments.</p></div><ClipboardList size={28}/></div>{!bookings.length?<div className="empty-state">You don't have any bookings yet.</div>:<div className="booking-list">{bookings.map(b=><article className="booking-row" key={b.id}><div className="booking-symbol"><CalendarDays/></div><div className="booking-info"><h3>{b.service_name}</h3><p>{new Date(b.booking_date).toLocaleDateString()} · {String(b.booking_time).slice(0,5)}</p><p>{b.address}</p><span className={'status '+b.status}>{b.status}</span></div><div className="booking-price"><strong>{money(b.price_inr)}</strong>{['confirmed','pending'].includes(b.status)&&<button className="cancel-btn" disabled={busyId===b.id} onClick={()=>cancel(b.id)}>{busyId===b.id?'Cancelling…':'Cancel'}</button>}</div></article>)}</div>}</section></main>}
createRoot(document.getElementById('root')).render(<App/>);
