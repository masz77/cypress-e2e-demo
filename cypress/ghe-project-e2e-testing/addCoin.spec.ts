/// <reference types="cypress" />
/// <reference types="cypress-xpath" />
// Cypress.SelectorPlayground.defaults({
//   selectorPriority: [
//     "data-test-id",
//     "data-testid",
//     "id",
//     "class",
//     "attributes",
//   ],
// });

describe("coin related tasks", () => {
  beforeEach("add api listener", () => {
    //   cy.intercept("POST", "/api/v1/requestuser/action/create").as("createUser");
  });

  it("add coin as admin", () => {
    cy.logInAsAdmin();
    cy.navigateTo("change-amount");
    cy.clickAddNewButton();
    cy.url().should("contain", "change-amount/new");

    //transaction number should be disabled since it's auto generated
    cy.get("input[disabled]").should("exist");
    //press save
    cy.get('button[data-test-id="saveBtn"]').click();

    //3 field required
    cy.get('input[aria-invalid="true"]').should("have.length", "3");

    cy.coinTransfer_selectAccount(1, "admin");

    let _coinAmount = 69420;
    let _invalidCoinNumber = 10000000000000000;
    cy.coinTransfer_enterCoinNumberAndSubmit(1000, _invalidCoinNumber, false);

    cy.coinTransfer_enterCoinNumberAndSubmit(1000, _coinAmount, true);

    cy.coinTransfer_approve(true);

    let _coinAvailableXPath = "/html/body/div[1]/div[1]/header/div/div[7]/b";
    cy.xpath(_coinAvailableXPath)
      .invoke("text")
      .then((textBefore) => {
        cy.reload(true);
        cy.wait(2000);
        cy.xpath(_coinAvailableXPath)
          .invoke("text")
          .should((textAfter) => {
            let _finalCoin: number =
              parseInt(textBefore.replaceAll(",", "")) + _coinAmount;
            expect(parseInt(textAfter.replaceAll(",", ""))).to.eq(_finalCoin);
          });
      });
  });

  context("transfer coin", () => {
    beforeEach("add api listener", () => {
      cy.logInAsAdmin();
    });

    it.only("from Transfer coin menu", () => {
      cy.navigateTo("change-amount");
      cy.clickAddNewButton();
      cy.url().should("contain", "change-amount/new");

      //receiver
      cy.coinTransfer_selectAccount(1, "username1290");
      //sender
      cy.coinTransfer_selectAccount(2, "admin");

      let _coinAvailableXPath = "/html/body/div[1]/div[1]/header/div/div[7]/b";
      cy.xpath(_coinAvailableXPath)
        .invoke("text")
        .then((textBefore) => {
          let _coinAmount = Math.floor(
            parseInt(textBefore.replaceAll(",", "")) / 2
          );
          cy.coinTransfer_enterCoinNumberAndSubmit(1000, _coinAmount, true);

          cy.logOutCmd();

          cy.logInCmd("username1290", "321ewq;'");
          cy.wait(1000);

          cy.xpath(_coinAvailableXPath)
            .invoke("text")
            .should((textAfter) => {
              expect(parseInt(textAfter.replaceAll(",", ""))).to.eq(
                _coinAmount
              );
            });
        });
    });

    it("from user menu", () => {});
  });

  it("", () => {});
});
