/// <reference types="cypress" />

describe('log in successfully and log out', () => {
    beforeEach('visit the main page', () => {
      cy.visit(Cypress.config().baseUrl)
    })
  
    it('1/ has correct username/password -> expect: log in successfully', () => {

        cy.logInCmd('admin','admin')
        //verify status code
        cy.intercept('POST','/api/v1/user/login').as('logInStatus')

        cy.get('button[data-test-id="signInBtn"]').contains('OK').click()

        cy.wait('@logInStatus').its('response.statusCode').should('be.oneOf', [200])
        //verify url
        cy.url().should('eq',Cypress.config().baseUrl+'admin/dashboard')
    })

    it('2/ has correct username/password -> expect: log in successfully', () => {

        cy.logInCmd('admin','admin').type('{enter}')
        //verify url
        cy.url().should('eq',Cypress.config().baseUrl+'admin/dashboard')
    })

    afterEach ('log out and assert', () => {
        //log out + verify url
        cy.logOutCmd();
    })
})

describe('log in unsuccessfully', () => {
    beforeEach('visit the main page', () => {
      cy.visit(Cypress.config().baseUrl)
    })
    it('has wrong username -> expect: error message', () => {
        cy.intercept('POST','/api/v1/user/login').as('logInStatus')

        cy.logInCmd('admin123','admin').type('{enter}')
        cy.wait('@logInStatus').its('response.statusCode').should('be.oneOf', [500])
        cy.get('div[role="status"]').should('contain','Login fail!')
    })

    it('has wrong password -> expect: error message', () => {
        cy.intercept('POST','/api/v1/user/login').as('logInStatus')

        cy.logInCmd('admin','admin123').type('{enter}')
        cy.wait('@logInStatus').its('response.statusCode').should('be.oneOf', [500])
        cy.get('div[role="status"]').should('contain','Login fail!')
    })
})
