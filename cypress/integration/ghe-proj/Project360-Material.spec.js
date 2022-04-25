/// <reference types="cypress" />

describe('project360 - material tab functionalities', () => {
    ///api/v1/material
    beforeEach('add api listener', () => {
        cy.intercept('POST', '/api/v1/material').as('matSaveStatus')
        cy.intercept('DELETE', '/api/v1/material').as('matDeleteStatus')

    })
    context('creates new project with details', () => {
      it('add new', () => {
        //log in and assert
        cy.visit(Cypress.config().baseUrl)
        cy.logInCmd('admin', 'admin').type('{enter}')
        cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')

        //navigate to project
        cy.get('a[href="/admin/material"]').click()
        cy.url().should('contain', 'admin/material')
        
        //click add new
        cy.get('a[data-test-id="addNewBtn"]').click()
        cy.get('div').contains('New material').should('be.visible')

        //try save button when no data entered
        cy.get('button[data-test-id="saveBtn"]').click()
        cy.get('input[name="number"]').should('have.attr','aria-invalid','true')
        cy.get('input[name="name"]').should('have.attr','aria-invalid','true')

        //try reset button
        cy.fillInMaterialDetail('1','1','1')
        cy.get('button[data-test-id="reset"]').click()
        //assert empty
        cy.get('input[name="number"]').should('be.empty')
        cy.get('input[name="name"]').should('be.empty')

        //try save button
        cy.fillInMaterialDetail('test-number', 'test-name', 'test-brand')
        cy.get('button[data-test-id="saveBtn"]').click()
        cy.wait('@matSaveStatus').its('response.statusCode').should('be.oneOf', [200])
        cy.get('div[role="status"]').contains('Saved success!').should('exist').and('be.visible')
      })

      it('delete', () => {
        //navigate to project
        cy.get('a[href="/admin/material"]').click()
        cy.url().should('contain', 'admin/material')

        //get the last delete button and click
        cy.get('button[data-test-id="actDel"]').last().click()
        //confirm
        cy.get('button').contains('OK').click()
        //assert
        cy.wait('@matDeleteStatus').its('response.statusCode').should('be.oneOf', [200])
        cy.get('div[role="status"]').contains('Deleted').should('exist').and('be.visible')
      })

      it('modify', () => {
        //navigate to project
        cy.get('a[href="/admin/material"]').click()
        cy.url().should('contain', 'admin/material')
      })
    })
})