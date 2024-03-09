# Installation

- Clone this repository  
- Run `npm install`  
- Create Google Firebase project and enable following services: authentication(create your account), firestore database, storage.  For testing purpose set security rules to allow all read/write operations.
- Create in root folder file named `.env.local` and populate it with your Firebase connection details like this:

```ini
NEXT_PUBLIC_apiKey=""
NEXT_PUBLIC_appId=""
NEXT_PUBLIC_authDomain=""
NEXT_PUBLIC_measurementId=""
NEXT_PUBLIC_messagingSenderId=""
NEXT_PUBLIC_projectId=""
NEXT_PUBLIC_storageBucket=""
```

- Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Logging into account you created is needed to read/write data.

- Change Firebase security rules to protect your data and fit your own use case of this application.
