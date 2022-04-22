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
Cypress.Commands.add('isProjectPropertiesDisabled', () => {
    //let isDisabled = true;
    try {
    //check 3 others buttons mat,in/exterior are disabled
    cy.get('a[data-test-id="material"]').should('have.attr', 'aria-disabled', 'true')
    cy.get('a[data-test-id="interiors"]').should('have.attr', 'aria-disabled', 'true')
    cy.get('a[data-test-id="exteriors"]').should('have.attr', 'aria-disabled', 'true')
    cy.get('a[data-test-id="sharing"]').should('have.attr', 'aria-disabled', 'true')
    
    } catch (error) {
        //!isDisabled
    }
//return isDisabled
})

Cypress.Commands.add('isProjectPropertiesEnabled', () => {
   
    try {
    
        //assert material, in/exteriors are disabled on newly added project
        cy.get('a[data-test-id="material"]').should('not.have.attr', 'aria-disabled')
        cy.get('a[data-test-id="interiors"]').should('not.have.attr', 'aria-disabled')
        cy.get('a[data-test-id="exteriors"]').should('not.have.attr', 'aria-disabled')
        cy.get('a[data-test-id="sharing"]').should('not.have.attr', 'aria-disabled')
    } catch (error) {
       
    }
})


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
