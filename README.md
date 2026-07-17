# Water Meter Reading Tracker

A beautiful, local-first web application designed for commercial property managers to track subwater meter readings, calculate consumption and billing details, and export formatted takeoff summaries to Excel.

## Features

- **Local-First & Serverless**: Runs entirely in the web browser, saving all data to your device's local storage. Works offline and requires no database.
- **Auto-Generating Submeter IDs**: Automatically uses the first 4 characters of the property address if a submeter number is not provided.
- **Consumption & Cost Engine**: Supports both cubic feet (`cf`) and gallons (`gal`) with custom billing rates, calculating the exact usage and billing total relative to the last reading.
- **Takeoff Dashboard**: A clean summary panel showing total water billed and consumption patterns, perfect for inputting data into tenant billing/management software.
- **Direct Excel Export**: Generates a professional multi-sheet Excel workbook (`.xlsx`) containing:
  - **Billing Summary & Takeoff**: Detailed ledger for the chosen billing cycle.
  - **Tenant Directory**: Reference list of active stores and unit metadata.
  - **Reading History**: A chronological log of every recorded reading.
- **Data Backup & Portability**: Export your data to a `.json` backup file or restore it from an existing backup to migrate between computers or devices.

## Running Locally

Since this app is built with pure HTML, CSS, and Javascript, it requires no build steps or local compilers.
Simply open `index.html` in any web browser to run the app.

## Hosting on Netlify

This application is ready for Netlify deployment:
1. Push this repository to GitHub/GitLab/Bitbucket.
2. Link your repository in Netlify.
3. Configure the build settings in Netlify:
   - **Build command**: (Leave empty)
   - **Publish directory**: `.` (the root folder)
4. Deploy! Netlify will serve the static site immediately.
