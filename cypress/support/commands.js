/// <reference types="cypress" />

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


//navigate to status
Cypress.Commands.add('navigateTo',  function projectStatus () {
    cy.get('a[href="/admin/project-status"]').click()
    cy.url().should('contain', 'admin/project-status')
},
function project () {
    cy.get('a[href="/admin/project"]').click()
    cy.url().should('contain', 'admin/project')
},
function material () {
    cy.get('a[href="/admin/material"]').click()
    cy.url().should('contain', 'admin/material')
},

)

Cypress.Commands.add('logInAsAdmin', () => {
    cy.visit(Cypress.config().baseUrl, {timeout: 15000})
    cy.logInCmd('admin', 'admin').type('{enter}')
    cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
})

Cypress.Commands.add('fillInDetail', (number, name, brand) => {
    if (brand == null) {
        cy.get('input[name="number"]').clear().type(number)
        cy.get('input[name="name"]').clear().type(name)
    } else {
        cy.get('input[name="number"]').clear().type(number)
        cy.get('input[name="name"]').clear().type(name)
        cy.get('input[name="brand"]').clear().type(brand)
    }
})

// Cypress.Commands.overwrite('fillInDetail', (number, name) => {
//     cy.get('input[name="number"]').clear().type(number)
//     cy.get('input[name="name"]').clear().type(name)
// })

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
    cy.get('[data-test-id="userName"]').clear().type(userName).should('have.value', userName)
    cy.get('[data-test-id="password"]').clear().type(password)
})

Cypress.Commands.add('changePassword', (id, oldPassword, newPassword) => {
    //verify url
    cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
    cy.get('[data-test-id="accSettings"]').click()
    cy.get('div[data-test-id="userProfileBtn"]').should('be.visible').click()
    cy.get('input[name="loginName"]').should('have.value', id)
    cy.get('input[name="password"]').clear().type(oldPassword)
    cy.get('input[name="newPassword"]').clear().type(newPassword)
    cy.get('input[name="repeatPassword"]').clear().type(newPassword)
})


Cypress.Commands.add('logOutCmd', () => {
    //log out
    cy.get('[data-test-id="accSettings"]').click()
    cy.get('[data-test-id="signOutBtn"]').click()
    //verify url
    cy.url().should('eq', Cypress.config().baseUrl + 'sign-in')
})

Cypress.Commands.add('insertRequiredFieldForAddnew', (projNumber, projName) => {

    cy.get('input[name="number"]').type(projNumber)
    cy.get('input[name="name"]').type(projName)
})

// declare namespace Cypress {
//     interface Chainable {
//         insertRequiredFieldForAddnew: (projNumber: string, projName: string) => Cypress.Chainable<JQuery>;
//         logOutCmd: () => Cypress.Chainable<JQuery>;
//         changePassword: (id: string, oldPassword: string, newPassword: string)
//     }
// }

