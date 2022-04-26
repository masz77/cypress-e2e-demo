// cypress/support/index.d.ts file
// extends Cypress assertion Chainer interface with
// the new assertion methods

/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        insertRequiredFieldForAddnew: (projNumber: string, projName: string) => Cypress.Chainable<JQuery>;
        logOutCmd: () => Cypress.Chainable<JQuery>;
        changePassword: (id: string, oldPassword: string, newPassword: string) => Cypress.Chainable<JQuery>;
        logInCmd: (userName: string, password: string) => Cypress.Chainable<JQuery>;
        isProjectPropertiesEnabled: () => Cypress.Chainable<JQuery>;
        isProjectPropertiesDisabled:() => Cypress.Chainable<JQuery>;
        fillInDetail: (number: string, name: string, brand: string) => Cypress.Chainable<JQuery>;
        logInAsAdmin: () => Cypress.Chainable<JQuery>;
        navigateTo: () => Cypress.Chainable<JQuery>;
        projectStatus: () => Cypress.Chainable<JQuery>;
    }
  }