/// <reference types="cypress" />
// import 'cypress-file-upload';

describe('project360 - project tab functionalities', () => {

  context('creates new project with details', () => {
    it('log in', () => {
      // //log in and assert
      cy.logInAsAdmin()
    })

    it.skip('add new', () => {
      //navigate to project
      cy.navigateTo('project')
      //click add new
      cy.clickAddNewButton()
      cy.url().should('contain', 'admin/project/new')
      cy.isProjectProperties('disabled')
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
      cy.isProjectProperties('enabled')
    })
  })

  context('modify projects properties', () => {
    beforeEach('go to project -> modify the last project', () => {
      //navigate to project
      cy.navigateTo('project')
      //click modify
      cy.get('button[data-test-id="actMod"]').last().click()
      //assert
      cy.isProjectProperties('enabled')
    })

    context.skip('material', () => {
      beforeEach('set up api endpoint listener', () => {

        //get projectID
        cy.url().then((text) => {
          //get project id
          const array = text.split('/')
          const projectID = array[array.length - 1]
          //save material properties inside project
          cy.intercept('POST', `api/v1/material/project/${projectID}`).as('modifyingProject')
          //after saving FE will try to re-query the page
          cy.intercept('GET', `api/v1/material/project?p=0&projectId=${projectID}&ps=10`).as('thenReQueryingThePage')
          //api/v1/material/project delete route
          cy.intercept('DELETE', `api/v1/material/project`).as('deleteMaterialOfAProject')
          // api/v1/material/project/21/copy copy material from existing project
          cy.intercept('POST', `api/v1/material/project/${projectID}/copy`).as('copyMaterialFromOtherProject')
        })
        //go to material tab of that project
        cy.get('div[role="tablist"] > a[data-test-id="material"]').click()
      })

      it('add new material details', () => {
        let dataTest = [null, '69,420']
        cy.get('button').contains('Add new').click()
        //click save right away -> should fail
        cy.get('button[data-test-id="saveBtn"]').click()
        //assert api res code = 500
        cy.wait('@modifyingProject').its('response.statusCode').should('be.oneOf', [500])
        //get the master div contain 7 input tag
        //loop thru each input tag and type in value
        cy.get('div[data-test-id="projectMatDetail"] input').each(($el, index, $list) => {
          if (index == 0) {
            //at 1st element -> dropdown list select
            cy.wrap($el).click()
            cy.get('div[role=presentation] ul[role=listbox] li[role=option]')
              .should('be.visible')
              .last()
              .click()
          } else {
            //at other element -> type
            cy.wrap($el).type(dataTest[1])
          }
        })
        //assert data entered
        cy.get('div[data-test-id="projectMatDetail"] input').each(($el, index, $list) => {
          if (index == 0) {
            cy.wrap($el).invoke('val').should('not.be.empty')
          } else {
            cy.wrap($el).invoke('val').should('eq', dataTest[1])
            // cy.wrap($el).should('eq',dataTest[1])
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

      it('delete an existing material from current project', () => {
        //click last delete button
        cy.get('button[data-test-id="actDel"]').last().click()
        //confirm
        cy.get('button').contains('OK').click()
        // Assertion
        cy.wait('@deleteMaterialOfAProject').then((interception) => {
          assert.equal(interception.response.statusCode, 200)
        })
        // then Re-Querying The Page -> expect to havve this or we'll have a query loop
        cy.wait('@thenReQueryingThePage').its('response.statusCode').should('be.oneOf', [200])
        cy.get('div[role="status"]').contains('Deleted successfully!').should('exist').and('be.visible')
      })

      it('copy material from other project', () => {
        //more settings button
        cy.get('button[data-test-id="matSettings"]').click()
        //copy from other proj button
        cy.get('li[data-test-id="matCopy"]').click()
        //click save when no data entered
        cy.get('button[data-test-id="saveBtn"]').click()
        //assert
        cy.get('input[aria-invalid="true"]').should('exist')
        //dropdown list -> select the last option
        cy.get('button > svg[data-testid="ArrowDropDownIcon"]').click()
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
      beforeEach('set up api endpoint listener', () => {

        //get projectID
        cy.url().then((text) => {
          //get project id
          const array = text.split('/')
          const projectID = array[array.length - 1]
          cy.log(`projectID = ${projectID}`)
          //save new interior properties inside project
          cy.intercept('POST', `/api/v1/interiorview/project/${projectID}`).as('saveAsNewInterior')
          //upload api
          cy.intercept('POST', `/api/v1/interiorview/upload`).as('uploadAPI')
          //re-query the page
          cy.intercept('GET', `/api/v1/interiorview?p=0&projectId=${projectID}&ps=10`).as('refreshPage')
        })
        //go to material tab of that project
        cy.get('div[role="tablist"] > a[data-test-id="interiors"]').click()
      })
      it('add new interior', function () {
        const typeARandomName = 'auto-typed new interior'
        //add new
        cy.get('button').contains('Add new').click()
        //random name
        cy.get('input[name="name"]').type(typeARandomName)
        //save
        cy.get('button[data-test-id="saveBtn"]').click()
        //assert api
        cy.wait('@saveAsNewInterior').its('response.statusCode').should('be.oneOf', [200])
        //press escape
        cy.get('body').type('{esc}');
        //wait /api/v1/interiorview?p=0&projectId=22&ps=10
        cy.wait('@refreshPage').its('response.statusCode').should('be.oneOf', [200])
        //need to optimize
        cy.wait(2000)
        //assert span Not uploaded image yet
        cy.get('tr[data-test-id="row"]').last().within(() => {
          //get the span INSIDE the row
          cy.get('span').contains('Not uploaded image yet').should('exist')
          //click modify
          cy.get('button[data-test-id="actMod"]').click()
        })

        //assert the interior name
        cy.get('input[name="name"]').invoke('val').should('eq', typeARandomName)
        //button upload
        cy.fixture('/images/example.jpg', {
          encoding: 'binary'
        }).as('uploadImg')
        cy.get('input[type="file"]')
          .selectFile('@uploadImg', {
            force: true
          })
        //button contain ok
        cy.get('button').contains('OK').click()

        //wait till close button clickable
        cy.get('.Button-inherit').contains('Close').as('closeBtn')
        cy.get('@closeBtn').should('have.attr', 'disabled')
        cy.get('@closeBtn', {
          timeout: 5 * 60 * 60000
        }).should('not.have.attr', 'disabled')
        cy.get('@closeBtn').click()
        //assert pop up contain success (msg = Upload success)
        cy.get('div[role="status"]', {
          timeout: 10000
        }).contains('Upload success').should('exist').and('be.visible')

        //assert  api/v1/interiorview/upload 200 until its body contain data.continue = false
        // cy.wait('@uploadAPI',{timeout: 30000}).then((interception) => {
        //   const _body = interception.response.body
        //   // cy.log(_body.data)
        //   // expect(interception.response.body).prop('data')[2].to.eq(false)
        //   // interception.response.body.data.continue
        // })
        //assert Uploaded file
        //need to optimize
        cy.wait('@refreshPage').its('response.statusCode').should('be.oneOf', [200])

        cy.wait(2000)
        //assert span Not uploaded image yet
        cy.get('tr[data-test-id="row"]').last().within(() => {
          //get the span INSIDE the row
          cy.get('span').contains('Uploaded file').should('exist').and('be.visible')
        })
        //Upload fail
      })

    })

    // context.skip('exterior', () => {      
    //   beforeEach('set up api endpoint listener', () => {

    //   //get projectID
    //   cy.url().then((text) => {
    //     //get project id
    //     const array = text.split('/')
    //     const projectID = array[array.length - 1]
    //     //save material properties inside project
    //     // cy.intercept('POST', `api/v1/material/project/${projectID}`).as('modifyingProject')
    //     //after saving FE will try to re-query the page
    //     // cy.intercept('GET', `api/v1/material/project?p=0&projectId=${projectID}&ps=10`).as('thenReQueryingThePage')
    //     //api/v1/material/project delete route
    //     // cy.intercept('DELETE', `api/v1/material/project`).as('deleteMaterialOfAProject')
    //     // api/v1/material/project/21/copy copy material from existing project
    //     // cy.intercept('POST', `api/v1/material/project/${projectID}/copy`).as('copyMaterialFromOtherProject')

    //   })
    //         //go to material tab of that project
    //         cy.get('div[role="tablist"] > a[data-test-id="interiors"]').click()
    // })

    // it('', () => {

    // })

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
})