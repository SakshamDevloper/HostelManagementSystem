import { useState, useEffect, useRef } from 'react'
import { Sun, Sunrise, Moon, UtensilsCrossed, CalendarDays } from 'lucide-react'
import { useSocket } from '../context/SocketContext'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { getMenu, getWeekMenu } from '../services/messMenuService'

const mealIcons = { Breakfast: Sunrise, Lunch: Sun, Dinner: Moon }
const mealColors = { Breakfast: 'bg-amber-50 border-amber-200', Lunch: 'bg-orange-50 border-orange-200', Dinner: 'bg-indigo-50 border-indigo-200' }
const mealBadge = { Breakfast: 'badge-warning', Lunch: 'badge-success', Dinner: 'badge-info' }

function todayString() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function toLocalDateString(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function getWeekDates(startDate) {
  const dates = []
  const start = new Date(startDate + 'T00:00:00')
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    dates.push(toLocalDateString(d))
  }
  return dates
}

function groupByDate(menu) {
  const grouped = {}
  menu.forEach(entry => {
    const key = entry.date.split('T')[0]
    if (!grouped[key]) grouped[key] = {}
    grouped[key][entry.meal] = entry
  })
  return grouped
}

export default function MessMenuPage() {
  const { socket } = useSocket()
  const [activeMess, setActiveMess] = useState('South')
  const [showBoth, setShowBoth] = useState(false)
  const [view, setView] = useState('week')
  const [todayMenu, setTodayMenu] = useState({ South: {}, North: {} })
  const [weekMenu, setWeekMenu] = useState({ South: {}, North: {} })
  const [weekStart, setWeekStart] = useState(todayString())
  const [loading, setLoading] = useState(true)
  const fetchingRef = useRef(false)

  const fetchToday = async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const today = todayString()
      const messes = showBoth ? ['North', 'South'] : [activeMess]
      const results = await Promise.all(
        messes.map(m => getMenu({ mess: m, date: today }).then(r => ({ mess: m, data: r.data.data })))
      )
      const obj = {}
      results.forEach(r => { obj[r.mess] = groupByDate(r.data)[today] || {} })
      setTodayMenu(prev => ({ ...prev, ...obj }))
    } catch { toast.error('Failed to load today\'s menu') }
    finally { fetchingRef.current = false; setLoading(false) }
  }

  const fetchWeek = async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const messes = showBoth ? ['North', 'South'] : [activeMess]
      const results = await Promise.all(
        messes.map(m => getWeekMenu({ mess: m, startDate: weekStart }).then(r => ({ mess: m, data: r.data.data })))
      )
      const obj = {}
      results.forEach(r => { obj[r.mess] = groupByDate(r.data) })
      setWeekMenu(prev => ({ ...prev, ...obj }))
    } catch { toast.error('Failed to load week menu') }
    finally { fetchingRef.current = false; setLoading(false) }
  }

  useEffect(() => {
    if (view === 'today') fetchToday()
    else fetchWeek()
  }, [view, activeMess, showBoth, weekStart])

  useEffect(() => {
    if (!socket) return
    const refresh = () => {
      if (view === 'today') fetchToday()
      else fetchWeek()
    }
    socket.on('mess-menu-updated', refresh)
    return () => { socket.off('mess-menu-updated', refresh) }
  }, [socket, view])

  const messList = showBoth ? ['North', 'South'] : [activeMess]
  const currentMenu = view === 'today' ? todayMenu : weekMenu

  const renderMealCard = (entry, meal) => {
    if (!entry) return null
    const Icon = mealIcons[meal] || UtensilsCrossed
    return (
      <div key={meal} className={`card border ${mealColors[meal] || 'bg-base-100 border-base-300'} shadow-sm`}>
        <div className="card-body p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon size={16} className="text-base-content/60" />
            <h3 className="font-semibold text-sm capitalize">{meal}</h3>
            <span className={`badge badge-xs ${mealBadge[meal] || 'badge-ghost'} ml-auto`}>{meal}</span>
          </div>
          <ul className="space-y-1">
            {entry.items?.map((item, i) => (
              <li key={i} className="text-sm text-base-content/80 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-base-content/30 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          {entry.notes && (
            <p className="text-xs text-warning mt-2 italic">{entry.notes}</p>
          )}
        </div>
      </div>
    )
  }

  const meals = ['Breakfast', 'Lunch', 'Dinner']

  if (loading) return <LoadingSpinner fullScreen={false} />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <UtensilsCrossed size={22} /> Mess Menu
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="join">
            <button onClick={() => { setShowBoth(false); setActiveMess('South') }} className={`join-item btn btn-xs ${!showBoth && activeMess === 'South' ? 'btn-primary' : 'btn-ghost'}`}>
              South Mess
            </button>
            <button onClick={() => { setShowBoth(false); setActiveMess('North') }} className={`join-item btn btn-xs ${!showBoth && activeMess === 'North' ? 'btn-primary' : 'btn-ghost'}`}>
              North Mess
            </button>
            <button onClick={() => setShowBoth(true)} className={`join-item btn btn-xs ${showBoth ? 'btn-primary' : 'btn-ghost'}`}>
              Both
            </button>
          </div>
          <div className="join">
            <button onClick={() => setView('today')} className={`join-item btn btn-xs ${view === 'today' ? 'btn-primary' : 'btn-ghost'}`}>
              Today
            </button>
            <button onClick={() => setView('week')} className={`join-item btn btn-xs ${view === 'week' ? 'btn-primary' : 'btn-ghost'}`}>
              <CalendarDays size={14} /> Week
            </button>
          </div>
        </div>
      </div>

      {view === 'today' ? (
        messList.map(mess => {
          const menu = todayMenu[mess]
          const hasMeals = menu && Object.keys(menu).length > 0
          return (
            <div key={mess}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${mess === 'South' ? 'bg-error' : 'bg-primary'}`} />
                {mess} Mess
              </h2>
              {hasMeals ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {meals.map(meal => renderMealCard(menu[meal], meal))}
                </div>
              ) : (
                <EmptyState title="No menu for today" message="Check back later or switch to weekly view." />
              )}
            </div>
          )
        })
      ) : (
        messList.map(mess => {
          const dates = getWeekDates(weekStart)
          const grouped = weekMenu[mess] || {}
          return (
            <div key={mess}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${mess === 'South' ? 'bg-error' : 'bg-primary'}`} />
                {mess} Mess — Week View
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => {
                    const d = new Date(weekStart + 'T00:00:00')
                    d.setDate(d.getDate() - 7)
                    setWeekStart(toLocalDateString(d))
                  }}
                  className="btn btn-ghost btn-xs"
                >
                  ← Prev Week
                </button>
                <span className="text-xs text-base-content/60 self-center">{formatDate(dates[0])} — {formatDate(dates[6])}</span>
                <button
                  onClick={() => {
                    const d = new Date(weekStart + 'T00:00:00')
                    d.setDate(d.getDate() + 7)
                    setWeekStart(toLocalDateString(d))
                  }}
                  className="btn btn-ghost btn-xs"
                >
                  Next Week →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-zebra table-xs w-full">
                  <thead>
                    <tr>
                      <th className="text-xs">Date</th>
                      <th className="text-xs">Breakfast</th>
                      <th className="text-xs">Lunch</th>
                      <th className="text-xs">Dinner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dates.map(date => {
                      const dayGroup = grouped[date] || {}
                      const isToday = date === todayString()
                      return (
                        <tr key={date} className={isToday ? 'bg-primary/5 font-medium' : ''}>
                          <td className="text-xs whitespace-nowrap">
                            {formatDate(date)}
                            {isToday && <span className="badge badge-xs badge-primary ml-1">Today</span>}
                          </td>
                          {meals.map(meal => (
                            <td key={meal} className="text-xs align-top">
                              {dayGroup[meal] ? (
                                <ul className="list-disc list-inside space-y-0.5">
                                  {dayGroup[meal].items?.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                  {dayGroup[meal].notes && (
                                    <li className="text-warning italic text-[10px]">{dayGroup[meal].notes}</li>
                                  )}
                                </ul>
                              ) : (
                                <span className="text-base-content/30 italic">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
