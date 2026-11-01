import { useEffect, useMemo, useState } from 'react'
import {
  Activity, BookHeart, CalendarDays, Check, ChevronRight, Cloud, Download,
  Dumbbell, GraduationCap, Heart, LayoutDashboard, Menu, Moon, Plus,
  RotateCcw, Settings, Sparkles, Target, TrendingUp, Trophy, X, NotebookPen
} from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'

const STORAGE_KEY = 'level-up-45-cute-v2'
const STICKERS = '/stickers/'
const HABITS = [
  { id: 'movement', label: 'Gym / planned movement', group: 'Fitness', detail: 'Move your body with love', sticker: 't-move.png', icon: Dumbbell },
  { id: 'balancedMeals', label: 'Balanced meals', group: 'Fitness', detail: 'Nourish, don’t punish', sticker: 't-eat.png', icon: Heart },
  { id: 'placement', label: 'Placement preparation', group: 'Career', detail: 'One step closer to your goal', sticker: 't-prep.png', icon: GraduationCap },
  { id: 'cloudAI', label: 'Cloud + Generative AI learning', group: 'Skills', detail: 'Keep that curiosity alive', sticker: 'cat-note.png', icon: Cloud },
  { id: 'personal', label: 'Personal development', group: 'Growth', detail: 'A little time just for you', sticker: 'cat-side.png', icon: BookHeart },
  { id: 'sleep', label: 'Adequate sleep', group: 'Wellbeing', detail: 'Rest is productive too', sticker: 't-sleep.png', icon: Moon },
]
const NAV = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Daily tracker', icon: Check },
  { name: 'Weekly reports', icon: TrendingUp },
  { name: '45-day calendar', icon: CalendarDays },
  { name: 'Settings', icon: Settings },
]
const todayISO = () => {
  const d = new Date(); const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}
const dateAt = (iso) => new Date(`${iso}T12:00:00`)
const addDays = (iso, n) => { const d = dateAt(iso); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
const formatDate = (iso, options = { day: 'numeric', month: 'short' }) => dateAt(iso).toLocaleDateString('en-IN', options)
const emptyDay = () => ({ habits: {}, note: '' })
function loadData() {
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (saved) return { startDate: saved.startDate || todayISO(), entries: saved.entries || {}, settings: saved.settings || {} } } catch {}
  return { startDate: todayISO(), entries: {}, settings: {} }
}
function Sticker({ name, className = '', alt = '' }) { return <img className={`sticker ${className}`} src={`${STICKERS}${name}`} alt={alt} /> }
function StatCard({ label, value, helper, sticker, tint }) {
  return <article className={`stat-card ${tint}`}><div className="stat-sticker"><Sticker name={sticker} /></div><div className="stat-copy"><p>{label}</p><strong>{value}</strong><small>{helper}</small></div></article>
}
function ProgressRing({ value }) {
  const safe = Math.max(0, Math.min(100, value))
  return <div className="progress-ring" style={{ '--progress': `${safe * 3.6}deg` }}><div className="progress-ring-inner"><strong>{Math.round(safe)}%</strong><span>complete</span></div></div>
}
export default function App() {
  const [data, setData] = useState(loadData)
  const [activeTab, setActiveTab] = useState('Overview')
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [mobileMenu, setMobileMenu] = useState(false)
  const [toast, setToast] = useState('')
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }, [data])
  useEffect(() => {
  let last = todayISO()
  const check = () => {
    const now = todayISO()
    if (now !== last) {
      const prev = last
      last = now
      setSelectedDate(sel => (sel === prev ? now : sel))
      setToday(now)
    }
  }
  const id = setInterval(check, 30000)
  document.addEventListener('visibilitychange', check)
  return () => { clearInterval(id); document.removeEventListener('visibilitychange', check) }
}, [])
  const allDates = useMemo(() => Array.from({ length: 45 }, (_, i) => addDays(data.startDate, i)), [data.startDate])
  const [today, setToday] = useState(todayISO)
  const rawDay = Math.floor((dateAt(today) - dateAt(data.startDate)) / 86400000) + 1
  const currentDay = Math.max(1, Math.min(45, rawDay))
  const challengeProgress = Math.max(0, Math.min(100, currentDay / 45 * 100))
  const todayEntry = data.entries[today] || emptyDay()
  const selectedEntry = data.entries[selectedDate] || emptyDay()
  const completedToday = HABITS.filter(h => todayEntry.habits[h.id]).length
  const todayPercent = Math.round(completedToday / HABITS.length * 100)
  const completedCount = allDates.reduce((sum, date) => sum + HABITS.filter(h => data.entries[date]?.habits?.[h.id]).length, 0)
  const overallPercent = Math.round(completedCount / (45 * HABITS.length) * 100)
  const weeklyData = useMemo(() => Array.from({ length: 7 }, (_, week) => {
    const dates = allDates.slice(week * 7, week * 7 + 7)
    const done = dates.reduce((sum, date) => sum + HABITS.filter(h => data.entries[date]?.habits?.[h.id]).length, 0)
    const possible = dates.length * HABITS.length
    return { week: `Week ${week + 1}`, percent: possible ? Math.round(done / possible * 100) : 0, done }
  }), [allDates, data.entries])
  const trendData = useMemo(() => allDates.map((date, i) => ({ day: `D${i+1}`, progress: Math.round(HABITS.filter(h => data.entries[date]?.habits?.[h.id]).length / HABITS.length * 100) })), [allDates, data.entries])
  const streak = useMemo(() => {
    let count = 0; let cursor = today
    if (cursor > addDays(data.startDate, 44)) cursor = addDays(data.startDate, 44)
    while (cursor >= data.startDate) { const entry = data.entries[cursor]; if (!entry || !HABITS.some(h => entry.habits?.[h.id])) break; count++; cursor = addDays(cursor, -1) }
    return count
  }, [data.entries, data.startDate, today])
  const updateEntry = (date, updater) => setData(prev => { const old = prev.entries[date] || emptyDay(); return { ...prev, entries: { ...prev.entries, [date]: updater(old) } } })
  const toggleHabit = (id, date = selectedDate) => updateEntry(date, old => ({ ...old, habits: { ...old.habits, [id]: !old.habits[id] } }))
  const changeTab = name => { setActiveTab(name); setMobileMenu(false) }

  const Sidebar = () => <>
    {mobileMenu && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileMenu(false)} />}
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <div className="brand"><div className="brand-icon"><Sparkles size={19}/></div><div><b>Level Up 45</b><span>your soft reset era</span></div><button className="close-menu" onClick={() => setMobileMenu(false)} aria-label="Close"><X size={18}/></button></div>
      <div className="journey-card"><div className="journey-top"><span>✿ YOUR LITTLE JOURNEY</span><Sticker name="bow.png" /></div><div className="journey-day">Day {currentDay}<small> / 45</small></div><div className="journey-track"><i style={{ width: `${challengeProgress}%` }}/></div><p>{Math.max(0, 45-currentDay)} days left · you’ve got this!</p></div>
      <nav className="side-nav"><span className="nav-caption">YOUR SPACE</span>{NAV.map(({name, icon: Icon}) => <button key={name} className={`nav-item ${activeTab===name?'active':''}`} onClick={() => changeTab(name)}><Icon size={17}/>{name}{activeTab===name && <span className="nav-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><Sticker name="cat-side.png"/><p>Be gentle with yourself.</p><small>Little by little, day by day ♡</small></div>
    </aside>
  </>
  const Header = () => <header className="topbar"><div className="header-left"><button className="menu-button" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={20}/></button><div><p className="date-line">{formatDate(today, { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p><h1>{activeTab === 'Overview' ? 'Bloom at your own pace 🌷' : activeTab}</h1></div></div><div className="header-right"><span>one day at a time</span><div className="avatar">♡</div></div></header>

  const Overview = () => <div className="page-stack">
    <section className="hero-card"><div className="hero-text"><span className="eyebrow"><Sparkles size={13}/> YOUR 45-DAY RESET</span><h2>Small steps.<br/><em>Big changes.</em></h2><p>A little progress in fitness, career and personal growth adds up. Show up for yourself in ways that feel doable.</p><button className="primary-button" onClick={() => changeTab('Daily tracker')}>Track today <ChevronRight size={16}/></button><div className="hero-footnote">♡ progress, not perfection</div></div><div className="hero-decor"><span className="float-heart heart-one">♡</span><span className="float-heart heart-two">♡</span><Sticker name="hero.png" className="hero-image" alt="Cute girl studying with a laptop and bunny"/></div><Sticker name="bow.png" className="hero-bow"/></section>
    <section className="stats-grid"><StatCard label="Challenge day" value={`${currentDay} / 45`} helper={`${Math.max(0,45-currentDay)} days to go`} sticker="ic-calendar.png" tint="lilac"/><StatCard label="Today's progress" value={`${todayPercent}%`} helper={`${completedToday} of 6 habits checked`} sticker="ic-target.png" tint="pink"/><StatCard label="Current streak" value={`${streak} days`} helper="Keep your own pace" sticker="ic-fire.png" tint="peach"/><StatCard label="Overall completion" value={`${overallPercent}%`} helper="Across all 45 days" sticker="ic-trophy.png" tint="blue"/></section>
    <section className="dashboard-grid"><article className="panel tasks-panel"><div className="panel-heading"><div><h3>Today’s little wins <span>✿</span></h3><p>Every check is a tiny celebration.</p></div><button className="text-link" onClick={() => changeTab('Daily tracker')}>See all <ChevronRight size={14}/></button></div><div className="habit-list">{HABITS.map(h => <button className="habit-row" key={h.id} onClick={() => toggleHabit(h.id, today)}><span className="mini-sticker"><Sticker name={h.sticker}/></span><span className="habit-label"><b>{h.label}</b><small>{h.detail}</small></span><span className={`check-circle ${todayEntry.habits[h.id]?'checked':''}`}>{todayEntry.habits[h.id] && <Check size={13}/>}</span></button>)}</div></article>
      <article className="panel chart-panel"><div className="panel-heading"><div><h3>Your consistency</h3><p>A peek at your first seven days.</p></div><span className="tiny-flower">✿</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData.slice(0,7)} margin={{top:12,right:12,left:-25,bottom:0}}><defs><linearGradient id="pinkFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d28bd0" stopOpacity={0.55}/><stop offset="100%" stopColor="#d28bd0" stopOpacity={0.03}/></linearGradient></defs><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#f4e8ee"/><XAxis dataKey="day" tick={{fontSize:10,fill:'#aa91a2'}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fontSize:10,fill:'#aa91a2'}} tickFormatter={v=>`${v}%`} axisLine={false} tickLine={false}/><Tooltip formatter={v=>[`${v}%`,'Done']} contentStyle={{borderRadius:14,border:'1px solid #f3dfeb',fontSize:12}}/><Area type="monotone" dataKey="progress" stroke="#b983ec" strokeWidth={3} fill="url(#pinkFill)" dot={{r:4,fill:'#fff',stroke:'#b983ec',strokeWidth:2}} activeDot={{r:6,fill:'#b983ec',stroke:'#fff',strokeWidth:2}}/></AreaChart></ResponsiveContainer></div><div className="chart-caption"><span>🌷</span> Your pace is your own. Keep going!</div></article>      <article className="panel note-panel"><div className="panel-heading"><div><h3>A note for you</h3><p>A gentle reminder ♡</p></div><NotebookPen size={18}/></div><div className="note-card"><Sticker name="cat-note.png"/><strong>You are allowed to grow at your own pace.</strong><p>Keep learning, keep resting, keep believing in the person you’re becoming.</p><span>with love, your future self ♡</span></div></article></section>
  </div>

  const DailyTracker = () => <div className="tracker-layout"><article className="panel tracker-main"><div className="panel-heading"><div><h3>Your daily check-in 🌸</h3><p>Do what you can. That is enough.</p></div><span className="day-pill">DAY {Math.max(1,Math.min(45,Math.floor((dateAt(selectedDate)-dateAt(data.startDate))/86400000)+1))}</span></div><div className="date-picker-row"><label htmlFor="entry-date">Pick a date</label><input id="entry-date" className="date-input" type="date" min={data.startDate} max={addDays(data.startDate,44)} value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}/><button className="primary-button" onClick={()=>{setToast('Your little wins are saved ♡');const next=addDays(selectedDate,1);if(next<=addDays(data.startDate,44))setSelectedDate(next)}}><Heart size={15}/> Done for today</button></div><div className="tracker-cards">{HABITS.map(h=><button key={h.id} className={`tracker-card ${selectedEntry.habits[h.id]?'done':''}`} onClick={()=>toggleHabit(h.id)}><div className="tracker-card-top"><span className="tracker-sticker"><Sticker name={h.sticker}/></span><span className={`check-circle ${selectedEntry.habits[h.id]?'checked':''}`}>{selectedEntry.habits[h.id]&&<Check size={13}/>}</span></div><b>{h.label}</b><small>{h.detail}</small></button>)}</div><div className="note-field"><label htmlFor="daily-note">A little note to yourself <span>(optional)</span></label><textarea id="daily-note" rows="3" placeholder="What made you smile today? What did you learn?" value={selectedEntry.note} onChange={e=>updateEntry(selectedDate,old=>({...old,note:e.target.value}))}/></div><div className="save-row"><small>Your check-in saves automatically on this device.</small><button className="primary-button" onClick={()=>setToast('Your little wins are saved ♡')}><Heart size={15}/> Done for today</button></div></article><aside className="tracker-aside"><article className="panel progress-panel"><h3>{selectedDate===today?'Today’s progress':'Selected day’s progress'}</h3><ProgressRing value={Math.round(HABITS.filter(h=>selectedEntry.habits[h.id]).length/6*100)}/><b>{HABITS.filter(h=>selectedEntry.habits[h.id]).length===6?'You showed up for yourself!':HABITS.every(h=>!selectedEntry.habits[h.id])?'A fresh page starts here.':'Every little win counts.'}</b><small>{HABITS.filter(h=>selectedEntry.habits[h.id]).length} of 6 habits completed</small><Sticker name="cat-side.png" className="progress-cat"/></article><div className="soft-reminder"><span>💗</span><div><b>A gentle reminder</b><p>You don’t need a perfect day to make progress. Pick up where you are.</p></div></div></aside></div>


  const WeeklyReports = () => <div className="page-stack"><section className="stats-grid three-stats"><StatCard label="Habits completed" value={completedCount} helper="Across the challenge" sticker="ic-target.png" tint="lilac"/><StatCard label="Overall completion" value={`${overallPercent}%`} helper="All check-ins combined" sticker="ic-fire.png" tint="pink"/><StatCard label="Best week" value={`${Math.max(...weeklyData.map(w=>w.percent))}%`} helper="Your highest weekly score" sticker="ic-trophy.png" tint="peach"/></section><article className="panel report-panel"><div className="panel-heading"><div><h3>Weekly consistency 🌷</h3><p>Little habits, adding up over time.</p></div><TrendingUp size={20}/></div><div className="report-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={weeklyData} margin={{top:12,right:12,left:-18,bottom:0}}><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#f4e8ee"/><XAxis dataKey="week" tick={{fontSize:11,fill:'#aa91a2'}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fontSize:11,fill:'#aa91a2'}} tickFormatter={v=>`${v}%`} axisLine={false} tickLine={false}/><Tooltip formatter={v=>[`${v}%`,'Completion']} contentStyle={{borderRadius:14,border:'1px solid #f3dfeb'}}/><Bar dataKey="percent" fill="#c7a9d9" radius={[9,9,3,3]} maxBarSize={48}/></BarChart></ResponsiveContainer></div></article><div className="week-grid">{weeklyData.map((w,i)=><article className="panel week-card" key={w.week}><div><small>{w.week}</small><strong>{w.percent}%</strong></div><span>✿</span><div className="week-track"><i style={{width:`${w.percent}%`}}/></div><p>{w.done} habits checked · {allDates.slice(i*7,i*7+7).length} days</p></article>)}</div><div className="soft-reminder"><span>🌼</span><div><b>How to read this</b><p>A lower score is information, not a judgement. Use it to make next week a little easier.</p></div></div></div>

  const CalendarView = () => <article className="panel calendar-panel"><div className="panel-heading"><div><h3>Your 45-day calendar 🗓️</h3><p>Tap a day to open its check-in.</p></div><Sticker name="ic-calendar.png" className="calendar-heading-sticker"/></div><div className="calendar-grid">{allDates.map((date,i)=>{const done=HABITS.filter(h=>data.entries[date]?.habits?.[h.id]).length;const future=date>today;return <button key={date} disabled={future} onClick={()=>{setSelectedDate(date);changeTab('Daily tracker')}} className={`calendar-day ${done===6?'complete':done>0?'partial':''} ${selectedDate===date?'selected':''} ${future?'future':''}`}><small>DAY {i+1}</small><b>{dateAt(date).getDate()}</b><span>{done}/6</span>{done===6&&<i>♡</i>}</button>})}</div><div className="calendar-legend"><span><i className="legend-dot complete-dot"/> All habits</span><span><i className="legend-dot partial-dot"/> Some habits</span><span><i className="legend-dot"/> Not checked in</span></div></article>

  const SettingsView = () => <div className="settings-grid"><article className="panel"><div className="panel-heading"><div><h3>Challenge settings</h3><p>Make this journey yours.</p></div><Settings size={19}/></div><label className="field-label" htmlFor="start-date">Challenge start date</label><input id="start-date" type="date" className="date-input" value={data.startDate} onChange={e=>{setData(prev=>({...prev,startDate:e.target.value}));setSelectedDate(e.target.value);setToast('Start date updated ♡')}}/><div className="challenge-window"><b>Your 45-day window</b><span>{formatDate(data.startDate,{day:'numeric',month:'long',year:'numeric'})} – {formatDate(addDays(data.startDate,44),{day:'numeric',month:'long',year:'numeric'})}</span></div></article><article className="panel"><div className="panel-heading"><div><h3>Your data</h3><p>Your entries stay in this browser.</p></div><Download size={19}/></div><p className="settings-copy">Level Up 45 saves your check-ins in this browser. Download a backup if you want to keep a copy or move your progress to another device.</p><button className="secondary-button full-button" onClick={()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='level-up-45-backup.json';a.click();URL.revokeObjectURL(url);setToast('Backup downloaded ♡')}}><Download size={15}/> Download my backup</button><label className="secondary-button full-button restore-button"><Plus size={15}/> Restore backup<input type="file" accept="application/json" hidden onChange={e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);if(!parsed.startDate||!parsed.entries)throw new Error();setData({startDate:parsed.startDate,entries:parsed.entries,settings:parsed.settings||{}});setToast('Backup restored ♡')}catch{setToast('That backup file is not valid')}};reader.readAsText(file);e.target.value=''}}/></label><button className="danger-button full-button" onClick={()=>{if(confirm('Reset all Level Up 45 data? This cannot be undone unless you have a backup.')){setData({startDate:today,entries:{},settings:{}});setSelectedDate(today);setToast('A fresh start ♡')}}}><RotateCcw size={15}/> Reset all progress</button></article></div>

  return <div className="app-shell"><Sidebar/><main className="main-area"><Header/><div className="content-area">{activeTab==='Overview'&&<Overview/>}{activeTab==='Daily tracker'&&<DailyTracker/>}{activeTab==='Weekly reports'&&<WeeklyReports/>}{activeTab==='45-day calendar'&&<CalendarView/>}{activeTab==='Settings'&&<SettingsView/>}<footer>
  made with a little love · Level Up 45 <span>♡</span>
  <br />
  by <b>SHIVANI</b> · <a href="mailto:youremail@gmail.com">shivaniksshivani25@gmail.com</a>
</footer></div></main>{toast&&<div className="toast"><Check size={15}/>{toast}</div>}</div>

}
