import { setActivePinia, createPinia } from 'pinia'
import { useTimerStore } from './timer'

describe('Timer Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize a timer', () => {
    const timerStore = useTimerStore()
    timerStore.initializeTimer('card-1')
    
    expect(timerStore.timers['card-1']).toBeDefined()
    expect(timerStore.timers['card-1'].cardId).toBe('card-1')
    expect(timerStore.timers['card-1'].duration).toBe(0)
  })

  it('should start a timer', () => {
    const timerStore = useTimerStore()
    timerStore.startTimer('card-1')
    
    expect(timerStore.activeTimers['card-1']).toBeDefined()
    expect(timerStore.timers['card-1'].startTime).toBeInstanceOf(Date)
    expect(timerStore.timers['card-1'].running).toBe(true)
  })

  it('should pause a running timer', () => {
    const timerStore = useTimerStore()
    timerStore.startTimer('card-1')
    timerStore.pauseTimer('card-1')
    
    expect(timerStore.pausedTimers['card-1']).toBeDefined()
    expect(timerStore.timers['card-1'].pausedTime).toBeInstanceOf(Date)
    expect(timerStore.timers['card-1'].duration).toBeGreaterThan(0)
  })

  it('should resume a paused timer', () => {
    const timerStore = useTimerStore()
    timerStore.startTimer('card-1')
    timerStore.pauseTimer('card-1')
    timerStore.resumeTimer('card-1')
    
    expect(timerStore.activeTimers['card-1']).toBeDefined()
    expect(timerStore.timers['card-1'].pausedTime).toBeNull()
  })

  it('should stop a timer and add to history', () => {
    const timerStore = useTimerStore()
    timerStore.startTimer('card-1')
    
    // Wait a bit to ensure duration is calculated
    setTimeout(() => {
      timerStore.stopTimer('card-1')
      
      expect(timerStore.timers['card-1'].endTime).toBeInstanceOf(Date)
      expect(timerStore.timers['card-1'].history.length).toBe(1)
      expect(timerStore.timers['card-1'].history[0].duration).toBeGreaterThan(0)
    }, 100)
  })

  it('should format duration correctly', () => {
    const timerStore = useTimerStore()
    
    expect(timerStore.formatDuration(0)).toBe('00:00:00')
    expect(timerStore.formatDuration(60)).toBe('00:01:00')
    expect(timerStore.formatDuration(3661)).toBe('01:01:01')
  })

  it('should get timer info', () => {
    const timerStore = useTimerStore()
    timerStore.startTimer('card-1')
    
    const timerInfo = timerStore.getTimerInfo('card-1')
    
    expect(timerInfo).toBeDefined()
    expect(timerInfo.running).toBe(true)
    expect(timerInfo.paused).toBe(false)
    expect(timerInfo.formattedTime).toMatch(/\d{2}:\d{2}:\d{2}/)
  })
})