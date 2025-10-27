# 🚀 Playwright CI/CD Testing Project

This project contains a robust automation testing suite using Playwright for both User Interface (UI) and API layer validation. The tests are automatically executed via GitHub Actions (CI/CD).

## 📋 Test Suite Description

The project is structured to be stable, modular, and easy to maintain, clearly separating UI and service tests.

- UI Tests (tests/ui/): Contains end-to-end (e2e) test cases that simulate user interactions within the browser (e.g., login, navigation). It utilizes a Page Object Model (POM) pattern.

- API Tests (tests/api/): Contains tests that validate API endpoints, including authentication (token retrieval) and data verification (e.g., api_books.spec.ts).

## ⚙️ Installation and Local Execution

To install and run the tests locally on your machine, follow these steps:

1. Prerequisites
   Ensure you have Node.js (version 20 or higher) and npm installed.

2. Dependency Installation
   Navigate to the project root and install all Node.js dependencies, including Playwright and its browsers:

-Install all Node.js dependencies (package.json)

npm install

-Install Playwright browsers (Chromium, Firefox, WebKit)

npx playwright install --with-deps

3. Environment Variable Setup
   This project uses a local .env file to handle secrets and credentials for local development.

#### Create a file named .env in the project root with your test credentials:

#### UI Credentials (used by UI tests)

USER_EMAIL="your_test_email@example.com"
USER_PASSWORD="YourPassword!"

#### API Credentials (used by API tests)

USER_NAME="api.username"
PASSWORD="ApiTestPassword$"

Base URLs (Optional, if not configured in playwright.config.ts)

BASE_URL="https://demoqa.com"
CARTO_APP_BASE_URL="https://clausa.app.carto.com/"

4. Running the Tests

You can execute the entire test suite or specific subsets using Playwright commands:

🟢 Run All Tests (UI + API)

npx playwright test

🌐 Run Only UI Tests (Specific Browsers)

-Runs the projects defined in your playwright.config.ts

npx playwright test --project=ui-chromium
npx playwright test --project=ui-firefox

🔒 Run Only API Tests

npx playwright test --project=api-mode

📊 View Test Report

After execution, open the interactive HTML report in your browser:

npx playwright show-report

☁️ Continuous Integration (CI/CD)

The tests are automatically executed via GitHub Actions under the Playwright Tests CI workflow whenever a push is made or a Pull Request is opened against the main or master branches.

Security: Credentials are set up as Repository Secrets in GitHub (UI_USER_EMAIL, API_USERNAME, etc.) and are securely injected into the CI virtual machine.

Artifacts: The workflow uploads Playwright HTML reports as separate artifacts (e.g., html-report-ui-chromium, html-report-api), which are available for download in the Actions tab for 30 days.
