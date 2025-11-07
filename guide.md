# African Nations League - 56/56 Task Checklist

[cite_start]This checklist maps all functional requirements from the assignment brief [cite: 2573-2585] [cite_start]and implementation plan [cite: 1855-1873] [cite_start]directly to the 14 criteria in the official marksheet [cite: 2653] to ensure a perfect score.

**Tech Stack Note:** This plan is adapted for your specified stack: **React + Vite**, **Firebase (Authentication & Firestore)**, **OpenAI**, and **Vercel**.

---


## 1. Database Layer (4 Marks)
*Goal: Database is separate, appropriate (NoSQL), and online.*

- [ ] **Firebase Setup:** Create a new Firebase project.
- [ ] [cite_start]**Services Enabled:** Enable **Firebase Authentication** (Email/Password) [cite: 2157] and **Cloud Firestore** (as the NoSQL DB) [cite: 1876, 2562].
- [ ] [cite_start]**Online Database:** Ensure Firestore is set to operate in "Online" mode (not emulated) for the final deployment [cite: 2653].
- [ ] **Service Abstraction:** Create a dedicated service file (e.g., `src/services/firebaseService.js`) that handles *all* interactions with Firestore (CRUD operations). [cite_start]No other part of the application (components, pages) should access Firestore directly [cite: 2121]. [cite_start]This satisfies the "separate layer" requirement [cite: 2653].

## 2. Connection to Database (4 Marks)
*Goal: Application connects reliably to the online database.*

- [ ] [cite_start]**Firebase Config:** Initialize the Firebase app in your React project (e.g., in `src/utils/firebase.js`) using the environment variables from your Firebase project config [cite: 2164-2169].
- [ ] [cite_start]**Environment Variables:** Store all Firebase config keys securely in a `.env` file (`VITE_FIREBASE_...`) [cite: 2161].
- [ ] [cite_start]**Submission Access:** Grant the reviewer emails (`ammarcanani@gmail.com`, `elsje.scott@uct.ac.za`) "Editor" role access in the Firebase project's "Users and permissions" IAM settings [cite: 1881, 2562].

## 3. Design of the Database (4 Marks)
*Goal: A logical and efficient NoSQL schema in Firestore.*

- [ ] **Collection `users`:** Stores user-specific data *not* in Auth.
  - `docId`: User's Firebase Auth `uid`.
  - `email`: User's email.
  - [cite_start]`role`: String ("representative" or "admin") [cite: 1856, 1971].
  - [cite_start]`federationId`: (For representatives) The Document ID of their team in the `federations` collection [cite: 1966].
- [ ] **Collection `federations`:** Stores team data.
  - `docId`: Auto-generated.
  - [cite_start]`userId`: The representative's `uid` [cite: 1978].
  - [cite_start]`country`: String (e.g., "Nigeria") [cite: 1979, 2577].
  - [cite_start]`managerName`: String [cite: 1984, 2578].
  - [cite_start]`teamRating`: Number (0-100), calculated average [cite: 1864, 1985].
  - [cite_start]`isActive`: Boolean [cite: 2008].
- [ ] **Sub-collection `players` (under `federations/{federationId}/players`):**
  - [cite_start]*Robustness Suggestion:* Use a sub-collection for players instead of a massive embedded array [cite: 1987]. This is more scalable in Firestore and cleaner to query.
  - `docId`: Auto-generated (23 documents per federation).
  - [cite_start]`name`: String [cite: 1992].
  - [cite_start]`naturalPosition`: String ("GK", "DF", "MD", or "AT") [cite: 1993, 2579].
  - [cite_start]`isCaptain`: Boolean (true for one player) [cite: 1994, 2578].
  - [cite_start]`ratings`: Map { GK: Number, DF: Number, MD: Number, AT: Number } [cite: 1995-2004].
- [ ] **Collection `tournaments`:** Stores the state of the *current* tournament.
  - `docId`: (e.g., "active_tournament_2026").
  - [cite_start]`status`: String ("pending", "active", "completed") [cite: 2055].
  - [cite_start]`participatingTeams`: Array of `federationId` strings (exactly 8) [cite: 2092].
  - [cite_start]`bracket`: Map containing `quarterFinals`, `semiFinals`, `final` objects, storing match IDs and team IDs [cite: 2057-2089].
- [ ] **Collection `matches`:** Stores details for all 7 matches.
  - `docId`: Auto-generated.
  - `tournamentId`: Reference to the tournament doc.
  - [cite_start]`stage`: String ("QF", "SF", "Final") [cite: 2016].
  - [cite_start]`team1`: Map { federationId, country, score } [cite: 2018-2022].
  - [cite_start]`team2`: Map { federationId, country, score } [cite: 2023-2027].
  - [cite_start]`winnerId`: String (`federationId`) [cite: 2028].
  - [cite_start]`matchType`: String ("played" or "simulated") [cite: 2029, 2545].
  - [cite_start]`goalScorers`: Array of Maps { playerName, team, minute } [cite: 2030-2042, 2525].
  - [cite_start]`commentary`: String (null if simulated, full AI text if "played") [cite: 2044, 2523].

## 4. Coding Structure (4 Marks)
*Goal: Use a modern framework with best practices.*

- [ ] [cite_start]**Framework:** Use **React + Vite** [cite: 1886].
- [ ] [cite_start]**Folder Structure:** Organize code logically: `src/components`, `src/pages`, `src/services`, `src/contexts`, `src/utils` [cite: 2139-2144].
- [ ] **Component-Based:** Build the UI using reusable React components (e.g., `MatchCard`, `PlayerRow`, `BracketNode`).
- [ ] [cite_start]**State Management:** Use React Context (`AuthContext`) for global auth state (user, role, loading) [cite: 1689].

## 5. Object Oriented Concepts (4 Marks)
*Goal: Demonstrate OOP principles like encapsulation (even in a functional framework).*

- [ ] [cite_start]***Robustness Suggestion:*** To explicitly satisfy the "Classes; encapsulation" criterion [cite: 2653] in a functional React project, create JavaScript/TypeScript **classes** for complex business logic.
- [ ] **`MatchEngine` Class:**
  - `constructor(team1Data, team2Data)`
  - `simulateMatch()`: Returns a match result object (scores, scorers, winner). [cite_start]Logic based on team ratings + randomness [cite: 1723]. [cite_start]Must ensure no draws [cite: 1866, 2522].
  - `generateGoalScorers()`: Internal helper method.
- [ ] **`TournamentManager` Class:**
  - `constructor(tournamentData)`
  - [cite_start]`startTournament(teams)`: Shuffles teams and builds the initial `bracket` object [cite: 1667].
  - [cite_start]`advanceWinner(match, winnerId)`: Updates the `bracket` object to place the winner in the next round's slot [cite: 1869, 2529].

## 6. Data Validation, Controls & Security (4 Marks)
*Goal: Enforce rules on both client and server.*

- [ ] **Client-Side Validation (in React forms):**
  - [ ] [cite_start]Team Registration: Must submit exactly 23 players [cite: 1860, 2578].
  - [ ] [cite_start]Team Registration: Must designate exactly one captain [cite: 1860, 2578].
  - [ ] Signup Form: Password and Confirm Password must match.
- [ ] **Data Generation Logic (Controls):**
  - [ ] [cite_start]Player rating auto-generation: Natural position gets 50-100 [cite: 1862, 2582], non-natural positions get 0-50 [cite: 1863, 2582].
  - [ ] [cite_start]Team Rating: Calculated as the correct average of all player ratings [cite: 1864, 2585].
- [ ] **Server-Side Security (Firestore Security Rules):**
  - *This is the most robust way to secure your Firebase backend.*
  - [ ] **`users`:** A user can only create their *own* user document and can only read their *own* role.
  - [ ] **`federations`:**
    - `read`: Allow public read for all.
    - `create`: Allow *only if* `request.auth.uid == request.resource.data.userId` (user is creating their own team) and `request.auth.token.role == 'representative'`.
    - `update`: Allow *only if* user is an 'admin' (e.g., to `deactivate`) or the 'representative' who owns the document.
  - [ ] **`tournaments` / `matches`:**
    - [cite_start]`read`: Allow public read for all (for bracket/results) [cite: 1857, 2544].
    - `create` / `update` / `delete`: Allow *only if* `request.auth.token.role == 'admin'`.

## 7. Functionality (4 Marks)
*Goal: All core features are implemented.*

- [ ] **User Role: Federation Representative**
  - [ ] [cite_start]Can sign up for an account [cite: 2575].
  - [ ] [cite_start]Can register one federation (country, manager) [cite: 2577, 2578].
  - [ ] [cite_start]Can create a 23-player squad (with auto-generate feature) [cite: 2578, 2511].
  - [ ] [cite_start]Can view the tournament bracket and their team's progress [cite: 1856].
- [ ] **User Role: Administrator**
  - [ ] [cite_start]Can log in with provided credentials [cite: 1883, 2562].
  - [ ] Can view a list of all registered federations.
  - [ ] [cite_start]Can "Start Tournament" (button is *only* clickable when 8 teams are registered) [cite: 1856, 2513].
  - [ ] [cite_start]Can "Play Match" for a fixture [cite: 1856, 2521].
  - [ ] [cite_start]Can "Simulate Match" for a fixture [cite: 1856, 2521].
  - [ ] [cite_start]Can "Restart Tournament" [cite: 1856].
- [ ] **User Role: Visitor (Unauthenticated)**
  - [ ] [cite_start]Can view the tournament bracket [cite: 1857, 2544].
  - [ ] [cite_start]Can view match summaries (scores) [cite: 1857, 2544].
  - [ ] [cite_start]Can view the goal scorers leaderboard [cite: 1857, 2546].

## 8. Works Correctly (Lists, Searching, Filtering) (4 Marks)
*Goal: Data is displayed accurately and automation works.*

- [ ] **Lists:**
  - [ ] [cite_start]Admin dashboard correctly lists all registered teams (e.g., 7, then 8 after demo) [cite: 1817].
  - [ ] [cite_start]Goal Scorers Leaderboard lists players, teams, and total goals, sorted descending by goals [cite: 1857, 2546, 1666].
- [ ] **Automation (Works Correctly):**
  - [ ] [cite_start]Starting the tournament correctly shuffles and populates all 4 Quarter-Final match slots [cite: 1667].
  - [ ] [cite_start]After a match is run (played or simulated), the winner *automatically* advances to the correct Semi-Final or Final slot in the `tournaments` document [cite: 1869, 2529].
  - [ ] The Bracket UI updates automatically to show the advanced winner.

## 9. User Interface (4 Marks)
*Goal: A professional, polished, and responsive UI.*

- [ ] [cite_start]**Component Library:** Use **Material-UI (MUI)** for a consistent, professional design system [cite: 1951-1956].
- [ ] [cite_start]**Responsive Design:** Ensure the application is usable and looks good on both desktop and mobile screens (use MUI's `Grid`, `Stack`, `Box` components) [cite: 1805, 1954].
- [ ] [cite_start]**Feedback:** Use loading states (e.g., `CircularProgress`) for all async actions (login, saving team, running match) [cite: 1805].
- [ ] [cite_start]**Feedback:** Use snackbars or alerts to show success/error messages (e.g., "Team registered," "AI commentary failed to load") [cite: 1805].

## 10. Ease of Navigation (4 Marks)
*Goal: Intuitive application flow and role-based navigation.*

- [ ] [cite_start]**Clear Navigation:** Implement a main App Bar/Navbar [cite: 1805].
- [ ] **Protected Routes:** Use `react-router-dom` to create protected routes.
  - `/admin-dashboard` should only be accessible to `role == 'admin'`.
  - `/register-federation` should only be accessible to `role == 'representative'`.
- [ ] **Role-Based UI:** The Navbar itself should show different links based on user role.
  - *Admin:* Sees "Dashboard", "Bracket", "Logout".
  - *Representative:* Sees "My Federation", "Bracket", "Logout".
  - *Visitor:* Sees "Bracket", "Leaderboard", "Login/Sign Up".

## 11. Security (Authentication & Authorization) (4 Marks)
*Goal: Users are correctly authenticated and restricted by role.*

- [ ] [cite_start]**Authentication:** Use **Firebase Authentication** for user signup, login, and logout [cite: 1913-1918]. [cite_start]Session persistence is handled automatically [cite: 1916].
- [ ] **Authorization (Client):** Use the `AuthContext` to get the user's role and implement the Protected Routes and Role-Based UI described in section 10.
- [ ] **Authorization (Server):** Implement the **Firestore Security Rules** described in section 6. This is non-negotiable for full marks on server-side security.

## 12. Sophistication & Complexity (Match engine, bracket, APIs) (4 Marks)
*Goal: The core logic and API integrations are complex and functional.*

- [ ] [cite_start]**Match Engine:** The `MatchEngine` class (from section 5) works and correctly handles team ratings, randomness, and a "no-draw" result [cite: 1866, 1723, 2522].
- [ ] [cite_start]**Bracket Automation:** The `TournamentManager` class (from section 5) correctly updates the bracket state, and winners propagate through QF -> SF -> Final [cite: 1869, 2529].
- [ ] **Email API:**
  - [ ] [cite_start]Integrate a transactional email service (e.g., Brevo [cite: 1932] or Resend).
  - [ ] [cite_start]After *any* match completion, send an email to *both* federation reps [cite: 1868, 2526].
  - [ ] [cite_start]Email content must include the final score and goal scorers [cite: 2527, 2528].
  - [ ] *Robustness:* Wrap the email API call in a `try...catch` block. [cite_start]A failure to send an email *must not* crash the server or prevent the match result from saving [cite: 1753].

## 13. AI Application (4 Marks)
*Goal: Successful integration of a generative AI for commentary.*

- [ ] [cite_start]**API Call:** On "Play Match," make a server-side (or Firebase Function) call to the **OpenAI API** (GPT-3.5-Turbo or GPT-4) [cite: 1878, 1919].
- [ ] [cite_start]**Contextual Prompt:** The prompt sent to the AI must be detailed, including both team names, the final score, and the list of goal scorers with minute timestamps [cite: 1745].
- [ ] [cite_start]**Output Storage:** Save the generated text commentary to the `commentary` field in the corresponding `matches` document [cite: 2044].
- [ ] [cite_start]**Display:** If a match `matchType == 'played'`, display this saved commentary on the public match summary page [cite: 1866, 2545].
- [ ] [cite_start]**Fallback:** If the API call fails, save a fallback message (e.g., "Commentary not available.") [cite: 1747]. The match result *must* still be saved.

## 14. Overall Evidence of Effort (4 Marks)
*Goal: A polished, complete project with all submission requirements met.*

- [ ] [cite_start]**Deployment:** Deploy the final application to **Vercel** [cite: 1877, 1938, 2562].
- [ ] [cite_start]**Production Env Variables:** Add all `.env` keys (Firebase, OpenAI, Email) to the Vercel project's Environment Variables settings [cite: 1793, 1943].
- [ ] [cite_start]**Live URL:** Ensure the deployed URL is public and fully functional [cite: 1882, 2562].
- [ ] [cite_start]**Demo Prep:** Have the database populated with 7 teams, ready to register the 8th during the demo [cite: 1793, 2514].
- [ ] [cite_start]**Credentials:** Have the administrator credentials ready to provide [cite: 1883, 2562].
- [ ] [cite_start]**README:** A high-quality `README.md` file with setup instructions, link to the live site, and admin credentials [cite: 1884, 2562].
- [ ] [cite_start]**Zip File:** Create the final `INF4001N_StudentNO_ANLeague_2026.zip` file, making sure to exclude `node_modules`, `.git`, and `dist` folders [cite: 1880, 1794, 2562].
- [ ] [cite_start]**Bonus Feature (Suggestion):** Implement one bonus feature, such as "Analytics for team performance" [cite: 2562]. This is a clear way to show effort beyond the core spec.
