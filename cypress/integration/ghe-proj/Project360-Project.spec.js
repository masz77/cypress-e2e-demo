/// <reference types="cypress" />

describe('project360 - project tab functionalities', () => {
  // beforeEach('visit the main page and log in', () => {
  //   cy.visit(Cypress.config().baseUrl)
  //   cy.logInCmd('admin','admin').type('{enter}')
  //   cy.url().should('eq',Cypress.config().baseUrl+'admin/dashboard')
  // })
  context('creates new project with details', () => {
    it('enter add new mode', () => {
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
      //check 3 others buttons mat,in/exterior are disabled
      cy.get('div.MuiTabs-flexContainer > a').contains('Material').should('have.attr', 'aria-disabled', 'true')
      cy.get('div.MuiTabs-flexContainer > a').contains('Interiors').should('have.attr', 'aria-disabled', 'true')
      cy.get('div.MuiTabs-flexContainer > a').contains('Exterior').should('have.attr', 'aria-disabled', 'true')
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
      cy.get('div.MuiTabs-flexContainer > a').contains('Material').should('not.have.attr', 'aria-disabled')
      cy.get('div.MuiTabs-flexContainer > a').contains('Interiors').should('not.have.attr', 'aria-disabled')
      cy.get('div.MuiTabs-flexContainer > a').contains('Exterior').should('not.have.attr', 'aria-disabled')

    })
  })

  context('modify projects material', () => {
    it('enter modifying mode', () => {
      //navigate to project
      cy.get('a[href="/admin/project"]').click()
      cy.url().should('contain', 'admin/project')
      
    })
    it('fill in data and save', () => {

    })
  })


})