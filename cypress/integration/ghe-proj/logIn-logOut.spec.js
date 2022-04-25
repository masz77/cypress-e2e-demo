/// <reference types="cypress" />
// import userData from '../fixtures/account.json'
describe('log in / change password / log out', () => {
    beforeEach('load fixture', () => {
        // cy.visit(Cypress.config().baseUrl)
        cy.fixture('account.json').as('usersData')
        cy.intercept('POST', '/api/v1/user/login').as('logInStatus')
        cy.intercept('POST', 'api/v1/user/profile').as('changePasswordStatus')
    })

    context('log in successfully and log out', () => {
        beforeEach('visit the main page', () => {
            cy.visit(Cypress.config().baseUrl)
        })

        it('1/ has correct username/password -> expect: log in successfully', () => {
            cy.logInCmd('admin', 'admin')
            cy.get('button[data-test-id="signInBtn"]').contains('OK').click()

            cy.wait('@logInStatus').its('response.statusCode').should('be.oneOf', [200])
            //verify url
            cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
        })

        it('2/ has correct username/password -> expect: log in successfully', () => {

            cy.logInCmd('admin', 'admin').type('{enter}')
            //verify url
            cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
        })

        afterEach('log out and assert', () => {
            //log out + verify url
            cy.logOutCmd();
        })
    })

    context('log in -> change password -> log out -> log in with new password -> change to old password -> log out', () => {
        it('log in -> change password fail -> change password success', function () {
            let test1_id = this.usersData.test1.userName
            let test1_oldPwd = this.usersData.test1.currentPassword
            let test1_newPwd = this.usersData.test1.newPassword
            cy.logInCmd(test1_id, test1_oldPwd).type('{enter}')
            //verify url
            cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
            //change password fail
            cy.changePassword(test1_id, '1', '1')
            // cy.intercept('POST', 'api/v1/user/profile').as('changePasswordStatus')
            cy.get('button[data-test-id="saveBtn"]').should('be.visible').click()
            cy.wait('@changePasswordStatus').its('response.statusCode').should('be.oneOf', [500])
            cy.get('div[role="status"]').should('contain', 'Wrong')
            cy.get('body') .type('{esc}')
            // cy.log('old password: ', test1_oldPwd)
            // cy.log('new password: ', test1_newPwd)
            cy.changePassword(test1_id, test1_oldPwd, test1_newPwd)
            //press save
            cy.get('button[data-test-id="saveBtn"]').should('be.visible').click()
            //assert api & pop up
            cy.wait('@changePasswordStatus').its('response.statusCode').should('be.oneOf', [200])
            cy.get('div[role="status"]').should('contain', 'success')
            //close pro5 panel
            // cy.get('button',{timeout: 20000}).contains('Close').should('be.enabled').click()
            cy.get('body') .type('{esc}')
            cy.get('[data-test-id="accSettings"]').should('be.visible')  
            cy.logOutCmd()          

        })

        it('log in with new password -> change to old password', function () {
            let test1_id = this.usersData.test1.userName
            let test1_oldPwd = this.usersData.test1.currentPassword
            let test1_newPwd = this.usersData.test1.newPassword
            cy.logInCmd(test1_id, test1_newPwd).type('{enter}')
            //verify url
            cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
            cy.changePassword(test1_id, test1_newPwd, test1_oldPwd)
            cy.log('old password: ', test1_newPwd)
            cy.log('new password: ', test1_oldPwd)
            //press save
            cy.get('button[data-test-id="saveBtn"]').should('be.visible').click()
            //assert api & pop up
            cy.wait('@logInStatus').its('response.statusCode').should('be.oneOf', [200])
            //close pro5 panel
            // cy.get('button',{timeout: 20000}).contains('Close').should('be.visible').should('be.enabled').click()
            cy.get('body') .type('{esc}')
            
            cy.get('[data-test-id="accSettings"]').should('be.visible')  
            
            cy.logOutCmd() 
        })
    })

    context('log in unsuccessfully', () => {
        beforeEach('visit the main page', () => {
            cy.visit(Cypress.config().baseUrl)
        })
        it('has wrong username -> expect: error message', () => {
            cy.logInCmd('admin123', 'admin').type('{enter}')
            cy.wait('@logInStatus').its('response.statusCode').should('be.oneOf', [500])
            cy.get('div[role="status"]').should('contain', 'Login fail!')
        })

        it('has wrong password -> expect: error message', () => {
            cy.logInCmd('admin', 'admin123').type('{enter}')
            cy.wait('@logInStatus').its('response.statusCode').should('be.oneOf', [500])
            cy.get('div[role="status"]').should('contain', 'Login fail!')
        })
    })

})