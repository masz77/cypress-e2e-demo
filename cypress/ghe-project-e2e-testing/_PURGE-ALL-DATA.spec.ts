/// <reference types="cypress" />

it.skip("will purge all existing data", function () {
  cy.request("POST", `${Cypress.config().baseUrl}api/v1/user/login`, {
    loginName: "admin",
    password: "admin",
    remember: false,
  }).then(function (logInResponse) {
    // cy.wrap(response.body.data.accessToken).as('accessToken')
    Cypress.env("accessToken", logInResponse.body.data.accessToken);

    //create new project project-to-copy-material
    cy.request({
      method: "GET",
      url: `${Cypress.config().baseUrl}api/v1/realestateproject?p=0&ps=100`,
      headers: {
        authorization: `Bearer ${Cypress.env("accessToken")}`,
      },
    }).then(function (getTotalProjectResponse) {
      const _res = getTotalProjectResponse;
      const totalAmountOfProjects = _res.body.data.total;
      for (let __i = 1; __i < totalAmountOfProjects; __i++) {
        let _projectIDtoDelete = _res.body.data.list[__i].id;
        cy.request({
          method: "DELETE",
          url: `${Cypress.config().baseUrl}api/v1/realestateproject`,
          headers: {
            authorization: `Bearer ${Cypress.env("accessToken")}`,
          },
          body: JSON.stringify(_projectIDtoDelete),
        });
      }
    });
  });
});
