# Email System Troubleshooting Guide

## ✅ ISSUES FIXED (Just Now!)

### Critical Fix #1: Missing Email Addresses
**Problem**: Federation representatives' email addresses weren't being stored or retrieved.

**Root Cause**: 
- Federation creation didn't include `representativeEmail` field
- No fallback to fetch email from user document

**Solution Applied**:
1. ✅ Updated `app/register-federation/page.tsx` to store user's email when creating federation
2. ✅ Added fallback in `app/admin/dashboard/page.tsx` to fetch email from user document if not in federation
3. ✅ Now logs: `📧 Fetched email from user document for {country}: {email}`

### Critical Fix #2: Quick Simulation Didn't Send Emails
**Problem**: "Simulate Quick" button wasn't sending emails at all.

**Solution Applied**:
✅ Updated `lib/utils/matchCompletion.ts` - `simulateMatchQuick()` now sends emails

### Enhancement: Detailed Logging
**Added comprehensive logging to track email flow**:
- 📧 Email API called
- 📨 Sending emails to...
- 📬 Email results
- ✅ Success messages
- ❌ Error details

---

## How to Test Email System NOW

### Step 1: Register a New Test Federation
If you want to test with a fresh federation:
1. Create new account at `/auth` with your university email
2. Register federation - **email will now be saved automatically** ✅
3. Select squad
4. Admin plays match → emails sent to your university email

### Step 2: Test With Existing Federations  
For federations created before this fix:
1. Go to admin dashboard
2. Play a match (either button)
3. Check terminal for this log:
   ```
   📧 Fetched email from user document for Nigeria: 4340789@myuwc.ac.za
   ```
4. Check your inbox at `4340789@myuwc.ac.za`

### Step 3: Verify Email Delivery
**Terminal logs to look for**:
```
📧 Email API called with: {
  team1Email: '4340789@myuwc.ac.za',
  team2Email: '4340789@myuwc.ac.za',
  ...
}
📨 Sending emails to: { to: [...] }
📬 Email results: [...]
✅ Successfully sent 2 email(s)
```

**Check your inbox**:
- Email: `4340789@myuwc.ac.za`
- Subject: "Match Result: Team1 vs Team2 - 2-1"
- Check spam folder if not in inbox
- Wait 1-2 minutes for delivery

---

## Current Setup

### Environment Variables
- **RESEND_API_KEY**: Configured ✅
- **FROM_EMAIL**: `onboarding@resend.dev` (Resend's test email)

### Test Email Override
The system is configured to send ALL emails to your university email for testing:
- **Test recipient**: `4340789@myuwc.ac.za`

## Recent Fixes Applied

### 1. Email Sending Added to Quick Simulation ✅
**Problem**: The "Simulate Quick" button wasn't sending emails at all.

**Fix**: Updated `lib/utils/matchCompletion.ts` to send emails even in quick mode.

### 2. Enhanced Logging ✅
**Added detailed console logging to track email flow**:
- When API is called
- Email recipients
- Send results
- Error details

## How to Test Email System

### Step 1: Check Terminal Logs
After playing a match (either mode), look for these log messages in your terminal:

```
📧 Email API called with: {
  team1Name: '...',
  team2Name: '...',
  team1Email: '4340789@myuwc.ac.za',
  team2Email: '4340789@myuwc.ac.za',
  ...
}
📨 Sending emails to: ...
📬 Email results: ...
✅ Successfully sent 2 email(s)
```

### Step 2: Check for Errors
If emails fail, you'll see:
```
❌ All emails failed: [...]
```

### Step 3: Check Your Inbox
- Check: `4340789@myuwc.ac.za`
- Check spam/junk folder
- Search for: "Match Result"

## Common Issues & Solutions

### Issue 1: No Logs Appearing
**Cause**: Match not being played or email function not called.
**Solution**: 
1. Make sure you're using either "Play Next Match" or "Simulate Quick"
2. Check browser console for errors
3. Restart dev server: `npm run dev`

### Issue 2: Emails Sent But Not Received
**Cause**: Using `onboarding@resend.dev` has limitations:
- Can only send to verified emails in Resend dashboard
- May have rate limits
- May be flagged as spam

**Solutions**:
1. **Add your email to Resend** (Recommended):
   - Go to [resend.com/domains](https://resend.com/domains)
   - Add `4340789@myuwc.ac.za` as a verified recipient
   
2. **Use a verified domain** (Best for production):
   - Add your own domain to Resend
   - Update `FROM_EMAIL` in `.env` to use verified domain
   - Example: `FROM_EMAIL=noreply@yourdomain.com`

### Issue 3: API Key Invalid
**Symptoms**: Logs show "Email service not configured"

**Solution**:
1. Verify `RESEND_API_KEY` in `.env` is correct
2. Get new API key from [resend.com/api-keys](https://resend.com/api-keys)
3. Restart dev server after updating `.env`

## Testing Checklist

- [ ] Environment variables are set in `.env`
- [ ] Dev server is running (`npm run dev`)
- [ ] Browser console has no errors
- [ ] Terminal shows email API logs
- [ ] Match was played successfully
- [ ] Checked university email inbox
- [ ] Checked spam/junk folder
- [ ] Waited 2-5 minutes for email delivery

## Email Content Preview

Emails include:
- ✅ Match result (Team1 vs Team2, final score)
- ✅ Goal scorers with minute timestamps
- ✅ Match statistics table (possession, shots, fouls, cards)
- ✅ Tournament stage information
- ✅ Professional HTML formatting with colors

## Next Steps if Still Not Working

### Option 1: Verify Email in Resend Dashboard
1. Login to [resend.com](https://resend.com)
2. Go to "Domains" → "Default (onboarding@resend.dev)"
3. Add `4340789@myuwc.ac.za` to verified recipients

### Option 2: Use Alternative Email Service
If Resend continues to have issues, consider:
- **SendGrid**: Free tier 100 emails/day
- **Mailgun**: Free tier 5,000 emails/month
- **Gmail SMTP**: Free but requires app password

### Option 3: Check Resend Dashboard Logs
1. Go to [resend.com/logs](https://resend.com/logs)
2. Check if emails were sent
3. View delivery status and any errors

## Current Code Locations

### Email API Route
`/app/api/send-match-email/route.ts`
- Handles email sending
- Contains HTML template
- Has detailed logging

### Match Completion Utility
`/lib/utils/matchCompletion.ts`
- `sendMatchEmails()` - Sends emails to both teams
- `completeMatch()` - Plays match with AI + emails
- `simulateMatchQuick()` - Quick mode now includes emails ✅

### Admin Dashboard
`/app/admin/dashboard/page.tsx`
- Calls `completeMatch()` for "Play Next Match"
- Calls `simulateMatchQuick()` for "Simulate Quick"
- Both modes now send emails ✅

## Testing Commands

```bash
# Check if API key is loaded
echo $RESEND_API_KEY

# Restart dev server
npm run dev

# Clear Next.js cache if needed
rm -rf .next
npm run dev
```

## Expected Terminal Output (Success)

```
POST /api/send-match-email 200 in 324ms
📧 Email API called with: {
  team1Name: 'Nigeria',
  team2Name: 'Ghana',
  team1Email: '4340789@myuwc.ac.za',
  team2Email: '4340789@myuwc.ac.za',
  score: '2-1',
  tournamentStage: 'Quarter Final'
}
📨 Sending emails to: {
  from: 'onboarding@resend.dev',
  to: [ '4340789@myuwc.ac.za', '4340789@myuwc.ac.za' ]
}
📬 Email results: [
  {
    recipient: '4340789@myuwc.ac.za',
    status: 'fulfilled',
    data: { id: 're_...' }
  },
  {
    recipient: '4340789@myuwc.ac.za',
    status: 'fulfilled',
    data: { id: 're_...' }
  }
]
✅ Successfully sent 2 email(s)
```

## Support

If issues persist after following this guide:
1. Check Resend dashboard for delivery logs
2. Try sending test email via Resend dashboard directly
3. Verify university email accepts emails from Resend
4. Consider using a different email service temporarily
