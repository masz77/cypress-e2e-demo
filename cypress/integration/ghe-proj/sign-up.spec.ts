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
  })

  context.only('agency account', () => {
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
          cy.wrap(`username${_anotherRandomAccountNumber}`).as('userName')
          cy.get('[data-test-id="userName"]').clear().type(this.userName);
          cy.get('[data-test-id="signInBtn"]').click();
          assert.equal(interception.response.statusCode, 200)
        }
      })
    })
    it('can log in to created account and create new project', function () {
      cy.logInCmd(this.userName, this.password)
      cy.createNewProject(`new project name of ${this.userName}`, `new project number of ${this.userName}`)
    })
        
    it('can modify material of new project', function () {
      cy.logInCmd(this.userName, this.password)
      //navigate to project
      cy.navigateTo('project')
      //search for the new created project
      cy.searchFor(`new project name of ${this.userName}`)
      //click modify
      cy.get('button[data-test-id="actMod"]').last().click()

      cy.setUpAliasesForMaterialTab()
      cy.get('div[role="tablist"] > a[data-test-id="material"]').click()

      cy.addNewMaterialDetails()

      cy.deleteMaterialFromProjectPage()
    })

    it('can modify interior of new project', function () {
      cy.logInCmd(this.userName, this.password)
      //navigate to project
      cy.navigateTo('project')
      //search for the new created project
      cy.searchFor(`new project name of ${this.userName}`)
      //click modify
      cy.get('button[data-test-id="actMod"]').last().click()

      cy.setUpListener('interior')

      cy.addNew('interior')

      cy.deleteInOrEx('interior')
    })

    it('can modify exterior of new project', function () {
      cy.logInCmd(this.userName, this.password)
      //navigate to project
      cy.navigateTo('project')
      //search for the new created project
      cy.searchFor(`new project name of ${this.userName}`)
      //click modify
      cy.get('button[data-test-id="actMod"]').last().click()

      cy.setUpListener('exterior')

      cy.addNew('exterior')

      cy.deleteInOrEx('exterior')
    })
    it('can delete new project', function () {
      cy.logInCmd(this.userName, this.password)
      cy.intercept('DELETE', `/api/v1/realestateproject`).as('deleteProject')
      cy.deleteProject(this.userName)
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
      cy.deleteUserByAccountName(this.accountName)
    })
  })

  context('notary office account for approval', () => {
    before('setting up account', () => {
      cy.setUpNewAccount()
    })

    it('can create notary office user for approval', function () {
      cy.createNotaryOfficeUser()
    })

    it('log in as admin and approve', function () {
      cy.approveNotaryOfficeAccount(true)
    })

    it('check in user if user have been created yet', function () {
      cy.logInAsAdmin()
      //check in user if user have been created yet
      cy.navigateTo('user')
      cy.searchFor(this.accountName)
      cy.isExistInRow(this.accountName,true)
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
      cy.isExistInRow(this.accountName,true)

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

    context('log in by notary office account and check for legal support logic', () => {
      beforeEach('log in as notary office', function()  {
        cy.logInCmd(this.userName, this.password)
        ///api/v1/legalsupport/update-document
        cy.intercept('POST', '/api/v1/legalsupport/update-document').as('updateDocument')

      })

      it('create new legal support and check for creation logic', function () {
        cy.navigateTo('legal-support')
        cy.clickAddNewButton()
        cy.url().should('contain', 'legal-support/new')
        //assert required field
        cy.get('button[data-test-id="saveBtn"]').click()
        cy.get('input[aria-invalid="true"]').should('have.length', 4)
        cy.get('p').contains(`Field 'Customer address' is required`).should('exist')

        //select last project
        cy.get('[data-testid="ArrowDropDownIcon"]').then(($list) => {
          cy.wrap($list.eq(0)).click({
            force: true
          })
          cy.get('div[role=presentation] ul[role=listbox] li[role=option]')
            .should('be.visible')
            .last()
            .click()
        })
        //name
        const _randomNumber = Math.floor(Math.random() * 1000000000)
        cy.get('input[name="customerName"]').type(`customerName${_randomNumber}`)
        cy.get('input[name="customerIdentity"]').type(_randomNumber.toString())
        cy.get('input[name="customerGender"]')
        cy.get('input[name="customerJob"]').type('customerJob')
        cy.get('input[name="customerPhone"]').type(_randomNumber.toString())
        let _rndInt = Math.floor(Math.random() * 63) + 1

        cy.get('input[name="customerAddressId"]').parent().click().then(() => {
          cy.get(`[data-value="${_rndInt}"]`).click();
        })

        for (let _i = 1; _i <= 4; _i++) {
          cy.get('input[name="customerMaritalStatus"]').parent().click().then(() => {
            cy.get(`[data-value="${_i}"]`).click(); //single = 1, married = 2, widow = 3 4
          })
          cy.get('[data-test-id="saveBtn"]').first().click();

          cy.get('input[type="radio"]').each(function ($el, index, $list) {
            cy.wrap($el).check()
            switch (index + 1) {
              case 1:
                // code block
                if (_i == 2) {
                  cy.checkBoxShouldHaveLength(4)
                } else {
                  cy.checkBoxShouldHaveLength(3)
                }
                break;
              case 2:
                cy.checkBoxShouldHaveLength(7)
                break;
              case 3:
                cy.checkBoxShouldHaveLength(6)
                break;
              case 4:
                cy.checkBoxShouldHaveLength(7)
                break;
            }
          })
        }
      })

      it('delete legal support', function () {
        cy.navigateTo('legal-support')
      })

      it('delete notary office account', function () {
        cy.deleteUserByAccountName(this.accountName)
      })
    })
  })

  context('notary office account for denial', () => {
    before('setting up account', () => {
      cy.setUpNewAccount()
    })

    it('can create agency user for denial', function () {
      cy.createNotaryOfficeUser()
    })

    it('log in as admin and deny', function () {
      cy.approveNotaryOfficeAccount(false)
    })

    it('verifies the account is not created in user tab', function () {
      cy.logInAsAdmin()
      //check in user if user have been created yet
      cy.navigateTo('user')
      cy.searchFor(this.accountName)
      cy.isExistInRow(this.accountName,false)
    })

    it('try log in with the denied account', function () {
      cy.intercept('POST', '/api/v1/user/login').as('logInStatus')
      cy.logInCmd(this.userName, this.password)
      cy.get('[data-test-id="signInBtn"]').click();
      cy.wait('@logInStatus').its('response.statusCode').should('be.oneOf', [500])

    })
  })
})