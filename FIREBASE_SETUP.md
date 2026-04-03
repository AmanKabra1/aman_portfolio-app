# Firebase Admin Setup Guide for Your Portfolio

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "portfolio-admin")
4. Select "Don't enable Google Analytics" (optional)
5. Click "Create project"

## Step 2: Get Your Firebase Credentials

1. In Firebase Console, click the web icon `</>`
2. Register app (name: "portfolio-app")
3. Copy the configuration object:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

4. Update `src/app/config/firebase.config.ts` with these values

## Step 3: Enable Authentication

1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Click "Email/Password"
3. Enable "Email/Password" toggle
4. Click "Save"

## Step 4: Create Firestore Database

1. Go to "Firestore Database" in left sidebar
2. Click "Create database"
3. Select "Start in test mode" (for development)
4. Choose region (e.g., us-central1)
5. Click "Enable"

## Step 5: Create Admin User

1. Go to "Authentication" → "Users"
2. Click "Add user"
3. Enter email (e.g., admin@portfolio.com)
4. Enter password (secure!)
5. Click "Add user"

## Step 6: Create Firestore Collections (Optional but Recommended)

Create collection structure in Firestore:
```
portfolio/
  └── data/
      ├── about: { bio: "...", description: "...", yearsExperience: 2 }
      └── contact: { email: "...", phone: "...", location: "..." }
  
  └── skills/ (collection)
      └── skill1: { id: "skill1", name: "Angular", level: 90, category: "frontend" }
  
  └── projects/ (collection)
      └── project1: { id: "project1", title: "...", description: "...", ... }
  
  └── experience/ (collection)
      └── exp1: { id: "exp1", company: "...", position: "...", ... }
```

## Step 7: Firestore Security Rules (Important!)

Update Firestore rules in "Firestore Database" → "Rules":

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access to portfolio data
    match /portfolio/{document=**} {
      allow read;
      // Only authenticated admins can write
      allow write: if request.auth != null;
    }
  }
}
```

## Step 8: Test Your Setup

1. Start the app: `npm start`
2. Navigate to: `http://localhost:4200/admin/login`
3. Login with your admin email and password
4. You should see the admin dashboard!

## Troubleshooting

### "Firebase Config is Missing"
- Make sure you updated `src/app/config/firebase.config.ts` with real values

### "Authentication Failed"
- Check if Email/Password is enabled in Firebase Console
- Verify the user exists in Firebase Authentication

### "Permission Denied" errors
- Check Firestore Security Rules
- Ensure they allow read for public and write for authenticated users

### "Property 'db' is not exported"
- Make sure `src/app/firebase/firebase.ts` exists and exports `db` and `auth`

## Security Notes

⚠️ **Important for Production:**
1. Never commit real Firebase credentials to Git
2. Use environment variables instead
3. Implement proper Firestore security rules
4. Rotate admin passwords regularly
5. Consider adding 2FA to admin account

## Next Steps

Once setup is complete, you can:
1. Edit portfolio content from admin dashboard
2. Changes sync to Firestore automatically
3. Portfolio displays real data from Firestore
4. Other users see read-only version
