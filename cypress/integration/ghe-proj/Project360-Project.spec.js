/// <reference types="cypress" />

describe('project360 - project tab functionalities', () => {
  // beforeEach('visit the main page and log in', () => {
  //   cy.visit(Cypress.config().baseUrl)
  //   cy.logInCmd('admin','admin').type('{enter}')
  //   cy.url().should('eq',Cypress.config().baseUrl+'admin/dashboard')
  // })
  context('creates new project with details', () => {
    it('add new', () => {
      //log in and assert
      cy.visit(Cypress.config().baseUrl)
      cy.logInCmd('admin', 'admin').type('{enter}')
      cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
      //navigate to project
      cy.get('a[href="/admin/project"]').click()
      cy.url().should('contain', 'admin/project')
      //click add new
      cy.get('a[data-test-id="addNewBtn"]').click()
      cy.url().should('contain', 'admin/project/new')
      cy.isProjectPropertiesDisabled()
    })
    it('creates new project with details', () => {
      //fill in required field
      cy.insertRequiredFieldForAddnew('project-number', 'project-name')
      //click reset
      cy.get('button[data-test-id="reset"]').click()
      cy.get('input[name="number"]').should('be.empty')
      cy.get('input[name="name"]').should('be.empty')

      cy.insertRequiredFieldForAddnew('project-number', 'project-name')
      //start listen at api/v1/realestateproject
      cy.intercept('POST', 'api/v1/realestateproject').as('addNewProject')
      cy.get('button[data-test-id="saveBtn"]').click()
      cy.get('div[role="status"]').contains('Saved success!').should('exist').and('be.visible')
      cy.wait('@addNewProject').its('response.statusCode').should('be.oneOf', [200])
      //assert material, in/exteriors are disabled on newly added project
      cy.get('a[data-test-id="material"]').should('not.have.attr', 'aria-disabled')
      cy.get('a[data-test-id="interiors"]').should('not.have.attr', 'aria-disabled')
      cy.get('a[data-test-id="exteriors"]').should('not.have.attr', 'aria-disabled')
      cy.get('a[data-test-id="sharing"]').should('not.have.attr', 'aria-disabled')

    })
  })

  context('modify projects properties', () => {
    // beforeEach('go to project tab', () => {

    // })
    context('material', () => {
      beforeEach('go to project -> modify the last project', () => {
        //navigate to project
        cy.get('a[href="/admin/project"]').click()
        cy.url().should('contain', 'admin/project')
        //click modify
        cy.get('button[data-test-id="actMod"]').last().click()
        cy.get('div > h5').contains('Project detail').should('be.visible')
        cy.isProjectPropertiesEnabled()
        cy.get('div[role="tablist"] > a[data-test-id="material"]').click()
      })
      it('add new', () => {
        cy.get('button').contains('Add new').click()
        //get the master div contain 7 input tag
        //loop thru each input tag and type in value
      })
      it('copy from other project', () => {

      })
      it('modify existing project', () => {

      })
      it('fill in data and save', () => {

      })
    })

    context('interior', () => {

    })

  })


})