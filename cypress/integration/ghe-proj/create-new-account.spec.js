/// <reference types="cypress" />
Cypress.SelectorPlayground.defaults({
    selectorPriority: ["data-test-id", "data-testid", "id", "class", "attributes"],
})

describe('sign up and role', () => {
    ///api/v1/material
    beforeEach('add api listener', () => {
        cy.visitTheMainPage()
        cy.intercept('POST', '/api/v1/requestuser/action/create').as('createUser')
        cy.intercept('POST', '/api/v1/requestuser/action/Approve').as('approveNewUser')
        cy.intercept('POST', '/api/v1/requestuser/action/Reject').as('rejectNewUser')
        cy.intercept('GET', '/api/v1/requestuser?p=0&ps=10').as('re-queryThePage')
        // cy.intercept('DELETE', '/api/v1/material').as('matDeleteStatus')
        //on failed event - ignore failed
        // cy.on('fail', (e) => {changeLangToEng
        //   console.error(e)
        // })
    })

    context('creates new account and approve', () => {
      it('navigate to material -> add new material', () => {
          const _randomAccountNumber = Math.floor(Math.random()*100)
          const accountName = [`moi gioi ${_randomAccountNumber}`,`vp cong chung ${_randomAccountNumber}`]
          const password = '321ewq;\''
          const phone = Math.floor(Math.random()*1000000000)
          cy.log(phone)
        //   debugger
          cy.get('[href="/sign-up"]').click();
          cy.url().should('contain','/sign-up')
          cy.get('[data-test-id="name"]').clear().type(accountName[0]);
          cy.get('[data-test-id="phone"]').clear().type(phone); //10 number
          cy.get('[data-test-id="email"]').clear().type('e@g.c');
          cy.get('[data-test-id="userName"]').clear().type('testing-login-name');
          cy.get('[data-test-id="password"]').clear().type('321ewq;\'');
          cy.get('[data-test-id="repeat_password"]').clear().type('321ewq;\'');
          cy.get('input[type="radio"]').then( ($list) => {
            $list.eq(1).click()
          }) //or Notary office = 1 or Agency = 0
          cy.get('[data-test-id="signInBtn"]').click();
          cy.wait('@createUser').then((interception) => {
            assert.equal(interception.response.statusCode, 200)
          })
          cy.logInAsAdmin()
          
          cy.get('a[href="/admin/request-user"]').click();
          cy.url().should('contain','/admin/request-user')
          cy.get('button[data-test-id="actMod"]').last().click()
          
          cy.get('[data-test-id="approveBtn"]').click();
          cy.get('[x1="6"]').click();
          cy.get('[x2="19"]').click();
          cy.get('[data-testid="MuiDataTableBodyCell-2-3"] > * > [style="text-align: left;"]').should('have.text', 'creating-new-account-name');
          cy.get('[data-testid="MuiDataTableBodyCell-3-1"] > * > [style="text-align: left;"] > .MuiChip-root > .MuiChip-label').should('have.text', 'Rejected');
          cy.get('[data-testid="MuiDataTableBodyCell-3-0"] > * > [style="text-align: left;"] > .MuiChip-root > .MuiChip-label').should('have.text', 'Approved');
          
      })
})
})