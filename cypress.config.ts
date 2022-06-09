import { defineConfig } from 'cypress'

export default defineConfig({
  video: true,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 15000,
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    reportPageTitle: 'Ghe Project Suite',
    embeddedScreenshots: true,
    inlineAssets: true,
    html: true,
    json: false,
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  projectId: 'xbway2',
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://ghe-staging.b2ssolution.com/',
    specPattern: 'cypress/ghe-project-e2e-testing/*.{js,jsx,ts,tsx}',
  },
})
