This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Museum Ticketing System

A comprehensive web application for museum ticketing management with role-based authentication and Firebase integration.

## Features

- **Role-based Authentication**
  - Admin accounts with museum management capabilities
  - Regular user accounts for basic functionality
  
- **Admin Features**
  - Add new museums with detailed information
  - Manage museum data (location, timings, facilities)
  - Configure ticket types and pricing
  
- **User Features**
  - Browse available museums
  - View museum details and ticket information
  - Import museum data from JSON file
  
- **Firebase Integration**
  - Authentication and user management
  - Firestore database for storing museum information
  - Role-based access control

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Firebase (Auth, Firestore)
- Tailwind CSS
- shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase account

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd museum-ticketing
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your Firebase project:
   - Create a project in the Firebase console
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Add your Firebase config to `src/lib/firebase.ts`

4. Start the development server:
   ```
   npm run dev
   ```

## Setting Up Admin Access

### Option 1: Using the Admin Setup Page (Recommended)

1. Start the application and navigate to `/admin-setup`
2. Fill in your desired admin email and password
3. Click "Create Admin Account"
4. Use these credentials to log in with admin privileges

### Option 2: Using the Command Line Script

1. Edit `src/scripts/create-admin.ts` to set your desired admin email and password
2. Run the script:
   ```
   npx ts-node src/scripts/create-admin.ts
   ```
3. Use these credentials to log in with admin privileges

## Using the Application

### As an Admin

1. **Login**: Use your admin credentials at `/login`
2. **Dashboard**: View imported museums
3. **Add Museums**: Use the "Add Museum" button in the navbar or go to `/admin`
4. **Import Data**: Use the "Import Data" button or go to the "Database Import" tab on the dashboard

### As a Regular User

1. **Register**: Create a new account at `/register`
2. **Login**: Use your credentials at `/login`
3. **Dashboard**: View imported museums
4. **Import Data**: Use the "Import Data" button to import museums from data.json

## Project Structure

- `/src/app`: Next.js app router pages and layouts
- `/src/components`: Reusable UI components
  - `/ui`: Base UI components
  - `/auth`: Authentication components
  - `/admin`: Admin-only components
  - `/dashboard`: Dashboard components
- `/src/lib`: Utility functions and configurations
  - `firebase.ts`: Firebase configuration and utility functions
  - `seed-database.ts`: Database seeding functionality
- `/src/context`: React context providers
  - `AuthContext.tsx`: Authentication state management
- `/src/scripts`: Utility scripts
  - `create-admin.ts`: Script for creating admin accounts

## License

[MIT](LICENSE)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
