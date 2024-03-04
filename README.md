# Rozrachunki

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description

NextJS web application using a Firebase database, which stores information about various monthly bills and subscriptions, both constant and various per month.

Each bill has following fields:  
Name, monthly or bimonthly, fixed due time, fixed amount.  
Each month has following fields regarding every saved bill identified by its name:  
Due time, amount, attached file

## Installation

- Clone this repository  
- Run `npm install`  
- Create Google Firebase project and enable following services: authentication(create your account), firestore database, storage.  
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

- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Logging into your account is needed to read/write data.
