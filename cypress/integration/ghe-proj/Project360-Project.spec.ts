/// <reference types="cypress" />
// import 'cypress-file-upload';

describe('project360 - project tab functionalities', () => {
  before('setting up project props', function () {
    cy.setUpNewAccount()
  })
  context('creates new project without details', () => {
    it('creates new project without details', function () {
      // //log in and assert
      cy.logInAsAdmin()
      cy.createNewProject(this.projectName, this.projectNumber)
    })
  })

  context('modify projects properties', () => {
    beforeEach('go to project -> modify the last project', () => {
      // cy.visit(Cypress.config().baseUrl)
      //navigate to project
      cy.navigateTo('project')
      //click modify
      cy.get('button[data-test-id="actMod"]').last().click()
      //assert
      cy.isProjectProperties('enabled')
    })

    context('material', () => {
      before('create a material via API to copy from', () => {
        //log in to get auth token at /api/v1/user/login
        cy.request('POST', `${Cypress.config().baseUrl}api/v1/user/login`, {
          "loginName": "admin",
          "password": "admin",
          "remember": false
        })
          .then(
            (response) => {
              // cy.wrap(response.body.data.accessToken).as('accessToken')
              Cypress.env('accessToken', response.body.data.accessToken)
              //get total amount of material
              cy.request({
                method: 'GET',
                url: `${Cypress.config().baseUrl}api/v1/material`,
                headers: {
                  authorization: `Bearer ${Cypress.env('accessToken')}`
                },
              }).then(
                (response) => {
                  cy.log(response.body.data.total)
                  Cypress.env('totalAmountOfMaterial', response.body.data.total)
                })
              //create new project project-to-copy-material
              //req api/v1/realestateproject
              cy.request({
                method: 'POST',
                url: `${Cypress.config().baseUrl}api/v1/realestateproject`,
                headers: {
                  authorization: `Bearer ${Cypress.env('accessToken')}`
                },
                body: {"name":"project-to-copy-material","number":"project-to-copy-material","isSocialHouse":false}
              }).then(
                (response) => {
                  // expect(response.status).to.eq(200)
                  const rndInt : number = Math.floor(Math.random() * parseInt(Cypress.env('totalAmountOfMaterial')) ) + 1
                  Cypress.env('projectID',response.body.data.id)
                  cy.request({
                    method: 'POST',
                    url: `${Cypress.config().baseUrl}api/v1/material/project/${Cypress.env('projectID')}`,
                    headers: {
                      authorization: `Bearer ${Cypress.env('accessToken')}`
                    },
                    body: {"material":{"value":`${rndInt}`}}
                  })
                })

              // cy.request({
              //   method: 'POST',
              //   url: `${Cypress.config().baseUrl}api/v1/material`,
              //   headers: {
              //     authorization: `Bearer ${Cypress.env('accessToken')}`
              //   },
              //   body: {
              //     brand: "test-brand",
              //     name: "material-to-copy",
              //     number: "material-to-copy"
              //   }
              // }).then(
              //   (response) => {
              //     expect(response.status).to.eq(200)
              //   })
              })
            })

      beforeEach('set up api endpoint listener', () => {
        cy.setUpAliasesForMaterialTab()
        //go to material tab of that project
        cy.get('div[role="tablist"] > a[data-test-id="material"]').click()
      })

      it('add new material details', () => cy.addNewMaterialDetails())

      it('modify existing project', () => {
        cy.get('button[data-test-id="actMod"]').last().click()
        const dataTest_modified = '9999'
        //loop thru each input tag and type in value
        cy.get('div[data-test-id="projectMatDetail"] input').each(($el, index, $list) => {
          if (index == 0) {
            cy.wrap($el).invoke('val').should('not.be.empty')
          } else {
            //at other element -> type
            cy.wrap($el).type(dataTest_modified)
          }
        })
        //save
        cy.get('button[data-test-id="saveBtn"]').click()
        cy.wait('@modifyingProject').then((interception) => {
          assert.equal(interception.response.statusCode, 200)
        })
        // then Re-Querying The Page -> expect to havve this or we'll have a query loop
        cy.wait('@thenReQueryingThePage').its('response.statusCode').should('be.oneOf', [200])
        cy.get('div[role="status"]').contains('Saved success!').should('exist').and('be.visible')
      })

      it('delete an existing material from current project', () => cy.deleteMaterialFromProjectPage())

      it('copy material from other project', () => {
        //more settings button
        cy.get('button[data-test-id="matSettings"]').click()
        //copy from other proj button
        cy.get('li[data-test-id="matCopy"]').click()
        //click save when no data entered
        cy.get('button[data-test-id="saveBtn"]').click()
        //dropdown list -> select the last option
        cy.get('button > svg[data-testid="ArrowDropDownIcon"]').click()
        //assert
        cy.get('input[aria-invalid="true"]').type('copy-material')
        
        cy.get('div[role=presentation] ul[role=listbox] li[role=option]')
          .should('be.visible')
          .last()
          .click()
        cy.get('button[data-test-id="saveBtn"]').click()
        cy.wait('@copyMaterialFromOtherProject').then((interception) => {
          assert.equal(interception.response.statusCode, 200)
        })
        // then Re-Querying The Page -> expect to havve this or we'll have a query loop
        cy.wait('@thenReQueryingThePage').its('response.statusCode').should('be.oneOf', [200])
        cy.get('div[role="status"]').contains('Copied').should('exist').and('be.visible')
      })

    })

    context('interior', () => {
      beforeEach('set up api endpoint listener', () => cy.setUpListener('interior'))

      it('add new interior', () => cy.addNew('interior'))


      it('delete existing interior', () => cy.deleteInOrEx('interior'))
    })

    context('exterior', () => {
      beforeEach('set up api endpoint listener', () => cy.setUpListener('exterior'))
      it('add new exteriors', () => cy.addNew('exterior'))

      it('delete existing exteriors', () => cy.deleteInOrEx('exterior'))
    })
    // })

    // context('share', () => {
    //   beforeEach('set up api endpoint listener', () => {
    //     //go to material tab of that project
    //     cy.get('div[role="tablist"] > a[data-test-id="interiors"]').click()
    //     //get projectID
    //     cy.url().then((text) => {
    //       //get project id
    //       const array = text.split('/')
    //       const projectID = array[array.length - 1]
    //       //save material properties inside project
    //       // cy.intercept('POST', `api/v1/material/project/${projectID}`).as('modifyingProject')
    //       //after saving FE will try to re-query the page
    //       // cy.intercept('GET', `api/v1/material/project?p=0&projectId=${projectID}&ps=10`).as('thenReQueryingThePage')
    //       //api/v1/material/project delete route
    //       // cy.intercept('DELETE', `api/v1/material/project`).as('deleteMaterialOfAProject')
    //       // api/v1/material/project/21/copy copy material from existing project
    //       // cy.intercept('POST', `api/v1/material/project/${projectID}/copy`).as('copyMaterialFromOtherProject')

    //     })
    //   })

    //   it('', () => {

    //   })
    // })

    // context('publish', () => {
    //   beforeEach('set up api endpoint listener', () => {
    //     //go to material tab of that project
    //     cy.get('div[role="tablist"] > a[data-test-id="interiors"]').click()
    //     //get projectID
    //     cy.url().then((text) => {
    //       //get project id
    //       const array = text.split('/')
    //       const projectID = array[array.length - 1]
    //       //save material properties inside project
    //       // cy.intercept('POST', `api/v1/material/project/${projectID}`).as('modifyingProject')
    //       //after saving FE will try to re-query the page
    //       // cy.intercept('GET', `api/v1/material/project?p=0&projectId=${projectID}&ps=10`).as('thenReQueryingThePage')
    //       //api/v1/material/project delete route
    //       // cy.intercept('DELETE', `api/v1/material/project`).as('deleteMaterialOfAProject')
    //       // api/v1/material/project/21/copy copy material from existing project
    //       // cy.intercept('POST', `api/v1/material/project/${projectID}/copy`).as('copyMaterialFromOtherProject')

    //     })
    //   })

    //   it('', () => {

    //   })
    // })

    // context('legal info', () => {
    //   beforeEach('set up api endpoint listener', () => {
    //     //go to material tab of that project
    //     cy.get('div[role="tablist"] > a[data-test-id="interiors"]').click()
    //     //get projectID
    //     cy.url().then((text) => {
    //       //get project id
    //       const array = text.split('/')
    //       const projectID = array[array.length - 1]
    //       //save material properties inside project
    //       // cy.intercept('POST', `api/v1/material/project/${projectID}`).as('modifyingProject')
    //       //after saving FE will try to re-query the page
    //       // cy.intercept('GET', `api/v1/material/project?p=0&projectId=${projectID}&ps=10`).as('thenReQueryingThePage')
    //       //api/v1/material/project delete route
    //       // cy.intercept('DELETE', `api/v1/material/project`).as('deleteMaterialOfAProject')
    //       // api/v1/material/project/21/copy copy material from existing project
    //       // cy.intercept('POST', `api/v1/material/project/${projectID}/copy`).as('copyMaterialFromOtherProject')

    //     })
    //   })

    //   it('', () => {

    //   })
    // })

  })

  context('can delete project', () => {
    it('can delete project', function () {
      cy.intercept('DELETE', `/api/v1/realestateproject`).as('deleteProject')
      cy.logInAsAdmin()
      cy.deleteProject(this.projectName)
    })
  })
})