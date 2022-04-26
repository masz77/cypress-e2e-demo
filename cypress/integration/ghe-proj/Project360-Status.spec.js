/// <reference types="cypress" />

describe('project360 - status tab functionalities', () => {
    // api/v1/realestateprojectstatus
    beforeEach('add api listener', () => {
        const apiEndpoint = '/api/v1/realestateprojectstatus'
        cy.intercept('POST', apiEndpoint).as('projStatusSaveRes')
        cy.intercept('DELETE', apiEndpoint).as('projStatusDeleteRes')
        //on failed event - ignore failed
        // cy.on('fail', (e) => {
        //   console.error(e)
        // })
    })
    context('', () => {

        it('navigate to status -> add new status', () => {

            //log in and assert
            cy.logInAsAdmin()
    
            //navigate to status
            cy.navigateTo().projectStatus
            
            //click add new
            cy.get('a[data-test-id="addNewBtn"]').click()
            cy.get('div').contains('New project status').should('be.visible')
          })

        it('save button when no data entered', () => {

            //try save button when no data entered
            cy.get('button[data-test-id="saveBtn"]').click()
            cy.get('input[name="number"]').should('have.attr','aria-invalid','true')
            cy.get('input[name="name"]').should('have.attr','aria-invalid','true')
          })
          
        it('reset button', () => {

            //try reset button
            cy.fillInDetail(1,'1',null)
            cy.get('button[data-test-id="reset"]').click()
            //assert empty
            cy.get('input[name="number"]').invoke('val').should('be.empty')
            cy.get('input[name="name"]').invoke('val').should('be.empty')
          })

        it('save button', () => {

            //try save button
            cy.fillInDetail('test-number', 'test-name', null)
            cy.get('button[data-test-id="saveBtn"]').click()
            cy.wait('@projStatusSaveRes').its('response.statusCode').should('be.oneOf', [200])
            cy.get('div[role="status"]').contains('Saved success!').should('exist').and('be.visible')
          })

          it('modify', () => {
            //navigate to project
            cy.get('a[href="/admin/project-status"]').click()
            cy.url().should('contain', 'admin/project-status')
    
            //get the last modify button and click
            cy.get('button[data-test-id="actMod"]').last().click()
            cy.contains('Project status detail').should('be.visible')
    
            //try save button
            cy.fillInDetail('modified-number', 'modified-name', null)
            cy.get('button[data-test-id="saveBtn"]').click()
            cy.wait('@projStatusSaveRes').its('response.statusCode').should('be.oneOf', [200])
            cy.get('div[role="status"]').contains('Saved success!').should('exist').and('be.visible')
    
            //navigate to project
            cy.get('a[href="/admin/project-status"]').click()
            cy.url().should('contain', 'admin/project-status')
            let td_element = cy.get('tbody > tr').last().should('be.visible').within (() => {
                cy.get('td').should('contain','modified-number')
                            .should('contain','modified-name')
                            // .should('contain','modified-brand')
            })
          })
    
          it('delete', () => {
            //navigate to project
            cy.get('a[href="/admin/project-status"]').click()
            cy.url().should('contain', 'admin/project-status')
    
            //get the last delete button and click
            cy.get('button[data-test-id="actDel"]').last().click()
            //confirm
            cy.get('button').contains('OK').click()
            //assert
            cy.wait('@projStatusDeleteRes').its('response.statusCode').should('be.oneOf', [200])
            cy.get('div[role="status"]').contains('Deleted').should('exist').and('be.visible')
          })
    })
})