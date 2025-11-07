# Quick Email Testing Steps

## What We Just Fixed

Added **detailed logging** to trace where emails are lost:

1. ✅ Log emails when fetching team data from Firestore
2. ✅ Log emails before calling `completeMatch()`  
3. ✅ Log emails in `sendMatchEmails()` function
4. ✅ Log emails when calling API

## How to Test NOW

### Step 1: Refresh the Admin Dashboard
The code has changed, so you need to reload:
1. Go to `http://localhost:3000/admin/dashboard`
2. **Hard refresh**: Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)
3. Wait for page to fully load

### Step 2: Play a Match
Click **"Play Next Match"** or **"Simulate Quick"**

### Step 3: Watch the Terminal (NOT Browser Console)
Look for these logs in your **Node.js terminal** (where you ran `npm run dev`):

```
📧 Fetched email from user document for Nigeria: 4340789@myuwc.ac.za
📧 Fetched email from user document for Cape Verde: 4340789@myuwc.ac.za
📧 Team emails before completeMatch: { homeTeam: {...}, awayTeam: {...} }
🔍 Email sending check: { team1: {...}, team2: {...} }
✅ Emails found! Proceeding to send emails...
📧 Email API called with: {...}
📨 Sending emails to: {...}
✅ Successfully sent 2 email(s)
```

### Step 4: Identify the Problem

**If you see this:**
```
⚠️ Skipping email notification - team emails not provided
Team 1 email: undefined
Team 2 email: undefined
```

**Then the problem is:** Emails aren't being fetched from user documents.

**Possible causes:**
1. Federation doesn't have a `userId` field
2. User document doesn't exist
3. User document doesn't have an `email` field

### Step 5: Check Firestore Data

Go to Firebase Console → Firestore Database

**Check Federations Collection:**
```
federations/{federationId}
  - country: "Nigeria"
  - userId: "abc123..."  <-- Must exist!
  - representativeEmail: "..." <-- May be empty (we'll fetch from user)
```

**Check Users Collection:**
```
users/{userId}
  - email: "4340789@myuwc.ac.za"  <-- Must exist!
  - role: "representative"
```

## If Emails Are Still Not Found

### Option 1: Manual Fix (Quick)
Add email directly to federation in Firestore:
1. Go to Firebase Console
2. Find your federation document
3. Add field: `representativeEmail` = `4340789@myuwc.ac.za`
4. Save
5. Refresh dashboard and try again

### Option 2: Re-register Federation
1. Create new test account with your email
2. Register new federation
3. The new code will automatically save your email
4. Play match with this new federation

## Expected Email Content

When successful, you'll receive email with:
- **Subject**: "Match Result: Team1 vs Team2 - 2-1"
- **From**: onboarding@resend.dev
- **To**: 4340789@myuwc.ac.za

**Email includes:**
- Match score and winner
- Goal scorers with minutes
- Statistics table (possession, shots, fouls, cards)
- Tournament stage
- Professional HTML formatting

## Troubleshooting Checklist

- [ ] Hard refreshed admin dashboard (Cmd+Shift+R)
- [ ] Watching Node.js terminal (not browser console)
- [ ] See log: "📧 Fetched email from user document"
- [ ] See log: "✅ Emails found! Proceeding to send emails..."
- [ ] Federation has `userId` field in Firestore
- [ ] User document has `email` field in Firestore
- [ ] Checked spam folder in university email
- [ ] Waited 2-5 minutes for email delivery

## Next Steps

After testing, share the **terminal logs** (not browser console) so we can see exactly where the email data is getting lost!
