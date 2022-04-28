/// <reference types="cypress" />

describe('project360 - project tab functionalities', () => {

  context('creates new project with details', () => {
    it('add new', () => {
      // //log in and assert
      // cy.visit(Cypress.config().baseUrl)
      // cy.logInCmd('admin', 'admin').type('{enter}')
      // cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
      cy.logInAsAdmin()
      //navigate to project
      cy.navigateTo('project')
      //click add new
      cy.clickAddNewButton()
      cy.url().should('contain', 'admin/project/new')
      cy.isProjectPropertiesDisabled()
    })

    it.skip('creates new project with details', () => {
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
    
    context('material', () => {
      beforeEach('go to project -> modify the last project', () => {
        //navigate to project
        // cy.get('a[href="/admin/project"]').click()
        cy.navigateTo('project')
        // cy.url().should('contain', 'admin/project')

        //click modify
        cy.get('button[data-test-id="actMod"]').last().click()
        cy.get('div > h5').contains('Project detail').should('be.visible')
        cy.isProjectPropertiesEnabled()
        cy.get('div[role="tablist"] > a[data-test-id="material"]').click()
      })
      it('add new material details', () => {
        cy.get('button').contains('Add new').click()
        // cy.clickAddNewButton()
        //get the master div contain 7 input tag
        //loop thru each input tag and type in value
        cy.get('div[data-test-id="projectMatDetail"] input').each(($el, index, $list)=>{
          if (index == 0) {
            //at 1st element -> dropdown list select
            cy.wrap($el).click()
            cy.get('div[role=presentation] ul[role=listbox] li[role=option]')
              .should('be.visible')
              .last()
              .click()
            
          } else {
            //at other element -> type
            cy.wrap($el).type('69420')
          }
        })
        //save
        cy.get('button[data-test-id="saveBtn"]').click()
      })
      it.skip('copy from other project', () => {
        //more settings button
        cy.get('button[data-test-id="matSettings"]').click()
        //copy from other proj button
        cy.get('li[data-test-id="matCopy"]').click()
      })
      it.skip('modify existing project', () => {

      })
      it.skip('fill in data and save', () => {

      })
    })

    context('interior', () => {
      //add new
      //random name
      //save
      //close
      //assert span Not uploaded image yet
      //modify
      //assert "Edit interior"
      //button upload
      //button contain ok
      //assert  api/v1/interiorview/upload 200
      //assert pop up contain success
      //assert Uploaded file
    })

  })


})