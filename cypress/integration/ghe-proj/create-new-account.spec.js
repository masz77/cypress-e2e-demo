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
    cy.intercept('GET', '/api/v1/requestuser?p=0&ps=10').as('requeryThePage')
    cy.intercept('DELETE', 'api/v1/user').as('deleteUser')

    // cy.intercept('DELETE', '/api/v1/material').as('matDeleteStatus')
  })

  context('agency account', () => {
    before('setting up account', () => {
      cy.setUpNewAccount()
    })
    it('create agency account', function () {
      //add listener to search bar
      // cy.intercept('GET', `/api/v1/requestuser?p=0&ps=10&s=${accountName}`).as('searchQuery')

      //fill in data and type of reg, 0 for agency | 1 for notary
      cy.signUpFunc(this.accountName, this.phone, this.userName, this.password, 0)
      //if user exist, generate another random user name
      cy.wait('@createUser').then((interception) => {
        try {
          assert.equal(interception.response.statusCode, 200)
        } catch (error) {
          let _anotherRandomAccountNumber = Math.floor(Math.random() * 100)
          // userName = `username${_anotherRandomAccountNumber}`
          cy.wrap(`username${_anotherRandomAccountNumber}`).as('userName')

          cy.get('[data-test-id="userName"]').clear().type(this.userName);
          cy.get('[data-test-id="signInBtn"]').click();
          assert.equal(interception.response.statusCode, 200)
        }
      })
    })
    it('can log in to created account and create new project, then delete it', function () {
      cy.intercept('DELETE', `/api/v1/realestateproject`).as('deleteProject')

      cy.logInCmd(this.userName, this.password)
      cy.get('[data-test-id="signInBtn"]').click();
      cy.createNewProject(`new project name of ${this.userName}`, `new project number of ${this.userName}`)
      //navigate to project
      cy.navigateTo('project')
      cy.searchFor(this.userName)
      cy.get('button[data-test-id="actDel"]').last().click() ///api/v1/realestateproject
      cy.get('button').contains('OK').click()
      cy.wait('@deleteProject').then((interception) => {
        assert.equal(interception.response.statusCode, 200)
      })
      cy.get('div[role="status"]').contains('Deleted').should('exist').and('be.visible')

    })
    it('check for account duplication', function () {
      //fill in data and type of reg, 0 for agency | 1 for notary
      cy.signUpFunc(this.accountName, this.phone, this.userName, this.password, 0)
      //if user exist, generate another random user name
      cy.wait('@createUser').then((interception) => {
        assert.equal(interception.response.statusCode, 500)
      })
    })

    it('can delete agency user', function () {
      //approve or reject with notary office account
      cy.logInAsAdmin()
      cy.get('a[href="/admin/user"]').click({
        force: true
      });
      cy.url().should('contain', '/admin/user')
      //search for account name
      cy.searchFor(this.accountName)

      cy.get('button[data-test-id="actDel"]').last().click()
      cy.get('button').contains('OK').click()
      cy.wait('@deleteUser').then((interception) => {
        assert.equal(interception.response.statusCode, 200)
      })
    })
  })

  context.only('notary office account for approval', () => {
    before('setting up account', () => {
      cy.setUpNewAccount()
    })
    it.only('can create agency user for approval', function () {
      cy.signUpFunc(this.accountName, this.phone, this.userName, this.password, 1)
      cy.wait('@createUser').then((interception) => {
        assert.equal(interception.response.statusCode, 200)
      })
      cy.get('div[role="status"]').contains('please wait for approval').should('exist').and('be.visible')
    })

    it.only('log in as admin and approve', function () {
      cy.logInAsAdmin()
      cy.navigateTo('request-user')
      cy.searchFor(this.accountName)

      //modify button
      cy.get('button[data-test-id="actMod"]').last().click()

      cy.get('[data-test-id="approveBtn"]').click(); //data-test-id="rejectBtn"
      //approveNewUser
      cy.wait('@approveNewUser').then((interception) => {
        assert.equal(interception.response.statusCode, 200)
      })
      cy.get('span').contains('Approved').should('exist'); //Rejected


    })

    it('check in user if user have been created yet', function () {
      cy.logInAsAdmin()
      //check in user if user have been created yet
      cy.navigateTo('user')
      cy.searchFor(this.accountName)
    })

    it('check for duplication', function () {
      cy.signUpFunc(this.accountName, this.phone, this.userName, this.password, 1)
      cy.wait('@createUser').then((interception) => {
        assert.equal(interception.response.statusCode, 200)
      })
      cy.get('div[role="status"]').contains('please wait for approval').should('exist').and('be.visible')
      //log in as admin and approve
      cy.logInAsAdmin()
      cy.navigateTo('request-user')
      cy.searchFor(this.accountName)

      //modify button
      cy.get('button[data-test-id="actMod"]').last().click()

      cy.get('[data-test-id="approveBtn"]').click(); //data-test-id="rejectBtn"
      //approveNewUser
      cy.wait('@approveNewUser').then((interception) => {
        assert.equal(interception.response.statusCode, 500)
      })
      cy.get('div[role="status"]').contains('existing').should('exist').and('be.visible')
      cy.get('[data-test-id="rejectBtn"]').click(); //data-test-id="rejectBtn"
      //rejectNewUser
      cy.wait('@rejectNewUser').then((interception) => {
        assert.equal(interception.response.statusCode, 200)
      })
    })

    it('log in as notary office and verify logic in legal support', function () {

    })

    it('delete notary office account', function () {

    })
  })

  context('notary office account for denial', () => {
    before('setting up account', () => {
      cy.setUpNewAccount()
    })

    it('can create agency user for denial', function () {
      cy.signUpFunc(this.accountName, this.phone, this.userName, this.password, 1)
      cy.wait('@createUser').then((interception) => {
        assert.equal(interception.response.statusCode, 200)
      })
      cy.get('div[role="status"]').contains('please wait for approval').should('exist').and('be.visible')
    })

    it('log in as admin and deny', function () {

    })

    it('verifies the account is not created in user tab', function () {

    })

    it('try log in with the denied account', function () {

    })
  })
})