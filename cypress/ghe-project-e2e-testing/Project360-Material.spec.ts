/// <reference types="cypress" />

describe('project360 - material tab functionalities', () => {
    ///api/v1/material
    beforeEach('add api listener', () => {
        cy.intercept('POST', '/api/v1/material').as('matSaveStatus')
        cy.intercept('DELETE', '/api/v1/material').as('matDeleteStatus')
        //on failed event - ignore failed
        // cy.on('fail', (e) => {changeLangToEng
        //   console.error(e)
        // })
    })

      it('add new material', () => {

        //log in and assert
        cy.visit(Cypress.config().baseUrl, {
          onBeforeLoad (win) {
            Object.defineProperty(win.localStorage, 'B2S_SOLUTION_LANGUAGE_CODE', {
              value: 'en'
            })
          }})
        cy.logInCmd('admin', 'admin')
        cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
        //navigate to project
        cy.get('a[href="/admin/material"]').click()
        cy.url().should('contain', 'admin/material')
        
        //click add new
        cy.clickAddNewButton()
        cy.get('div').contains('New material').should('be.visible')
      })

      it('save button when no data entered', () => {

        //try save button when no data entered
        cy.get('button[data-test-id="saveBtn"]').click()
        cy.get('input[name="number"]').should('have.attr','aria-invalid','true')
        cy.get('input[name="name"]').should('have.attr','aria-invalid','true')
      })

      it('reset button', () => {

        //try reset button
        cy.fillInDetail('1','1','1')
        cy.get('button[data-test-id="reset"]').click()
        //assert empty
        cy.get('input[name="number"]').invoke('val').should('be.empty')
        cy.get('input[name="name"]').invoke('val').should('be.empty')
        cy.get('input[name="brand"]').invoke('val').should('be.empty')
      })

      it('save button', () => {

        //try save button
        cy.fillInDetail('test-number', 'test-name', 'test-brand')
        cy.get('button[data-test-id="saveBtn"]').click()
        cy.wait('@matSaveStatus').its('response.statusCode').should('be.oneOf', [200])
        cy.get('div[role="status"]').contains('Saved success!').should('exist').and('be.visible')
      })

      it('modify', () => {
        //navigate to material
        cy.navigateTo('material')
        
        //get the last modify button and click
        cy.get('button[data-test-id="actMod"]').last().click()
        cy.contains('Material detail').should('be.visible')

        //try save button
        const _randomNumber = Math.floor(Math.random() * 10000)

        cy.wrap(_randomNumber).as('randomMaterialNumber')

        cy.fillInDetail(`material-number-${_randomNumber}`, `material-name-${_randomNumber}`, `material-brand-${_randomNumber}`)
        cy.get('button[data-test-id="saveBtn"]').click()
        cy.wait('@matSaveStatus').its('response.statusCode').should('be.oneOf', [200])
        cy.get('div[role="status"]').contains('Saved success!').should('exist').and('be.visible')

        //navigate to material
        // cy.navigateTo('material')
        
        // let td_element = cy.get('tbody > tr').last().should('be.visible').within (() => {
        //     cy.get('td').should('contain','modified-number')
        //                 .should('contain','modified-name')
        //                 .should('contain','modified-brand')
        // })
      })

      it('delete', function () {
        //navigate to material
        cy.navigateTo('material')

        //search for new modified name
        cy.searchFor(this.randomMaterialNumber)
        //get the last delete button and click
        cy.get('button[data-test-id="actDel"]').last().click()
        //confirm
        cy.get('button').contains('OK').click()
        //assert
        cy.wait('@matDeleteStatus').its('response.statusCode').should('be.oneOf', [200])
        cy.get('div[role="status"]').contains('Deleted').should('exist').and('be.visible')
      })
})