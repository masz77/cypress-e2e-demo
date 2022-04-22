/// <reference types="cypress" />
// import userData from '../fixtures/account.json'
describe ('log in / change password / log out', () => {
    beforeEach('load fixture', () => {
        // cy.visit(Cypress.config().baseUrl)
        cy.fixture('account.json').as('usersData')
      })

    context('log in successfully and log out', () => {
        beforeEach('visit the main page', () => {
          cy.visit(Cypress.config().baseUrl)
        //   cy.fixture('account.json').as('usersData')
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
    
    context('log in -> change password -> log out -> log in with new password -> change to old password -> log out' , () => {
        // beforeEach('visit the main page', () => {

        // })

        it('log in -> change password', function() {
            let test1_id = this.usersData.test1.userName
            let test1_oldPwd = this.usersData.test1.currentPassword
            let test1_newPwd = this.usersData.test1.newPassword
            cy.logInCmd(test1_id,test1_oldPwd).type('{enter}')
            cy.changePassword(test1_id,test1_oldPwd,test1_newPwd)
      

        })

        it('log in with new password -> change to old password', function() {
            let test1_id = this.usersData.test1.userName
            let test1_oldPwd = this.usersData.test1.currentPassword
            let test1_newPwd = this.usersData.test1.newPassword
            cy.logInCmd(test1_id,test1_newPwd).type('{enter}')
            //verify url
            cy.url().should('eq',Cypress.config().baseUrl+'admin/dashboard')
        })
    })
    
    context('log in unsuccessfully', () => {
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
    
})