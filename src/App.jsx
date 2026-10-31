import { useEffect, useMemo, useState } from 'react'
import {
  Activity, BookOpen, Brain, CalendarDays, Check, ChevronLeft, ChevronRight,
  CircleHelp, Cloud, Dumbbell, Flame, GraduationCap, Heart, LayoutDashboard,
  Menu, Moon, Plus, RotateCcw, Save, Settings, Sparkles, Target, TrendingUp,
  Trophy, X
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  BarChart, Bar
} from 'recharts'

const STORAGE_KEY = 'level-up-45-v1'
const HABITS = [
  { id: 'movement', label: 'Gym / planned movement', group: 'Fitness', icon: Dumbbell },
  { id: 'balancedMeals', label: 'Balanced meals', group: 'Fitness', icon: Heart },
  { id: 'placement', label: 'Placement preparation', group: 'Career', icon: GraduationCap },
  { id: 'cloudAI', label: 'Cloud + Generative AI learning', group: 'Skills', icon: Cloud },
  { id: 'personal', label: 'Personal development', group: 'Growth', icon: Brain },
  { id: 'sleep', label: 'Adequate sleep', group: 'Wellbeing', icon: Moon },
]

const todayISO = () => {
  const d = new Date()
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}
const dateAt = (iso) => new Date(`${iso}T12:00:00`)
const addDays = (iso, n) => {
  const d = dateAt(iso)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const formatDate = (iso, options = { day: 'numeric', month: 'short' }) =>
  dateAt(iso).toLocaleDateString('en-IN', options)
const emptyDay = () => ({ habits: {}, note: '' })

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved) return {
      startDate: saved.startDate || todayISO(),
      entries: saved.entries || {},
      settings: saved.settings || {},
    }
  } catch {}
  return { startDate: todayISO(), entries: {}, settings: {} }
}

function StatCard({ label, value, helper, icon: Icon, tint = 'purple' }) {
  return <div className="stat-card">
    <div className={`stat-icon ${tint}`}><Icon size={19} /></div>
    <div className="min-w-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{helper}</p>
    </div>
  </div>
}

function ProgressRing({ value }) {
  const safe = Math.max(0, Math.min(100, value))
  return <div className="progress-ring" style={{ '--progress': `${safe * 3.6}deg` }}>
    <div className="progress-ring-inner">
      <span className="text-3xl font-bold text-slate-800">{Math.round(safe)}%</span>
      <span className="text-xs text-slate-400">complete</span>
    </div>
  </div>
}

export default function App() {
  const [data, setData] = useState(loadData)
  const [activeTab, setActiveTab] = useState('Overview')
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [mobileMenu, setMobileMenu] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(timer)
  }, [toast])

  const dayNumber = Math.floor((dateAt(todayISO()) - dateAt(data.startDate)) / 86400000) + 1
  const currentDay = Math.max(1, Math.min(45, dayNumber))
  const challengeProgress = Math.max(0, Math.min(100, (currentDay / 45) * 100))
  const todayEntry = data.entries[selectedDate] || emptyDay()
  const completedToday = HABITS.filter(h => todayEntry.habits[h.id]).length
  const todayPercent = Math.round((completedToday / HABITS.length) * 100)

  const allDates = useMemo(() => Array.from({ length: 45 }, (_, i) => addDays(data.startDate, i)), [data.startDate])
  const completedCount = allDates.reduce((sum, date) =>
    sum + HABITS.filter(h => data.entries[date]?.habits?.[h.id]).length, 0)
  const totalPossible = allDates.length * HABITS.length
  const overallPercent = totalPossible ? Math.round(completedCount / totalPossible * 100) : 0

  const weeklyData = useMemo(() => Array.from({ length: 7 }, (_, week) => {
    const dates = allDates.slice(week * 7, week * 7 + 7)
    const done = dates.reduce((sum, date) => sum + HABITS.filter(h => data.entries[date]?.habits?.[h.id]).length, 0)
    const possible = dates.length * HABITS.length
    return { week: `Week ${week + 1}`, percent: possible ? Math.round(done / possible * 100) : 0, done }
  }), [allDates, data.entries])

  const trendData = useMemo(() => allDates.map((date, index) => {
    const done = HABITS.filter(h => data.entries[date]?.habits?.[h.id]).length
    return { day: `D${index + 1}`, progress: Math.round(done / HABITS.length * 100) }
  }), [allDates, data.entries])

  const streak = useMemo(() => {
    let count = 0
    let cursor = todayISO()
    if (cursor > addDays(data.startDate, 44)) cursor = addDays(data.startDate, 44)
    while (cursor >= data.startDate) {
      const entry = data.entries[cursor]
      if (!entry || !HABITS.some(h => entry.habits?.[h.id])) break
      count++
      cursor = addDays(cursor, -1)
    }
    return count
  }, [data.entries, data.startDate])

  const updateEntry = (date, updater) => setData(prev => {
    const oldEntry = prev.entries[date] || emptyDay()
    return { ...prev, entries: { ...prev.entries, [date]: updater(oldEntry) } }
  })

  const toggleHabit = (habitId) => {
    updateEntry(selectedDate, old => ({
      ...old, habits: { ...old.habits, [habitId]: !old.habits[habitId] }
    }))
  }

  const changeTab = (tab) => {
    setActiveTab(tab)
    setMobileMenu(false)
  }

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Daily tracker', icon: Check },
    { name: 'Weekly reports', icon: TrendingUp },
    { name: '45-day calendar', icon: CalendarDays },
    { name: 'Settings', icon: Settings },
  ]

  const Sidebar = () => <aside className={`${mobileMenu ? 'mobile-sidebar open' : 'mobile-sidebar'} sidebar`}>
    <div className="flex items-center justify-between px-5 pt-6">
      <div className="flex items-center gap-3">
        <div className="brand-mark"><Sparkles size={20} /></div>
        <div>
          <p className="font-bold tracking-tight text-slate-800">Level Up 45</p>
          <p className="text-xs text-slate-400">your gentle reset</p>
        </div>
      </div>
      <button className="icon-button md:hidden" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={19}/></button>
    </div>
    <div className="mx-5 mt-8 rounded-2xl bg-lavender-50 p-4">
      <div className="flex items-center gap-2 text-lavender-700"><Flame size={16}/><span className="text-xs font-semibold">YOUR 45-DAY JOURNEY</span></div>
      <p className="mt-2 text-2xl font-bold text-slate-800">Day {currentDay}<span className="text-sm font-medium text-slate-400"> / 45</span></p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-lavender-500 transition-all" style={{ width: `${challengeProgress}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-400">{Math.max(0, 45 - currentDay)} days left in your challenge</p>
    </div>
    <nav className="mt-7 space-y-1 px-3">
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
      {navItems.map(({ name, icon: Icon }) => <button key={name} onClick={() => changeTab(name)}
        className={`nav-item ${activeTab === name ? 'active' : ''}`}>
        <Icon size={18}/><span>{name}</span>
        {activeTab === name && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-lavender-600"/>}
      </button>)}
    </nav>
    <div className="mt-auto p-5">
      <div className="rounded-2xl border border-lavender-100 bg-white p-4">
        <div className="flex items-center gap-2 text-lavender-700"><Heart size={16}/><span className="text-xs font-semibold">A LITTLE REMINDER</span></div>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">Progress, not perfection. A missed day doesn't erase your effort.</p>
      </div>
      <p className="mt-5 text-center text-[11px] text-slate-300">Made for your next chapter ✨</p>
    </div>
  </aside>

  const Header = () => <header className="topbar">
    <div className="flex items-center gap-3">
      <button className="icon-button md:hidden" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={20}/></button>
      <div>
        <p className="text-xs text-slate-400">{formatDate(todayISO(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">{activeTab === 'Overview' ? 'Your progress at a glance' : activeTab}</h1>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-slate-500 sm:block">One day at a time</span>
      <div className="avatar">45</div>
    </div>
  </header>

  
  const Overview = () => (
    <div className="space-y-6">

      {/* HERO SECTION */}
      <section className="hero-card dashboard-hero">
        <div className="hero-copy">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-lavender-700">
            <Sparkles size={14} /> YOUR 45-DAY RESET
          </span>

          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-800 sm:text-4xl">
            Small steps.
            <br />
            <span className="text-lavender-700">Big changes.</span>
          </h2>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            A little progress in fitness, career and personal growth adds up.
            Keep showing up in ways that feel doable.
          </p>

          <button
            className="primary-button mt-5"
            onClick={() => changeTab('Daily tracker')}
          >
            Track today <ChevronRight size={17} />
          </button>
        </div>

        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />

        <img
          src="/hero-girl-sticker.png"
          alt="Cute 3D girl mascot studying with her laptop"
          className="hero-3d-mascot"
        />
      </section>

      {/* SUMMARY CARDS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Challenge day"
          value={`${currentDay} / 45`}
          helper={`${Math.max(0, 45 - currentDay)} days to go`}
          icon={CalendarDays}
        />

        <StatCard
          label="Today's progress"
          value={`${todayPercent}%`}
          helper={`${completedToday} of ${HABITS.length} habits checked`}
          icon={Target}
          tint="pink"
        />

        <StatCard
          label="Current streak"
          value={`${streak} days`}
          helper="Keep your own pace"
          icon={Flame}
          tint="peach"
        />

        <StatCard
          label="Overall completion"
          value={`${overallPercent}%`}
          helper="Across all 45 days"
          icon={Trophy}
          tint="blue"
        />
      </section>

      {/* LOWER DASHBOARD */}
      <section className="grid gap-5 xl:grid-cols-[1.1fr_1fr_0.8fr]">

        {/* TODAY'S TASKS */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Today's tasks</h3>
              <p>Small wins for today ✨</p>
            </div>
            <button
              className="text-link"
              onClick={() => changeTab('Daily tracker')}
            >
              View all <ChevronRight size={15} />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {HABITS.map(({ id, label, group, icon: Icon }) => {
              const isDone = Boolean(data.entries[todayISO()]?.habits?.[id])

              return (
                <button
                  key={id}
                  onClick={() => toggleHabitForToday(id)}
                  className="habit-row"
                >
                  <span className={`habit-icon ${group.toLowerCase()}`}>
                    <Icon size={17} />
                  </span>

                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-semibold text-slate-700">
                      {label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {group}
                    </span>
                  </span>

                  <span className={`check-circle ${isDone ? 'checked' : ''}`}>
                    {isDone && <Check size={14} />}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* WEEKLY PROGRESS */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Weekly progress</h3>
              <p>Your daily consistency</p>
            </div>
            <TrendingUp size={20} className="text-lavender-500" />
          </div>

          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendData.slice(0, 7)}
                margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0e8f2"
                />

                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: '#9b8da2' }}
                />

                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#9b8da2' }}
                  tickFormatter={value => `${value}%`}
                />

                <Tooltip
                  formatter={value => [`${value}%`, 'Progress']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #eee0ef'
                  }}
                />

                <Bar
                  dataKey="progress"
                  fill="#b394d0"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={35}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-400">
            Your first seven challenge days at a glance.
          </p>
        </div>

        {/* QUICK NOTE */}
        <div className="panel quick-note-panel">
          <div className="panel-heading">
            <div>
              <h3>Quick note</h3>
              <p>A little reminder for you</p>
            </div>
            <BookOpen size={20} className="text-lavender-500" />
          </div>

          <div className="quick-note">
            <span className="text-3xl">💗</span>
            <p className="mt-3 text-lg font-bold leading-relaxed text-slate-700">
              A better me is always a work in progress.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Keep learning, keep growing and believe in your journey.
            </p>
            <div className="mt-4 text-right text-4xl">🐰</div>
          </div>
        </div>

      </section>
    </div>
  )


  function toggleHabitForToday(id) {
    setData(prev => {
      const date = todayISO()
      const entry = prev.entries[date] || emptyDay()
      return { ...prev, entries: { ...prev.entries, [date]: { ...entry, habits: { ...entry.habits, [id]: !entry.habits[id] } } } }
    })
  }

  const DailyTracker = () => <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
    <div className="panel">
      <div className="panel-heading"><div><h3>Daily check-in</h3><p>Check in with yourself. No pressure to do it all.</p></div><span className="rounded-full bg-lavender-50 px-3 py-1 text-xs font-semibold text-lavender-700">Day {Math.max(1, Math.min(45, Math.floor((dateAt(selectedDate)-dateAt(data.startDate))/86400000)+1))}</span></div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-slate-600" htmlFor="entry-date">Choose date</label>
        <input id="entry-date" className="date-input" type="date" min={data.startDate} max={addDays(data.startDate,44)} value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}/>
        <button className="text-link" onClick={()=>setSelectedDate(todayISO())}>Today</button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {HABITS.map(({ id, label, group, icon: Icon }) => <button key={id} onClick={()=>toggleHabit(id)} className={`tracker-card ${todayEntry.habits[id] ? 'done' : ''}`}>
          <div className="flex items-center justify-between"><span className={`habit-icon ${group.toLowerCase()}`}><Icon size={18}/></span><span className={`check-circle ${todayEntry.habits[id] ? 'checked' : ''}`}>{todayEntry.habits[id] && <Check size={14}/>}</span></div>
          <p className="mt-4 text-sm font-semibold text-slate-700">{label}</p>
          <p className="mt-1 text-xs text-slate-400">{group}</p>
        </button>)}
      </div>
      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="daily-note">A note to yourself <span className="font-normal text-slate-400">(optional)</span></label>
        <textarea id="daily-note" rows="3" className="note-input" placeholder="What went well today? Anything you want to remember?"
          value={todayEntry.note} onChange={e=>updateEntry(selectedDate, old=>({...old,note:e.target.value}))}/>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-400">Your check-ins save automatically on this device.</p>
        <button className="primary-button" onClick={()=>setToast('Your check-in is saved ✨')}><Save size={16}/> Done for today</button>
      </div>
    </div>
    <div className="space-y-5">
      <div className="panel flex flex-col items-center text-center">
        <h3 className="self-start text-base font-bold text-slate-800">Today's progress</h3>
        <ProgressRing value={todayPercent}/>
        <p className="mt-4 text-sm font-semibold text-slate-700">{completedToday === 6 ? 'You showed up for yourself!' : completedToday === 0 ? 'A fresh page starts here.' : 'Every little win counts.'}</p>
        <p className="mt-1 text-xs text-slate-400">{completedToday} of 6 habits completed</p>
      </div>
      <div className="soft-note"><Sparkles size={18}/><p><strong>Gentle reminder</strong><br/>You don't need a perfect day to make progress. Pick up where you are.</p></div>
    </div>
  </div>

  const WeeklyReports = () => <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Habits completed" value={completedCount} helper="Across the challenge" icon={Check}/>
      <StatCard label="Overall completion" value={`${overallPercent}%`} helper="All check-ins combined" icon={TrendingUp} tint="pink"/>
      <StatCard label="Best week" value={`${Math.max(...weeklyData.map(w=>w.percent))}%`} helper="Your highest weekly score" icon={Trophy} tint="peach"/>
    </div>
    <div className="panel">
      <div className="panel-heading"><div><h3>Weekly consistency</h3><p>Percentage of habits completed each week.</p></div><TrendingUp size={20} className="text-lavender-500"/></div>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0edf7"/>
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#858597' }}/>
            <YAxis domain={[0,100]} tick={{ fontSize: 11, fill: '#858597' }} tickFormatter={v=>`${v}%`}/>
            <Tooltip formatter={(v)=>[`${v}%`, 'Completion']} contentStyle={{ borderRadius: 12, border: '1px solid #eee8fb' }}/>
            <Bar dataKey="percent" fill="#9b83e8" radius={[8,8,0,0]} maxBarSize={48}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {weeklyData.map((week, i) => <div className="panel" key={week.week}>
        <div className="flex items-center justify-between"><div><p className="text-xs text-slate-400">{week.week}</p><p className="mt-1 text-xl font-bold text-slate-800">{week.percent}%</p></div><span className="rounded-xl bg-lavender-50 p-3 text-lavender-600"><CalendarDays size={19}/></span></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-lavender-500" style={{width:`${week.percent}%`}}/></div>
        <p className="mt-2 text-xs text-slate-400">{week.done} habits checked · {allDates.slice(i*7,i*7+7).length} days in this week</p>
      </div>)}
    </div>
    <div className="soft-note"><CircleHelp size={18}/><p><strong>How to read this</strong><br/>Weekly completion is based on the six daily habits. A lower score is information, not a judgement. Use it to make next week easier.</p></div>
  </div>

  const CalendarView = () => <div className="panel">
    <div className="panel-heading"><div><h3>Your 45-day calendar</h3><p>Tap any day to view or update its check-in.</p></div><CalendarDays size={20} className="text-lavender-500"/></div>
    <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-9">
      {allDates.map((date,i) => {
        const done = HABITS.filter(h=>data.entries[date]?.habits?.[h.id]).length
        const isSelected = selectedDate === date
        const isFuture = date > todayISO()
        return <button key={date} disabled={isFuture} onClick={()=>{setSelectedDate(date);changeTab('Daily tracker')}}
          className={`calendar-day ${done === 6 ? 'complete' : done > 0 ? 'partial' : ''} ${isSelected ? 'selected' : ''} ${isFuture ? 'future' : ''}`}>
          <span className="text-[10px] text-slate-400">DAY {i+1}</span>
          <span className="text-lg font-bold">{dateAt(date).getDate()}</span>
          <span className="text-[9px] text-slate-400">{done}/6 done</span>
        </button>
      })}
    </div>
    <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
      <span className="flex items-center gap-2"><i className="legend-dot complete-dot"/> All habits</span>
      <span className="flex items-center gap-2"><i className="legend-dot partial-dot"/> Some habits</span>
      <span className="flex items-center gap-2"><i className="legend-dot"/> Not checked in</span>
    </div>
  </div>

  const SettingsView = () => <div className="grid gap-5 lg:grid-cols-2">
    <div className="panel">
      <div className="panel-heading"><div><h3>Challenge settings</h3><p>Choose when your 45 days begin.</p></div><Settings size={20} className="text-lavender-500"/></div>
      <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="start-date">Challenge start date</label>
      <input id="start-date" type="date" className="date-input mt-2" value={data.startDate} onChange={e=>{setData(prev=>({...prev,startDate:e.target.value}));setSelectedDate(e.target.value);setToast('Start date updated')}}/>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">Changing the start date moves the 45-day calendar. Your saved entries remain attached to their original dates.</p>
      <div className="mt-6 rounded-2xl bg-lavender-50 p-4">
        <p className="text-sm font-semibold text-lavender-800">Your challenge window</p>
        <p className="mt-1 text-sm text-slate-600">{formatDate(data.startDate, {day:'numeric',month:'long',year:'numeric'})} – {formatDate(addDays(data.startDate,44), {day:'numeric',month:'long',year:'numeric'})}</p>
      </div>
    </div>
    <div className="panel">
      <div className="panel-heading"><div><h3>Your data</h3><p>Your entries stay in this browser.</p></div><Save size={20} className="text-lavender-500"/></div>
      <p className="mt-5 text-sm leading-relaxed text-slate-500">Level Up 45 uses your browser's LocalStorage. No account or server is needed. If you clear browser data or switch devices, your entries won't automatically move with you.</p>
      <button className="secondary-button mt-5 w-full" onClick={()=>{
        const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href=url; a.download='level-up-45-backup.json'; a.click(); URL.revokeObjectURL(url)
        setToast('Backup downloaded')
      }}>Download my backup</button>
      <label className="secondary-button mt-3 flex w-full cursor-pointer items-center justify-center gap-2">
        <Plus size={16}/> Restore backup
        <input className="hidden" type="file" accept="application/json" onChange={e=>{
          const file=e.target.files?.[0]; if(!file)return
          const reader=new FileReader()
          reader.onload=()=>{try{const parsed=JSON.parse(reader.result);if(!parsed.startDate||!parsed.entries)throw new Error();setData({startDate:parsed.startDate,entries:parsed.entries,settings:parsed.settings||{}});setToast('Backup restored')}catch{setToast('That backup file is not valid')}}
          reader.readAsText(file);e.target.value=''
        }}/>
      </label>
      <button className="danger-button mt-3 w-full" onClick={()=>{
        if(confirm('Reset all Level Up 45 data? This cannot be undone unless you have a backup.')){
          const fresh={startDate:todayISO(),entries:{},settings:{}}
          setData(fresh);setSelectedDate(todayISO());setToast('Your tracker has been reset')
        }
      }}><RotateCcw size={15}/> Reset all progress</button>
    </div>
  </div>

  return <div className="app-shell">
    <Sidebar/>
    {mobileMenu && <button className="mobile-scrim md:hidden" aria-label="Close menu" onClick={()=>setMobileMenu(false)}/>}
    <main className="main-area">
      <Header/>
      <div className="content-area">
        {activeTab === 'Overview' && <Overview/>}
        {activeTab === 'Daily tracker' && <DailyTracker/>}
        {activeTab === 'Weekly reports' && <WeeklyReports/>}
        {activeTab === '45-day calendar' && <CalendarView/>}
        {activeTab === 'Settings' && <SettingsView/>}
        <footer className="mt-10 pb-5 text-center text-xs text-slate-400">Level Up 45 · Progress, not perfection ✨</footer>
      </div>
    </main>
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>
}