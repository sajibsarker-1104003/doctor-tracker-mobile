# Doctor Tracker – Mobile App

React Native (Expo) mobile application for managing doctors and patients.  
Works on **Android** and **iOS**.

---

## Features

- **Authentication**
  - Login with JWT (access + refresh token)
  - Role-based access (ADMIN / USER)
  - Secure token storage with Expo SecureStore

- **Dashboard**
  - Total doctors, patients, average patients per doctor
  - New patients (last 30 days)
  - Patients per doctor chart
  - Conditions distribution chart

- **Doctors**
  - List + Search
  - Create / Edit / Delete (ADMIN only)
  - View patients under a doctor
  - Specialization & Hospital dropdown

- **Patients**
  - List + Search
  - Create / Edit / Delete (ADMIN only)
  - Gender dropdown
  - Condition dropdown + custom input
  - Assign to doctor

- **UI**
  - Side drawer navigation
  - Clean card-based design
  - Pull to refresh

---

## Tech Stack

| Layer            | Technology                        |
|------------------|-----------------------------------|
| Framework        | React Native (Expo)               |
| Language         | TypeScript                        |
| Navigation       | React Navigation (Drawer + Stack) |
| Data Fetching    | TanStack Query (React Query)      |
| Auth Storage     | Expo SecureStore                  |
| Charts           | react-native-chart-kit            |
| Icons            | @expo/vector-icons                |

---

## Project Structure

```
doctor-tracker-mobile/
├── App.tsx
├── src/
│   ├── api/
│   │   └── client.ts                 # API client with token refresh
│   ├── components/
│   │   └── Dropdown.tsx              # Reusable dropdown
│   ├── features/
│   │   └── auth/
│   │       └── AuthContext.tsx       # Auth provider
│   ├── lib/
│   │   └── config.ts                 # API base URL
│   ├── navigation/
│   │   └── AppNavigator.tsx          # Drawer + Stack navigation
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── doctors/
│   │   │   ├── DoctorsScreen.tsx
│   │   │   ├── DoctorFormScreen.tsx
│   │   │   └── DoctorPatientsScreen.tsx
│   │   └── patients/
│   │       ├── PatientsScreen.tsx
│   │       └── PatientFormScreen.tsx
│   └── types/
│       └── index.ts
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo Go app (on phone) or Android/iOS emulator
- Backend running (NestJS Doctor Tracker API)

### 1. Install dependencies

```bash
cd doctor-tracker-mobile
yarn install
# or
npm install
```

### 2. Configure API URL

Edit `src/lib/config.ts`:

```ts
// Local development (use your computer's local IP)
export const API_BASE_URL = "http://192.168.0.125:8080/api/v1";

// Production example
// export const API_BASE_URL = "https://your-backend.onrender.com/api/v1";
```

> Phone and computer must be on the **same Wi-Fi** for local testing.

### 3. Start the app

```bash
npx expo start
```

- Scan QR code with **Expo Go** (Android / iOS)
- Or press `a` for Android emulator
- Or press `i` for iOS simulator (macOS only)

---

## Default Login Credentials

| Role  | Email               | Password    |
|-------|---------------------|-------------|
| ADMIN | admin@example.com   | Admin@12345 |
| USER  | user@example.com    | User@12345  |

> **ADMIN** can create, edit and delete.  
> **USER** can only view data.

---

## API Endpoints Used

| Feature                 | Method | Endpoint                               |
|-------------------------|--------|----------------------------------------|
| Login                   | POST   | `/auth/login`                          |
| Refresh token           | POST   | `/auth/refresh`                        |
| Current user            | GET    | `/auth/me`                             |
| Logout                  | POST   | `/auth/logout`                         |
| Dashboard summary       | GET    | `/dashboard/summary`                   |
| Patients per doctor     | GET    | `/dashboard/patients-per-doctor`       |
| Conditions              | GET    | `/dashboard/conditions`                |
| Doctors list            | GET    | `/doctors`                             |
| Create doctor           | POST   | `/doctors`                             |
| Update doctor           | PATCH  | `/doctors/:id`                         |
| Delete doctor           | DELETE | `/doctors/:id`                         |
| Doctor filter options   | GET    | `/doctors/filter-options`              |
| Doctor's patients       | GET    | `/doctors/:id/patients`                |
| Add patient under doctor| POST   | `/doctors/:id/patients`                |
| Delete patient (doctor) | DELETE | `/doctors/:id/patients/:patientId`     |
| All patients            | GET    | `/patients`                            |
| Update patient          | PATCH  | `/patients/:id`                        |
| Delete patient          | DELETE | `/patients/:id`                        |
| Patient filter options  | GET    | `/patients/filter-options`             |

---

## Permissions by Role

| Action                         | ADMIN | USER |
|--------------------------------|:-----:|:----:|
| View dashboard                 | Yes   | Yes  |
| List / search doctors & patients | Yes | Yes  |
| Create doctor                  | Yes   | No   |
| Edit / Delete doctor           | Yes   | No   |
| Add patient under doctor       | Yes   | No   |
| Edit / Delete patient          | Yes   | No   |

---

## Build APK / IPA (EAS Build)

### 1. Install EAS CLI and login

```bash
npm install -g eas-cli
npx expo login
```

### 2. Configure EAS

```bash
eas build:configure
```

### 3. Build Android APK

```bash
eas build -p android --profile preview
```

After the build finishes, download the APK from the link provided.

### 4. Build iOS (optional)

```bash
eas build -p ios --profile preview
```

> iOS builds require an **Apple Developer** account ($99/year).

---

## Example `eas.json`

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## Important Notes

- Access token is kept in memory; refresh token is stored in **SecureStore**
- On `401`, the app automatically tries to refresh the token
- Backend CORS must allow the mobile client (in development you can use `origin: true`)
- For production, always point `API_BASE_URL` to an **HTTPS** backend
- Delete doctor also cascades and removes that doctor's patients (backend behavior)

---

## Related Repositories

- **Backend:** [doctor-tracker-backend](https://github.com/sajibsarker-1104003/doctor-tracker-backend)
- **Web Frontend:** [doctor-tracker-client](https://github.com/sajibsarker-1104003/doctor-tracker-client)

---

## Author

**Sajib Sarker**
```
