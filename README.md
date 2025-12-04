<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🛒 Smart Shopping List

**A collaborative, real-time shopping list PWA with Hebrew RTL support**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat&logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-purple?style=flat)](https://web.dev/progressive-web-apps/)

</div>

---

## ✨ Features

### 🎯 Core Functionality
- **Real-time Collaboration** — Share shopping lists with family and friends
- **Group Management** — Create multiple groups for different stores or occasions
- **Smart Categorization** — Auto-categorize items for efficient shopping
- **Completion Tracking** — Mark items as complete with timestamp tracking
- **Hebrew RTL Support** — Fully optimized for right-to-left languages

### 📱 Progressive Web App
- **Install Anywhere** — Works on iOS, Android, and Desktop
- **Offline Support** — Service worker caching for offline access
- **Badge Notifications** — See uncompleted item count on your home screen
- **Native Experience** — Looks and feels like a native app

### 🔐 Authentication & Security
- **Google OAuth** — Quick sign-in with Google account
- **Email/Password** — Traditional authentication option
- **Row Level Security** — Supabase RLS protects all data
- **Auto-registration** — Seamless onboarding for new users

### 🔔 Badge Notifications

**Real-time Updates**
- Badge shows count of uncompleted items
- Updates automatically when items change
- Clears when all items are completed

**Cross-Platform Support**

| Platform | Badge Support | Version |
|----------|---------------|---------|
| iOS Safari | ✅ Native | 17+ |
| Android Chrome | ✅ Native | 109+ |
| Desktop Chrome/Edge | ✅ Native | All |
| Firefox | ⚠️ Title only | All |

**Fallback Methods**
1. Badging API (primary)
2. Service Worker messaging
3. Document title: `(3) רשימת קניות`
4. LocalStorage persistence

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **Supabase Account** ([Sign up free](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShaharAssenheim/ShoppingList.git
   cd ShoppingList
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set up the database**
   
   Open Supabase SQL Editor and run these files **in order**:
   - `db/step1-drop-everything.sql` (⚠️ drops all existing data)
   - `db/step2-create-tables.sql`
   - `db/step3-create-simple-policies.sql`
   - `db/step4-create-functions.sql`
   
   📖 See [db/README.md](db/README.md) for detailed schema documentation

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Supabase** | PostgreSQL database + Auth + Real-time |
| **Tailwind CSS** | Utility-first styling |
| **PWA** | Service worker, manifest, badges |

---

## 📱 Install as PWA

### iOS (Safari)
1. Open the app in Safari
2. Tap the **Share** button (□↑)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. Badge will show uncompleted item count

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Tap **"Install app"** or **"Add to Home Screen"**
4. Grant notification permission (optional, for enhanced badges)
5. Tap **"Install"**

### Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge
2. Click the **install icon** (⊕) in the address bar
3. Click **"Install"**
4. Badge will appear on taskbar/dock

---

## 🗂️ Project Structure

```
smart-shopping-list/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with PWA meta tags
│   ├── page.tsx                 # Main page component
│   └── ServiceWorkerRegistration.tsx  # SW setup
├── components/
│   ├── AuthPage.tsx             # Login/signup UI
│   ├── GroupSetup.tsx           # Group creation flow
│   ├── Header.tsx               # App header with logout
│   ├── ItemInput.tsx            # Add item form
│   └── ShoppingItemRow.tsx      # Individual item component
├── contexts/
│   └── AuthContext.tsx          # Authentication state management
├── services/
│   ├── firebase.ts              # Legacy (not in use)
│   ├── geminiService.ts         # AI categorization service
│   └── supabase.ts              # Supabase client + CRUD operations
├── db/                          # Database migration files
│   ├── README.md                # Database documentation
│   ├── step1-drop-everything.sql
│   ├── step2-create-tables.sql
│   ├── step3-create-simple-policies.sql
│   └── step4-create-functions.sql
├── public/
│   ├── sw.js                    # Service Worker
│   ├── manifest.json            # PWA manifest
│   ├── icon-192.png             # App icon (192x192)
│   └── icon-512.png             # App icon (512x512)
├── App.tsx                      # Main shopping list component
├── types.ts                     # TypeScript type definitions
├── .env.local                   # Environment variables (not committed)
└── package.json
```

---

## 🔧 Configuration

### Database Schema

**Tables:**
- `user_profiles` — Extended user data
- `groups` — Shopping groups
- `group_members` — Group membership (junction table)
- `items` — Shopping list items

**Key Functions:**
- `create_group(group_name)` — Atomically create group + membership
- `leave_group(group_id)` — Remove user from group

**Security:**
- Row Level Security (RLS) on all tables
- Users can only access their own groups and items
- Owners can manage groups; members can CRUD items

📖 Full schema documentation: [db/README.md](db/README.md)

### Customize Badge Behavior

Edit badge logic in `App.tsx` (lines ~112-160):

```typescript
// Count only priority items
const activeCount = items.filter(i => !i.isCompleted && i.priority === 'high').length;

// Clear badge when app is visible
if (document.visibilityState === 'visible') {
  (navigator as any).clearAppBadge?.();
}
```

### Replace App Icons

Replace placeholder icons with actual PNG files:
- `public/icon-192.png` (192×192)
- `public/icon-512.png` (512×512)

Use [Real Favicon Generator](https://realfavicongenerator.net/) for best results.

---

## 🧪 Testing Badge Notifications

1. **Install as PWA** (not just a bookmark)
2. **Add items** to your shopping list
3. **Check badge** — Should show count immediately
4. **Complete items** — Badge decreases
5. **Complete all** — Badge clears

**Browser Console Testing:**
```javascript
// Check API support
console.log('Badge API:', 'setAppBadge' in navigator);

// Set badge manually
navigator.setAppBadge(5);

// Clear badge
navigator.clearAppBadge();
```

---

## 🐛 Troubleshooting

<details>
<summary><strong>Badge not showing</strong></summary>

- ✅ App must be installed as PWA (not bookmarked)
- ✅ Check browser supports Badging API
- ✅ iOS requires 17+, Android Chrome 109+
- ✅ Verify items are loaded correctly
</details>

<details>
<summary><strong>HTTP 500 errors on database queries</strong></summary>

- ✅ Run all 4 SQL migration files in order
- ✅ Check RLS policies are created
- ✅ Verify user is authenticated (`auth.uid()` returns ID)
- ✅ Clear old data with `step1-drop-everything.sql`
</details>

<details>
<summary><strong>Groups not appearing</strong></summary>

- ✅ User must be member of group (check `group_members` table)
- ✅ Groups must be created via `create_group()` function
- ✅ Check RLS policies allow SELECT for current user
</details>

<details>
<summary><strong>Items not saving</strong></summary>

- ✅ User must be member of target group
- ✅ Verify `items` RLS policies are active
- ✅ Check browser console for errors
- ✅ Ensure group_id is valid
</details>

<details>
<summary><strong>Logout button not working</strong></summary>

- ✅ Check browser console for errors
- ✅ Verify Supabase client is initialized
- ✅ Clear browser cache and localStorage
</details>

---

## 🛠️ Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm run start
```

### Clear Next.js Cache
```bash
Remove-Item ".next" -Recurse -Force
```

### Reset Database
```bash
# In Supabase SQL Editor, run in order:
# 1. db/step1-drop-everything.sql
# 2. db/step2-create-tables.sql
# 3. db/step3-create-simple-policies.sql
# 4. db/step4-create-functions.sql
```

---

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ShaharAssenheim/ShoppingList)

1. Click "Deploy" button above
2. Connect your GitHub account
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Manual Deployment

```bash
npm run build
# Upload .next folder to your hosting provider
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Shahar Assenheim**

- GitHub: [@ShaharAssenheim](https://github.com/ShaharAssenheim)
- Repository: [ShoppingList](https://github.com/ShaharAssenheim/ShoppingList)

---

## 🙏 Acknowledgments

- **Next.js** — Amazing React framework
- **Supabase** — Backend as a service
- **Vercel** — Hosting and deployment
- **Google Gemini** — AI-powered categorization

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ and ☕

</div>
