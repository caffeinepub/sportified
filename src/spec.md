# Specification

## Summary
**Goal:** Add a clear first-time user sign-up onboarding flow (still using Internet Identity) that collects additional profile details and avoids conflicts with the existing no-profile setup behavior.

**Planned changes:**
- Update the /sign-in screen to present two distinct paths: returning user login (existing Internet Identity login) and a separate “New user? Sign up” action.
- Add a dedicated onboarding page/route for new users after Internet Identity authentication to collect name, age, fitness goals, and preferred sport, with required-field validation and English-only copy.
- Wire the sign-up path so it authenticates via Internet Identity first, then routes to onboarding (and does not create a profile until onboarding is submitted).
- Extend the backend user profile model and APIs to store and return age and fitness goals, and support creating a full profile from onboarding.
- Update frontend profile queries/mutations and the Profile page UI to display and allow editing of age and fitness goals.
- Rework the authenticated-but-no-profile behavior so users are guided to the onboarding screen (instead of the existing modal) and routing avoids loops between sign-in, onboarding, and the authenticated app.

**User-visible outcome:** Users can choose “Login” or “New user? Sign up” on the sign-in page; new users authenticate with Internet Identity, complete onboarding to create their profile (including age and fitness goals), and then access the app, while existing users continue logging in normally and can view/edit the new profile fields.
