# Timer Feature Updates

## New Behavior: Explicit Timer Addition

### Previous Behavior
- Timer section automatically appeared when cards were in "In Progress" column
- Users could immediately start/stop timers without explicit setup

### New Behavior
- Cards in "In Progress" column show an "Add Timer" button
- Users must explicitly add timer functionality to a card
- Once added, timer persists with the card across all columns
- Timer controls only available when card is in "In Progress" column

## User Flow

### 1. Adding Timer to a Card
1. Move card to "In Progress" column
2. Click "⏱️ Add Timer" button
3. Timer structure is initialized for the card
4. "Start Timer" button appears

### 2. Using the Timer
1. Click "Start Timer" to begin tracking time
2. Timer shows elapsed time, start time, and current time
3. Click "Stop" to end timer session
4. Completed timer info shows duration and time range

### 3. Timer Across Columns
- **In Progress**: Full timer controls (start/stop/continue)
- **To Do/Done**: Timer info visible but read-only
- **No Timer Added**: Only "Add Timer" button visible in In Progress

## Implementation Details

### Component Changes

#### Template Changes
```vue
<!-- Add Timer button for In Progress cards without timer -->
<div v-if="props.isInProgress && !hasTimerData" class="card__add-timer">
  <button class="add-timer-btn" type="button" @click.stop="addTimerToCard">
    ⏱️ Add Timer
  </button>
</div>
```

#### Script Changes
```javascript
function addTimerToCard() {
  // Initialize timer data structure for this card
  const updates = {
    timerData: {
      startTime: null,
      startTimeFormatted: null,
      endTime: null,
      endTimeFormatted: null,
      duration: 0,
      durationFormatted: '00:00:00'
    }
  };
  emit('update-card', props.card.id, updates);
}
```

#### Style Changes
```css
.card__add-timer {
  padding: 12px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  margin-top: 8px;
  text-align: center;
}

.add-timer-btn {
  background: #f1f5f9;
  color: #64748b;
}
```

## Benefits

1. **Explicit Intent**: Users consciously decide which tasks need time tracking
2. **Cleaner Interface**: Cards without timers don't show timer-related UI
3. **Flexible Tracking**: Only track time for tasks that actually need it
4. **Persistent Data**: Timer history stays with card regardless of column
5. **Clear Workflow**: Separates "task exists" from "task needs time tracking"

## Edge Cases Handled

- **Card moved before timer added**: Timer structure persists, controls appear when moved back to In Progress
- **Timer added but not started**: Shows "Start Timer" button when in In Progress
- **Completed timer in other columns**: Shows read-only timer info with duration and time range
- **Active timer moved out**: Timer continues running but cannot be stopped until moved back

## Data Structure

Timer data is stored in the card object:
```javascript
{
  timerData: {
    startTime: timestamp|null,
    startTimeFormatted: string|null,
    endTime: timestamp|null,
    endTimeFormatted: string|null,
    duration: number, // in seconds
    durationFormatted: string // "HH:MM:SS"
  }
}
```