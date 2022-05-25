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
    //on failed event - ignore failed
    // cy.on('fail', (e) => {changeLangToEng
    //   console.error(e)
    // })
  })

  context('creates new account and approve', () => {
    before('',() => {
            //create reusable var
            const _randomAccountNumber = Math.floor(Math.random() * 10000)
            // const accountName = [`moi gioi ${_randomAccountNumber}`, `vp cong chung ${_randomAccountNumber}`]
            
            cy.wrap(`username${_randomAccountNumber}`).as('accountName')
            cy.wrap(`321ewq;\'`).as('password')
            // const password = '321ewq;\''
            // const phone = Math.floor(Math.random() * 1000000000)
            cy.wrap(Math.floor(Math.random() * 1000000000)).as('phone')
            cy.wrap(`username${_randomAccountNumber}`).as('userName')
            // let userName = `username${_randomAccountNumber}`
    })
    it('create agency account', function()  {
      //test
      cy.get('[href="/sign-up"]').click();
      cy.url().should('contain', '/sign-up')
      cy.get('[data-test-id="name"]').clear().type(this.accountName);
      cy.get('[data-test-id="phone"]').clear().type(this.phone); //10 number
      cy.get('[data-test-id="email"]').clear().type('e@g.c');
      cy.get('[data-test-id="userName"]').clear().type(this.userName);
      cy.get('[data-test-id="password"]').clear().type(this.password);
      cy.get('[data-test-id="repeat_password"]').clear().type(this.password);
      cy.get('input[type="radio"]').then(($list) => {
        $list.eq(0).click() //or Notary office = 1 or Agency = 0
      })
      //add listener to search bar
      // cy.intercept('GET', `/api/v1/requestuser?p=0&ps=10&s=${accountName}`).as('searchQuery')

      cy.get('[data-test-id="signInBtn"]').click();
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
      
      //modify button
      // cy.get('button[data-test-id="actMod"]').last().click()

      // cy.get('[data-test-id="approveBtn"]').click(); //data-test-id="rejectBtn"
      // cy.get('[x1="6"]').click();
      // cy.get('[x2="19"]').click();
      // cy.get('').should('have.text', 'Rejected');
      // cy.get('').should('have.text', 'Approved');
    })
    it('can log in to created account and create new project, then delete it', function()  {
      cy.intercept('DELETE', `/api/v1/realestateproject`).as('deleteProject')

      cy.logInCmd(this.userName,this.password)
      cy.get('[data-test-id="signInBtn"]').click();
      cy.createNewProject(`new project name of ${this.userName}`,`new project number of ${this.userName}`)
      //navigate to project
      cy.navigateTo('project')
      cy.searchFor(this.userName)
      cy.get('button[data-test-id="actDel"]').last().click()///api/v1/realestateproject
      cy.get('button').contains('OK').click()
      cy.wait('@deleteProject').then((interception) => {
          assert.equal(interception.response.statusCode, 200)
      })
      cy.get('div[role="status"]').contains('Deleted').should('exist').and('be.visible')

    })

    it('can delete user', function()  {
    //approve or reject with notary office account
    cy.logInAsAdmin()
    cy.get('a[href="/admin/user"]').click({force: true});
    cy.url().should('contain', '/admin/user')
    //search for account name
    cy.searchFor(this.accountName)
    // cy.get('div[data-test-id="searchDiv"]').click().then (() =>{
    //   cy.get('input[name="search"]').type(this.accountName)
    // })
    // cy.wait(2000)
    // //improvement
    // // cy.wait('@searchQuery').then((interception) => {
    // //     assert.equal(interception.response.statusCode, 200)
    // // })
    // cy.get('tr > td').invoke('text')
    // .then((text)=>{
    //   const divTxt = text;
    //   expect(divTxt).to.contain(this.accountName);
    // })
    
    cy.get('button[data-test-id="actDel"]').last().click()
    cy.get('button').contains('OK').click()
    cy.wait('@deleteUser').then((interception) => {
        assert.equal(interception.response.statusCode, 200)
    })
  })
})
})