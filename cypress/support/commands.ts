/// <reference types="cypress" />

Cypress.Commands.add('deleteMaterialFromProjectPage', function () {

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

Cypress.Commands.add('setUpAliasesForMaterialTab', function () {
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
})

Cypress.Commands.add('addNewMaterialDetails', function () {
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
            // cy.wrap($el).click()
            cy.get('div[data-test-id="projectMatDetail"]').within(() => {
                cy.get('svg[data-testid="ArrowDropDownIcon"]').parent().click()
            })
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

Cypress.Commands.add("pressDeleteButtonThenOK", function () {
  cy.get('button[data-test-id="actDel"]').each(function ($ele, index, $list) {
    $ele.click();
    cy.get("button.Button-error").click({force:true,multiple:true});
  });
});


Cypress.Commands.add('deleteProject', function (projectName) {
    //navigate to project
    cy.navigateTo('project')
    cy.searchFor(projectName)
    cy.isExistInRow(projectName, true)

    cy.pressDeleteButtonThenOK()
    // .last().click() ///api/v1/realestateproject
    cy.wait('@deleteProject').then((interception) => {
        assert.equal(interception.response.statusCode, 200)
    })
    cy.get('div[role="status"]').contains('Deleted').should('exist').and('be.visible')
})

Cypress.Commands.add('approveNotaryOfficeAccount', function (_isApproved) {
    cy.logInAsAdmin()
    cy.navigateTo('request-user')
    cy.searchFor(this.accountName)

    //modify button
    cy.get('button[data-test-id="actMod"]').last().click()
    if (_isApproved == true) {
        cy.get('[data-test-id="approveBtn"]').click(); //data-test-id="rejectBtn"
        //approveNewUser
        cy.wait('@approveNewUser').then((interception) => {
            assert.equal(interception.response.statusCode, 200)
        })
        cy.get('span').contains('Approved').should('exist'); //Rejected

    } else if (_isApproved == false) {
        cy.get('[data-test-id="rejectBtn"]').click(); //data-test-id="rejectBtn"
        //approveNewUser
        cy.wait('@rejectNewUser').then((interception) => {
            assert.equal(interception.response.statusCode, 200)
        })
        cy.get('span').contains('Rejected').should('exist'); //Rejected

    }
})

Cypress.Commands.add('createNotaryOfficeUser', function () {

    cy.signUpFunc(this.accountName, this.phone, this.userName, this.password, 1)
    cy.wait('@createUser').then((interception) => {
        assert.equal(interception.response.statusCode, 200)
    })
    cy.get('div[role="status"]').contains('please wait for approval').should('exist').and('be.visible')
})

Cypress.Commands.add('checkBoxShouldHaveLength', function (_numberOfCheckBox) {
    cy.get('input[type="checkbox"]').should('have.length', _numberOfCheckBox).each(function ($el, index, $list) {
        cy.wrap($el).check()
        cy.wrap($el).should('be.checked')
    })
    cy.get('[data-test-id="saveBtn"]').last().click();
    cy.wait('@updateDocument').then((interception) => {
        assert.equal(interception.response.statusCode, 200)
    })
})
Cypress.Commands.add('deleteUserByAccountName', function (accountName) {
    cy.logInAsAdmin()
    //check in user if user have been created yet
    cy.navigateTo('user')
    cy.searchFor(accountName)
    //click last delete button
    cy.get('button[data-test-id="actDel"]').last().click()
    //confirm
    cy.get('button').contains('OK').click()
    cy.wait('@deleteUser').then((interception) => {
        assert.equal(interception.response.statusCode, 200)
    })
})

Cypress.Commands.add('setUpNewAccount', function () {
    //create reusable var
    const _randomAccountNumber = Math.floor(Math.random() * 10000)
    cy.wrap(`username${_randomAccountNumber}`).as('accountName')
    cy.wrap(`321ewq;\'`).as('password')
    cy.wrap(Math.floor(Math.random() * 1000000000)).as('phone')
    cy.wrap(`username${_randomAccountNumber}`).as('userName')
    cy.wrap(`projectNumber${_randomAccountNumber}`).as('projectNumber')
    cy.wrap(`projectName${_randomAccountNumber}`).as('projectName')
})

Cypress.Commands.add('signUpFunc', function (accountName, phone, userName, password, mode) {
    //test
    cy.get('[href="/sign-up"]').click();
    cy.url().should('contain', '/sign-up')
    cy.get('[data-test-id="name"]').clear().type(accountName);
    cy.get('[data-test-id="phone"]').clear().type(phone.toString()); //10 number
    cy.get('[data-test-id="email"]').clear().type('e@g.c');
    cy.get('[data-test-id="userName"]').clear().type(userName);
    cy.get('[data-test-id="password"]').clear().type(password);
    cy.get('[data-test-id="repeat_password"]').clear().type(password);
    cy.get('input[type="radio"]').then(($list) => {
        $list.eq(mode).click() //or Notary office = 1 or Agency = 0
    })
    cy.get('[data-test-id="signInBtn"]').click();
})

Cypress.Commands.add('isExistInRow', function (searchText, _isExist) {
    if (_isExist == true) {
        cy.get('tr > td').invoke('text')
            .then((text) => {
                const divTxt = text;
                expect(divTxt).to.contain(searchText);
            })
    } else if (_isExist == false) {
        cy.get('tr > td').invoke('text')
            .then((text) => {
                const divTxt = text;
                expect(divTxt).to.contain('No match');
            })
    }
})
Cypress.Commands.add('searchFor', function (searchText) {
    //search for account name
    cy.get('div[data-test-id="searchDiv"]').click().then(() => {
        cy.get('input[name="search"]').clear().type(searchText)
    })
    cy.wait(1500)
    // try {
    //     if (cy.find('input[name="search"]',{timeout:500}) != null) {
    //         cy.get('input[name="search"]').clear().type(searchText)
    //         cy.wait(1500)
    //     } else {
    //         //search for account name
    //         cy.get('div[data-test-id="searchDiv"]').click().then(() => {
    //             cy.get('input[name="search"]').clear().type(searchText)
    //         })
    //         cy.wait(1500)
    //     }
    // } catch (error) {
    //     //search for account name
    //     cy.get('div[data-test-id="searchDiv"]').click().then(() => {
    //         cy.get('input[name="search"]').clear().type(searchText)
    //     })
    //     cy.wait(1500)
    // }
    //improvement
    // cy.wait('@searchQuery').then((interception) => {
    //     assert.equal(interception.response.statusCode, 200)
    // })
})

Cypress.Commands.add('createNewProject', function (projectName, projectNumber) {
    //navigate to project
    cy.navigateTo('project')
    //click add new
    cy.clickAddNewButton()
    cy.url().should('contain', 'admin/project/new')
    cy.isProjectProperties('disabled')
    //fill in required field
    cy.insertRequiredFieldForAddnew(projectNumber, projectName)
    //click reset
    cy.get('button[data-test-id="reset"]').click()
    cy.get('input[name="number"]').should('be.empty')
    cy.get('input[name="name"]').should('be.empty')

    cy.insertRequiredFieldForAddnew(projectNumber, projectName)
    //start listen at api/v1/realestateproject
    cy.intercept('POST', 'api/v1/realestateproject').as('addNewProject')
    cy.get('button[data-test-id="saveBtn"]').click()
    cy.get('div[role="status"]').contains('Saved success!').should('exist').and('be.visible')
    cy.wait('@addNewProject').then((_interception) => {
        // Cypress.env('projectID',_interception.response.body.data.id)
        expect(_interception.response.statusCode).to.eq(200)
    })
    //assert material, in/exteriors are disabled on newly added project
    cy.isProjectProperties('enabled')
})

Cypress.Commands.add('addUser', (__statusCode) => {

    cy.fixture('newUser.json').then( function (newUser) {
        const _name = Object.keys(newUser[0])

        for (let i = 0; i < newUser.length; i++) {
            const _user = newUser[i];
            for (let j = 0; j < _name.length; j++) {
                cy.get(`input[name="${_name[j]}"]`).type(_user[_name[j]])
            }
            //press save
            cy.get('button[data-test-id="saveBtn"]').click()
            cy.wait('@addNewUser').then((_interception) => {
                expect(_interception.response.statusCode).to.eq(__statusCode)
            })
            cy.navigateTo('user')
            cy.get('a[data-test-id="addNewBtn"]').click()
        }
    })
})
Cypress.Commands.add('changePasswordToOldPassword', function (test_id, test_oldPwd, test_newPwd) {
    cy.logInCmd(test_id, test_newPwd)
    //verify url
    cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')

    cy.changePassword(test_id, test_newPwd, test_oldPwd)
    // cy.log('old password: ', test1_newPwd)
    // cy.log('new password: ', test1_oldPwd)
    //press save
    cy.get('button[data-test-id="saveBtn"]').should('be.visible').click()
    //assert api & pop up
    cy.wait('@logInStatus').then((_interception) => {
        expect(_interception.response.statusCode).to.eq(200)
    })
    //close pro5 panel
    // cy.get('button',{timeout: 20000}).contains('Close').should('be.visible').should('be.enabled').click()
    cy.get('body').type('{esc}')
    cy.get('[data-test-id="accSettings"]').should('be.visible')
    cy.logOutCmd()
})

Cypress.Commands.add('changePasswordToNewPassword', function (test_id, test_oldPwd, test_newPwd) {
    ///log in -> change password from CURRENT to NEW -> log out
    //visit main page
    cy.visitTheMainPage()
    //log in
    cy.logInCmd(test_id, test_oldPwd)
    //verify url
    cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
    //change password fail
    cy.changePassword(test_id, '1', '1')
    // cy.intercept('POST', 'api/v1/user/profile').as('changePasswordStatus')
    cy.get('button[data-test-id="saveBtn"]').should('be.visible').click()
    // cy.wait('@changePasswordStatus',).its('response.statusCode').should('be.oneOf', [500])
    cy.wait(2000)
    cy.wait('@changePasswordStatus').then((_interception) => {
        expect(_interception.response.statusCode).to.eq(500)
    })
    cy.get('div[role="status"]').should('contain', 'Wrong')
    cy.get('body').type('{esc}')
    cy.changePassword(test_id, test_oldPwd, test_newPwd)
    //press save
    cy.get('button[data-test-id="saveBtn"]').should('be.visible').click()
    //assert api & pop up
    cy.wait('@changePasswordStatus').then((_interception) => {
        expect(_interception.response.statusCode).to.eq(200)
    })
    cy.get('div[role="status"]').should('contain', 'success')
    //close pro5 panel
    // cy.get('button',{timeout: 20000}).contains('Close').should('be.enabled').click()
    cy.get('body').type('{esc}')
    cy.get('[data-test-id="accSettings"]').should('be.visible')
    cy.logOutCmd()
})

//return a random number in the range from 1 to max
Cypress.Commands.add('random', (max) => {
    const rndInt: number = Math.floor(Math.random() * max) + 1
    //     return rndInt
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
    cy.wait('@saveAsNew').then(({
        response
    }) => {
        expect(response.statusCode).to.eq(200)
    })
    //press escape
    cy.get('body').type('{esc}');
    //wait /api/v1/interiorview?p=0&projectId=22&ps=10
    cy.wait('@refreshPage').then(({
        response
    }) => {
        expect(response.statusCode).to.eq(200)
    })
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
    // cy.fixture(`/images/${InteriorOrExterior}-example.jpg`, {
    //     encoding: null
    // }).as('uploadImg')    
    cy.fixture(`/images/${InteriorOrExterior}-example.jpg`).as('uploadImg')
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
    cy.wait('@refreshPage').then(({
        response
    }) => {
        expect(response.statusCode).to.eq(200)
    })
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
    cy.wait('@delete').then(({
        response
    }) => {
        expect(response.statusCode).to.eq(200)
    })
    // then Re-Querying The Page -> expect to have this or we'll have a query loop
    cy.wait('@refreshPage').then(({
        response
    }) => {
        expect(response.statusCode).to.eq(200)
    })
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
        const _page = ['project', 'material', 'project-status', 'user', 'request-user', 'legal-support', 'legal-support-common']
        for (let i = 0; i < _page.length; i++) {
            const _e = _page[i];
            if (page == _e) {
                cy.get(`a[href="/admin/${page}"]`).click({
                    force: true
                })
                // cy.visit(`/admin/${page}"]`)
                cy.url().should('contain', `admin/${page}`)
                break
            } else {
                // cy.log('Allowed value are: project, material, project-status')
            }
        }

    } catch (error) {
        // cy.log('Allowed value are: project, material, project-status')
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
    cy.url().should('eq', Cypress.config().baseUrl)
    // .its('navigator.language') // yields window.navigator.language
    // .should('equal', 'en-US') // asserts the expected value
    cy.logInCmd('admin', 'admin')
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
    // cy.intercept('POST', '/api/v1/user/login').as('___logInStatus')
    cy.get('[data-test-id="userName"]').clear().type(userName).should('have.value', userName)
    cy.get('[data-test-id="password"]').clear().type(password)
    cy.get('[data-test-id="signInBtn"]').click();
    // cy.wait('@___logInStatus').then((_interception) => {
    //     Cypress.env('accessToken', _interception.response.body.data.accessToken)
    // })
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

//add update alias
