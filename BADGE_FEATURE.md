# Badge Notifications Feature

## Overview
The app now supports home-screen badge notifications that show the count of incomplete items in your shopping list.

## Features Implemented

### ✅ Real-time Badge Updates
- Badge count updates automatically when items are added, removed, or completed
- Shows number of uncompleted items
- Clears when all items are completed

### ✅ Cross-Platform Support

**iOS (Safari 17+)**
- Native badge support via Badging API
- Shows badge on home screen icon when installed as PWA
- Badge persists across sessions

**Android (Chrome, Edge)**
- Badge support via Badging API
- Optional notification-based badges for older devices
- Requires notification permission for full functionality

**Desktop (Chrome, Edge, Opera)**
- Badge shows on taskbar/dock icon
- Updates in real-time

### ✅ Fallback Support
1. **Badging API** (primary) - Native badge on app icon
2. **Service Worker Messages** - For background updates
3. **Document Title** - Shows count in browser tab: `(3) רשימת קניות`
4. **LocalStorage** - Persists badge count across sessions

## How It Works

### Badge Update Flow
```
User adds item → Items state updates → useEffect triggers → Badge API called → Icon updates
```

### Code Location
- **Main Logic**: `App.tsx` (lines ~112-160)
- **Service Worker**: `public/sw.js`
- **PWA Manifest**: `public/manifest.json`
- **SW Registration**: `app/ServiceWorkerRegistration.tsx`

## Installation Instructions

### For Users

**iOS:**
1. Open app in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Badge will show uncompleted item count

**Android:**
1. Open app in Chrome
2. Tap menu (⋮)
3. Tap "Install app" or "Add to Home Screen"
4. Optional: Grant notification permission for enhanced badge support

**Desktop:**
1. Open app in Chrome/Edge
2. Click install icon in address bar
3. Badge will show in taskbar

## API Support

| Platform | Badge Support | Method |
|----------|---------------|--------|
| iOS 17+ Safari | ✅ Native | Badging API |
| iOS < 17 | ❌ Title only | Document title |
| Android Chrome 109+ | ✅ Native | Badging API |
| Android < 109 | ⚠️ Notifications | Service Worker |
| Chrome/Edge Desktop | ✅ Native | Badging API |
| Firefox | ❌ Title only | Document title |

## Configuration

### Disable Badge on App Open
To clear the badge when user opens the app, uncomment lines in `App.tsx`:

```typescript
if (document.visibilityState === 'visible') {
  if ('clearAppBadge' in navigator) {
    (navigator as any).clearAppBadge();
  }
}
```

### Customize Badge Behavior
Edit the badge logic in `App.tsx`:

```typescript
const activeCount = items.filter(i => !i.isCompleted).length;
// Change this filter to customize what counts toward the badge
```

## Testing

### Test Badge Updates
1. Install app as PWA
2. Add items to list
3. Badge should show count immediately
4. Complete items
5. Badge should decrease
6. Complete all items
7. Badge should clear

### Browser Console Testing
```javascript
// Check badge support
console.log('Badge API:', 'setAppBadge' in navigator);

// Manual badge set (requires user interaction)
navigator.setAppBadge(5);

// Clear badge
navigator.clearAppBadge();
```

## Troubleshooting

**Badge not showing:**
- Ensure app is installed as PWA (not just bookmarked)
- Check browser supports Badging API
- Verify items are in state correctly

**Android badge not working:**
- Grant notification permission
- Check Chrome version (109+)
- Try reinstalling PWA

**iOS badge not showing:**
- Requires iOS 17+
- Must be added via Safari
- Check PWA is installed (not web clip)

## Future Enhancements
- [ ] Different badge colors for priority items
- [ ] Custom badge shapes
- [ ] Badge animation on updates
- [ ] Sync badge across devices
- [ ] Badge for shared lists (show total across all users)

## Notes
- Badge persists even when app is closed
- Badge updates require app to be running in background (via Service Worker)
- iOS has stricter background limits than Android
- Desktop badges are most reliable

## Icon Replacement
Replace placeholder icons with actual PNG files:
- `public/icon-192.png` (192x192)
- `public/icon-512.png` (512x512)

Use tools like [Real Favicon Generator](https://realfavicongenerator.net/) to create proper icons.
