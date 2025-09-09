# Offline Shell Testing Guide

This application now includes comprehensive offline functionality with service worker caching. Here's how to test it:

## Features Implemented

### ✅ Service Worker with SWR (Stale While Revalidate)
- **Dashboard Pages**: `/dashboard` and `/dashboard/*` use SWR caching
- **API GET Requests**: All `/api/*` GET requests use SWR caching  
- **Mutating Requests**: POST, PUT, DELETE, PATCH are never cached
- **Static Assets**: Cached with cache-first strategy
- **Images**: Cached with stale-while-revalidate strategy

### ✅ Offline Fallback
- **Offline Page**: `/offline.html` serves as fallback when offline
- **Connection Detection**: Automatic online/offline status detection
- **User Notifications**: Toast notifications for connection changes

### ✅ Caching Strategy Details
- **App Cache**: Stores HTML pages, dashboard, offline fallback
- **API Cache**: Stores GET API responses separately
- **Cache Versioning**: Automatic cleanup of old cache versions

## How to Test Offline Functionality

### 1. Production Build Testing
```bash
# Build and serve the production version
npm run build
npm start

# Or use a static server
npx serve .next/static
```

### 2. Browser DevTools Testing
1. Open Chrome/Edge DevTools (F12)
2. Go to **Application** tab → **Service Workers**
3. Verify service worker is registered for your origin
4. Go to **Network** tab
5. Check "Offline" checkbox to simulate offline mode
6. Navigate to `/dashboard` - should load from cache
7. Try API requests - should return cached data

### 3. Manual Network Disconnection
1. Visit the application online first (to populate caches)
2. Disconnect your network/WiFi
3. Navigate to `/dashboard` - should work offline
4. Try refreshing - should show cached content
5. Navigate to uncached pages - should show offline fallback

### 4. Testing Cache Invalidation
1. Visit `/dashboard` while online (populates cache)
2. Go offline
3. Visit `/dashboard` - should show cached version
4. Go back online
5. Refresh `/dashboard` - should fetch fresh content in background

### 5. API Caching Test
1. While online, load dashboard (triggers API calls)
2. Go offline in DevTools
3. Refresh page - API calls should return cached responses
4. POST/PUT/DELETE requests should fail (not cached)

## Expected Behaviors

### ✅ When Online
- Pages load fresh content
- API calls fetch latest data
- Background cache updates happen automatically
- Toast notification when connection is restored

### ✅ When Offline  
- Dashboard loads from cache
- API GET requests return cached data
- Uncached pages show `/offline.html`
- Toast notification about offline status
- Mutating operations fail gracefully

### ✅ Service Worker Features
- Automatic updates with user notification
- Cache versioning and cleanup
- Separate caches for pages and API data
- No caching of authentication-sensitive mutations

## Cache Contents You Can Inspect

### App Cache (`greensweveseen-v5`)
- `/` (homepage)
- `/dashboard` (dashboard page)  
- `/offline.html` (offline fallback)
- Static assets and images

### API Cache (`greensweveseen-api-v5`)
- `/api/rounds` (GET requests only)
- `/api/profile` (GET requests only)
- `/api/friends` (GET requests only)
- Other API GET endpoints

## Troubleshooting

### Service Worker Not Registering
- Only works in production builds (`NODE_ENV=production`)
- Requires HTTPS in production (localhost works in dev)
- Check browser console for registration errors

### Cache Not Working
- Clear all browser data and test fresh
- Check DevTools → Application → Storage for cache contents
- Verify network requests show "(from ServiceWorker)" in Network tab

### Offline Page Not Showing
- Ensure `/offline.html` is cached in service worker
- Check that uncached routes trigger fallback correctly
- Verify offline detection is working in DevTools

## Development vs Production

The service worker only activates in production builds to avoid development issues. For testing:

1. Always build first: `npm run build`
2. Serve production build: `npm start` 
3. Use DevTools offline simulation
4. Service worker won't activate in `npm run dev`