# African Nations League Platform

A tournament management system for the African Nations League, featuring AI-powered match commentary, real-time bracket tracking, and federation management.

## 🎯 Features

- **Tournament Management**: Quarter Finals → Semi Finals → Final bracket system
- **AI Match Commentary**: GPT-powered structured commentary with key moments, player of match, and tactical analysis
- **Federation Registration**: 8 African nations with squad management (23 players each)
- **Real-time Leaderboard**: Top goal scorers tracking with live updates
- **Email Notifications**: Automated match result notifications via Resend API
- **Match Details**: Public pages with full commentary for played matches
- **User Onboarding**: Interactive guided tour for first-time users
- **Responsive Design**: Built with shadcn/ui and Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Firebase project with Firestore
- OpenAI API key
- Resend API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SONWA560/enations.git
cd enations
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (create `.env.local`):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

OPENAI_API_KEY=your_openai_api_key
RESEND_API_KEY=your_resend_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 UCT Assignment Requirements

### Player Rating System ✅
- Natural position: 50-100 (inclusive)
- Other positions: 0-50 (inclusive)
- Team rating = average of players' natural position ratings

### Tournament Structure ✅
- 8 teams minimum for Quarter Finals
- Automatic bracket progression
- Winner advancement logic

### Features Implemented ✅
- Player auto-generation with proper ratings
- Federation management
- Match simulation with AI commentary
- Email notifications
- Real-time bracket updates
- Public match detail pages

## 🔐 Marker Access

**Firebase Console Access Granted:**
- ammarcanani@gmail.com (Editor)
- elsje.scott@uct.ac.za (Editor)
- **Access granted on:** November 7, 2025

Markers have full access to:
- Firestore database
- Authentication
- Project settings
- Real-time data inspection

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: OpenAI GPT-3.5-turbo-1106
- **Email**: Resend API
- **UI**: shadcn/ui + Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📁 Project Structure

```
africon/
├── app/                      # Next.js app router pages
│   ├── admin/               # Admin dashboard
│   ├── auth/                # Authentication pages
│   ├── bracket/             # Tournament bracket view
│   ├── dashboard/           # Federation dashboard
│   ├── federation/          # Federation management
│   ├── leaderboard/         # Goal scorers leaderboard
│   ├── match/[id]/          # Match detail pages
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── onboarding-tour.tsx  # Guided tour system
│   └── tournament-bracket.tsx
├── lib/
│   ├── classes/             # Core classes
│   │   ├── MatchEngine.ts   # Match simulation
│   │   └── TournamentManager.ts
│   ├── utils/               # Utility functions
│   │   ├── playerData.ts    # Player rating logic
│   │   └── matchCompletion.ts
│   └── firebase.ts          # Firebase config
└── public/                  # Static assets

```

## 🎮 Usage

### For Admins:
1. Navigate to `/admin/dashboard`
2. Activate federations with 23+ players
3. Start tournament (assigns teams to bracket)
4. Play or simulate matches
5. Monitor tournament progress

### For Federation Representatives:
1. Register your federation
2. Select 23 players for your squad
3. View your dashboard stats
4. Check bracket for match results
5. Receive email notifications

### For Visitors:
1. View tournament bracket
2. Click matches to see detailed commentary
3. Check leaderboard for top scorers
4. Follow real-time updates

## 🧪 Testing

The platform includes:
- Player rating validation (50-100 natural, 0-50 others)
- Team rating calculation tests
- Match engine simulation
- AI commentary generation
- Email notification delivery

## 📊 Data Model

### Player
- Name, age, nationality, position
- 4 position ratings (GK, DF, MD, AT)
- Natural rating (50-100)

### Federation
- Country, manager name
- Squad (23 players)
- Team rating (average of natural ratings)

### Match
- Home/away teams with scores
- Goal scorers with minutes
- Match statistics
- AI commentary (for played matches)

## 🚀 Deployment

Deployed on Vercel: [Production URL]

Environment variables are configured in Vercel dashboard.

## 📝 License

This project is developed for UCT CSC3003F coursework.

## 👥 Contributors

- Sonwabise (Developer)
- UCT Department of Computer Science

---

**Last Updated:** November 7, 2025
