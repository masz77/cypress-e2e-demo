// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('logInCmd', (userName, password) => {
    cy.get('[data-test-id="userName"]').type(userName).should('have.value',userName)
    cy.get('[data-test-id="password"]').type(password)
})

Cypress.Commands.add('logOutCmd', () => {
    //log out
    cy.get('[data-test-id="accSettings"]').click()
    cy.get('[data-test-id="signOutBtn"]').click()
    //verify url
    cy.url().should('eq',Cypress.config().baseUrl+'sign-in')
})

Cypress.Commands.add ('insertRequiredFieldForAddnew', (projNumber,projName) => {

    cy.get('input[name="number"]').type(projNumber)
    cy.get('input[name="name"]').type(projName)
})
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
