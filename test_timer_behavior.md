# Timer Behavior Test Cases

## Expected Behavior After Changes:

### 1. Cards in "In Progress" Column
- **New cards**: Should show timer controls (Start Timer button)
- **Cards with active timer**: Should show running timer with Stop button
- **Cards with completed timer**: Should show Continue Timer button and timer info

### 2. Cards in "To Do" or "Done" Columns
- **Cards with no timer data**: Should NOT show timer section
- **Cards with completed timer data**: Should show timer info in read-only mode (no controls)
- **Cards with active timer**: Should show running timer but NO controls (timer continues but cannot be stopped)

### 3. Moving Cards Between Columns
- **From In Progress to To Do/Done**: Timer info should remain visible but controls disappear
- **From To Do/Done to In Progress**: Timer controls should reappear if timer data exists
- **Active timer when moved out**: Timer should continue running but cannot be stopped until moved back

## Implementation Details:

1. **Timer Section Visibility**: `v-if="props.isInProgress || hasTimerData"`
   - Shows timer section if card is in In Progress column OR has any timer data

2. **Timer Controls Visibility**: `v-if="props.isInProgress"`
   - Start/Stop buttons only visible when card is in In Progress column

3. **Read-only Timer Display**: `.timer-readonly` class
   - Applied to completed timer info when not in In Progress column
   - Reduces opacity and adds border to indicate read-only state

4. **Computed Property**: `hasTimerData`
   - Returns true if card has completed timer data OR active timer
   - `return (props.card.timerData && props.card.timerData.duration) || activeTimers.value[props.card.id]`