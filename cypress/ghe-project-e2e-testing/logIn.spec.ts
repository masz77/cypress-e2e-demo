/// <reference types="cypress" />
// import userData from '../fixtures/account.json'

Cypress.SelectorPlayground.defaults({
  selectorPriority: [
    "data-test-id",
    "data-testid",
    "id",
    "class",
    "attributes",
  ],
});

describe("log in", () => {
  beforeEach("set up listener", () => {
    // cy.visit(Cypress.config().baseUrl)
    cy.intercept("POST", "/api/v1/user/login").as("logInStatus");
  });

  context("log in successfully and log out", () => {
    beforeEach("visit the main page", function () {
      cy.visitTheMainPage();
    });

    it("has correct username/password, log in successfully", () => {
      cy.logInAsAdmin();
      cy.wait("@logInStatus")
        .its("response.statusCode")
        .should("be.oneOf", [200]);
      //verify url
      cy.url().should("eq", Cypress.config().baseUrl + "admin/dashboard");
    });

    // it('has correct username/password -> expect: log in successfully', () => {
    //     cy.logInAsAdmin()
    //     //verify url
    //     cy.url().should('eq', Cypress.config().baseUrl + 'admin/dashboard')
    // })

    afterEach("log out and assert", () => {
      //log out + verify url
      cy.logOutCmd();
    });
  });

  context("log in unsuccessfully", () => {
    beforeEach("visit the main page", () => {
      cy.visitTheMainPage();
    });
    it("has wrong username -> expect: error message", () => {
      cy.logInCmd("admin123", "admin");
      cy.wait("@logInStatus")
        .its("response.statusCode")
        .should("be.oneOf", [500]);
      cy.get('div[role="status"]').should("contain", "Login fail!");
    });

    it("has wrong password -> expect: error message", () => {
      cy.logInCmd("admin", "admin123");
      cy.wait("@logInStatus")
        .its("response.statusCode")
        .should("be.oneOf", [500]);
      cy.get('div[role="status"]').should("contain", "Login fail!");
    });
  });
});
