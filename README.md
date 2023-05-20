# Secret Session Web App

## Description

This is a web app that allows users to create and view their secrets using Google authentication or local login. It uses Node.js, Express, MongoDB, Passport, and other dependencies to handle the backend logic and data storage. It also uses EJS templates to render the frontend views.

## Installation

To install this app, you need to have Node.js and MongoDB installed on your machine. Then follow these steps:

1. Clone this repository to your local directory.
2. Run `npm install` to install all the dependencies listed in the package.json file.
3. Create a .env file in the root directory and add the following variables:

   - PORT: the port number for the server (default is 3000)
   - DB_URL: the connection string for MongoDB
   - GOOGLE_CLIENT_ID: the client ID for Google OAuth 2.0
   - GOOGLE_CLIENT_SECRET: the client secret for Google OAuth 2.0
   - SESSION_SECRET: a random string for encrypting the session cookies

4. Run `node app.js` to start the server.
5. Open your browser and go to `http://localhost:PORT` (replace PORT with the actual port number).

## Usage

To use this app, you need to register an account using either Google or local login. Then you can create your secret by clicking on the "Submit a Secret" button on the home page. Your secret will be stored in the database and displayed on the home page anonymously.You can log out of your account by clicking on the "Log Out" button.


