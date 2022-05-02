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
Cypress.Commands.add('clickAddNewButton', () => {
    cy.get('a[data-test-id="addNewBtn"]').click()
})

//navigate to status
Cypress.Commands.add('navigateTo', (page) => {
    try {
        if(page == 'project' ||page == 'material' ||page == 'project-status') {
            cy.get(`a[href="/admin/${page}"]`).click({force: true})
            cy.url().should('contain', `admin/${page}`)
        } else {
            cy.log ('Allowed value are: project, material, project-status')
        } 
    } catch (error) {
        cy.log ('Allowed value are: project, material, project-status')
    }
}

    // function project() {
    //     cy.get('a[href="/admin/project"]').click()
    //     cy.url().should('contain', 'admin/project')
    // },
    // function material() {
    //     cy.get('a[href="/admin/material"]').click()
    //     cy.url().should('contain', 'admin/material')
    // },
    // function status() {
    //     cy.get('a[href="/admin/project-status"]').click()
    //     cy.url().should('contain', 'admin/project-status')
    // },
)

Cypress.Commands.add('logInAsAdmin', () => {
    cy.visit(Cypress.config().baseUrl, {
        timeout: 20000
    }).its('navigator.language') // yields window.navigator.language
    .should('equal', 'en-US') // asserts the expected value
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

Cypress.Commands.add('isProjectProperties', (expected) => {
    
    const _selector = ['material','interiors','exteriors','sharing']
    try {
        if (expected == 'disabled') {
            for (let i = 0; i < _selector.length; i++) {
                const _element = _selector[i];
                return cy.get(`a[data-test-id="${_element}"]`).should('have.attr', 'aria-disabled', 'true')
            }
        } else if (expected == 'enabled') {
            for (let i = 0; i < _selector.length; i++) {
                const _element = _selector[i];
                return cy.get(`a[data-test-id="${_element}"]`).should('not.have.attr', 'aria-disabled', 'true')
            }
        }
    } catch (error) {
        //!isDisabled
    }
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