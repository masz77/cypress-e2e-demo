/// <reference types="cypress" />
// import userData from '../fixtures/account.json'
describe('log in / change password / log out', () => {
    beforeEach('load fixture', () => {
        // cy.visit(Cypress.config().baseUrl)
        cy.intercept('POST', '/api/v1/user/login').as('logInStatus')
        cy.intercept('POST', '/api/v1/user/profile').as('changePasswordStatus')
    })

    context('log in successfully and log out', () => {
        beforeEach('visit the main page', function () {
            cy.visitTheMainPage()
        })

        it('has correct username/password -> expect: log in successfully', () => {
            cy.logInAsAdmin()
            cy.wait('@logInStatus').its('response.statusCode').should('be.oneOf', [200])
            //verify url
            cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
        })

        it('has correct username/password -> expect: log in successfully', () => {
            cy.logInAsAdmin()
            //verify url
            cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
        })

        afterEach('log out and assert', () => {
            //log out + verify url
            cy.logOutCmd();
        })
    })

    context('change password', () => {
        beforeEach('load account fixture', () => {
            cy.fixture('account.json').as('usersData')
            cy.visitTheMainPage()
        })
        it('change password fail/success on multiple different accounts', function () {
            try {
                const userArray = this.usersData
                const userArrayLength = userArray.length
                cy.log(userArrayLength)
                for (let _indx = 0; _indx < userArrayLength; _indx++) {
                    const user = userArray[_indx];
                    let _id = user.userName
                    let _oldPwd = user.currentPassword
                    let _newPwd = user.newPassword
                    // it('change pass', ()=>{
                        cy.changePasswordToNewPassword(_id, _oldPwd, _newPwd)
                    // }) 
                    // it('change pass again', ()=>{
                        cy.changePasswordToOldPassword(_id, _oldPwd, _newPwd)
                    // })
                }
            } catch (_e) {
                // cy.log(_e)
            }

        })
    })

    context('log in unsuccessfully', () => {
        beforeEach('visit the main page', () => {
            cy.visitTheMainPage()
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