/// <reference types="cypress" />

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('changePasswordToOldPassword', function changePasswordToOldPassword(test_id, test_oldPwd, test_newPwd) {
    cy.logInCmd(test_id, test_newPwd).type('{enter}')
    //verify url
    cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')

    cy.changePassword(test_id, test_newPwd, test_oldPwd)
    // cy.log('old password: ', test1_newPwd)
    // cy.log('new password: ', test1_oldPwd)
    //press save
    cy.get('button[data-test-id="saveBtn"]').should('be.visible').click()
    //assert api & pop up
    cy.wait('@logInStatus').its('response.statusCode').should('be.oneOf', [200])
    //close pro5 panel
    // cy.get('button',{timeout: 20000}).contains('Close').should('be.visible').should('be.enabled').click()
    cy.get('body').type('{esc}')
    cy.get('[data-test-id="accSettings"]').should('be.visible')
    cy.logOutCmd()
})

Cypress.Commands.add('changePasswordToNewPassword', function changePasswordToNewPassword(test_id, test_oldPwd, test_newPwd) {
    ///log in -> change password from CURRENT to NEW -> log out
    //log in
    cy.logInCmd(test_id, test_oldPwd).type('{enter}')
    //verify url
    cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
    //change password fail
    cy.changePassword(test_id, '1', '1')
    // cy.intercept('POST', 'api/v1/user/profile').as('changePasswordStatus')
    cy.get('button[data-test-id="saveBtn"]').should('be.visible').click()
    cy.wait('@changePasswordStatus',).its('response.statusCode').should('be.oneOf', [500])
    cy.get('div[role="status"]').should('contain', 'Wrong')
    cy.get('body').type('{esc}')
    cy.changePassword(test_id, test_oldPwd, test_newPwd)
    //press save
    cy.get('button[data-test-id="saveBtn"]').should('be.visible').click()
    //assert api & pop up
    cy.wait('@changePasswordStatus').its('response.statusCode').should('be.oneOf', [200])
    cy.get('div[role="status"]').should('contain', 'success')
    //close pro5 panel
    // cy.get('button',{timeout: 20000}).contains('Close').should('be.enabled').click()
    cy.get('body').type('{esc}')
    cy.get('[data-test-id="accSettings"]').should('be.visible')
    cy.logOutCmd()
})

//add new func in interior or exterior
Cypress.Commands.add('addNew', (InteriorOrExterior) => {
    const typeARandomName = `auto-typed new ${InteriorOrExterior}`
    //add new
    cy.get('button').contains('Add new').click()
    //random name
    cy.get('input[name="name"]').type(typeARandomName)
    //save
    cy.get('button[data-test-id="saveBtn"]').click()
    //assert api
    cy.wait('@saveAsNew').its('response.statusCode').should('be.oneOf', [200])
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
    cy.fixture(`/images/${InteriorOrExterior}-example.jpg`, {
        encoding: null
    }).as('uploadImg')
    cy.get('input[type="file"]')
        .selectFile('@uploadImg', {
            force: true,
            // encoding: 'binary',
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

//delete func in interior or exterior
Cypress.Commands.add('deleteInOrEx', function deleteInOrEx(InOrEx) {
    cy.url().should('contain', InOrEx)
    cy.get('button[data-test-id="actDel"]').last().click()
    cy.get('button').contains('OK').click()
    //deleteInterior api
    cy.wait('@delete').its('response.statusCode').should('be.oneOf', [200])
    // then Re-Querying The Page -> expect to have this or we'll have a query loop
    cy.wait('@refreshPage').its('response.statusCode').should('be.oneOf', [200])
    //Deleted successfully
    cy.get('div[role="status"]').contains('Deleted successfully').should('exist').and('be.visible')
})
//set up before each in interior or exterior
Cypress.Commands.add('setUpListener', function setUpListener(inOrEx) {
    //get projectID
    cy.url().then((text) => {
        //get project id
        const array = text.split('/')
        const projectID = array[array.length - 1]
        cy.log(`projectID = ${projectID}`)
        //save new interior properties inside project
        cy.intercept('POST', `/api/v1/${inOrEx}view/project/${projectID}`).as('saveAsNew')
        //delete an interior at /api/v1/interiorview
        cy.intercept('DELETE', `/api/v1/${inOrEx}view`).as('delete')
        //upload api
        cy.intercept('POST', `/api/v1/${inOrEx}view/upload`).as('uploadAPI')
        //re-query the page
        cy.intercept('GET', `/api/v1/${inOrEx}view?p=0&projectId=${projectID}&ps=10`).as('refreshPage')
    })
    //go to material tab of that project
    cy.get(`div[role="tablist"] > a[data-test-id="${inOrEx}s"]`).click()
})


Cypress.Commands.add('clickAddNewButton', () => {
    cy.get('a[data-test-id="addNewBtn"]').click()
})

//navigate to status
Cypress.Commands.add('navigateTo', (page) => {
        try {
            if (page == 'project' || page == 'material' || page == 'project-status') {
                cy.get(`a[href="/admin/${page}"]`).click({
                    force: true
                })
                cy.url().should('contain', `admin/${page}`)
            } else {
                cy.log('Allowed value are: project, material, project-status')
            }
        } catch (error) {
            cy.log('Allowed value are: project, material, project-status')
        }
    }

    // function project() {
    //     cy.get('a[href="/admin/project"]').click()
    //     cy.url().should('contain', 'admin/project')
    // },
    // function material() {
    //     cy.get('a[href="/admin/material"]').click()
    //     cy.url().should('contain', 'admin/material')
    // },
    // function status() {
    //     cy.get('a[href="/admin/project-status"]').click()
    //     cy.url().should('contain', 'admin/project-status')
    // },
)

Cypress.Commands.add('changeLangToEng', () => {
    cy.get('button[type="button"] img').click()
    cy.get('div[role="button"]').contains('English').click()
})

Cypress.Commands.add('logInAsAdmin', () => {
    cy.visitTheMainPage()
    // .its('navigator.language') // yields window.navigator.language
    // .should('equal', 'en-US') // asserts the expected value
    cy.logInCmd('admin', 'admin')
    // .type('{enter}')
    cy.get('button[data-test-id="signInBtn"]').click()
    cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
})

Cypress.Commands.add('fillInDetail', (number, name, brand) => {
    if (brand == null) {
        cy.get('input[name="number"]').clear().type(number)
        cy.get('input[name="name"]').clear().type(name)
    } else {
        cy.get('input[name="number"]').clear().type(number)
        cy.get('input[name="name"]').clear().type(name)
        cy.get('input[name="brand"]').clear().type(brand)
    }
})

// Cypress.Commands.overwrite('fillInDetail', (number, name) => {
//     cy.get('input[name="number"]').clear().type(number)
//     cy.get('input[name="name"]').clear().type(name)
// })

Cypress.Commands.add('isProjectProperties', (expected) => {

    const _selector = ['material', 'interiors', 'exteriors', 'sharing', 'legal']
    try {
        if (expected == 'disabled') {
            for (let i = 0; i < _selector.length; i++) {
                const _element = _selector[i];
                cy.get(`a[data-test-id="${_element}"]`).should('have.attr', 'aria-disabled', 'true')
            }
        } else if (expected == 'enabled') {
            for (let i = 0; i < _selector.length; i++) {
                const _element = _selector[i];
                cy.get(`a[data-test-id="${_element}"]`).should('not.have.attr', 'aria-disabled', 'true')
            }
        }
    } catch (error) {
        cy.log(error)
    }
})

Cypress.Commands.add('isProjectPropertiesEnabled', () => {

    try {

        //assert material, in/exteriors are disabled on newly added project
        cy.get('a[data-test-id="material"]').should('not.have.attr', 'aria-disabled')
        cy.get('a[data-test-id="interiors"]').should('not.have.attr', 'aria-disabled')
        cy.get('a[data-test-id="exteriors"]').should('not.have.attr', 'aria-disabled')
        cy.get('a[data-test-id="sharing"]').should('not.have.attr', 'aria-disabled')
    } catch (error) {

    }
})
Cypress.Commands.add('visitTheMainPage', () => {
    cy.visit(Cypress.config().baseUrl, {
        onBeforeLoad(win) {
            Object.defineProperty(win.localStorage, 'B2S_SOLUTION_LANGUAGE_CODE', {
                value: 'en'
            })
        }
    })
})

Cypress.Commands.add('logInCmd', (userName, password) => {
    cy.get('[data-test-id="userName"]').clear().type(userName).should('have.value', userName)
    cy.get('[data-test-id="password"]').clear().type(password)
})

Cypress.Commands.add('changePassword', (id, oldPassword, newPassword) => {
    //verify url
    cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
    cy.get('[data-test-id="accSettings"]').click()
    cy.get('div[data-test-id="userProfileBtn"]').should('be.visible').click()
    cy.get('input[name="loginName"]').should('have.value', id)
    cy.get('input[name="password"]').clear().type(oldPassword)
    cy.get('input[name="newPassword"]').clear().type(newPassword)
    cy.get('input[name="repeatPassword"]').clear().type(newPassword)
})


Cypress.Commands.add('logOutCmd', () => {
    //log out
    cy.get('[data-test-id="accSettings"]').click()
    cy.get('[data-test-id="signOutBtn"]').click()
    //verify url
    cy.url().should('eq', Cypress.config().baseUrl + 'sign-in')
})

Cypress.Commands.add('insertRequiredFieldForAddnew', (projNumber, projName) => {

    cy.get('input[name="number"]').type(projNumber)
    cy.get('input[name="name"]').type(projName)
})