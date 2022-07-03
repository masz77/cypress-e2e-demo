/// <reference types="cypress" />
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
    cy.get(".MuiCardContent-root > :nth-child(2) input").within(($input) => {
      cy.wrap($input[1]).type("admin");
      cy.wait(1000);
    });
    cy.get("div[role=presentation] ul[role=listbox] li[role=option]")
      .should("be.visible")
      .last()
      .click();

    let _coinAmount: number = 69420;
    cy.get('input[name="realAmount"]').type("1000");
    cy.get('input[name="amount"]').type(_coinAmount.toString());
    cy.get('button[data-test-id="saveBtn"]').click();

    // cy.wait(1000);

    // cy.url().then((_url) => {
    //   const _splitted = _url.split("/");
    //   console.log(_splitted[_splitted.length - 1]);
    // console.log(_.last(_url.split("/")));
    // });
    cy.get('button[data-test-id="submitBtn"]').click();
    cy.get("button.Button-error").contains("OK").click();

    cy.get('div[role="button"] span').should("contain", "Pending approval");
    cy.scrollTo("bottom");
    cy.get('button[data-test-id="approveBtn"]').click();
    // cy.get('button[data-test-id="rejectBtn"]').click();
    cy.get("button.Button-error").contains("OK").click();

    cy.get('div[role="button"] span').should("contain", "Approved");

    let _coinAmountXPath = "/html/body/div[1]/div[1]/header/div/div[7]/b";
    cy.xpath(_coinAmountXPath)
      .invoke("text")
      .then((textBefore) => {
        cy.reload(true);
        cy.wait(2000);
        cy.xpath(_coinAmountXPath)
          .invoke("text")
          .should((textAfter) => {
            let _finalCoin: number =
              parseInt(textBefore.replaceAll(",", "")) + _coinAmount;
            expect(parseInt(textAfter.replaceAll(",", ""))).to.eq(_finalCoin);
          });
      });
    // .then(cy.log);
  });

  it.skip("testing xpath", () => {
    cy.logInAsAdmin();
    cy.wait(2000);
    cy.xpath("/html/body/div[1]/div[1]/header/div/div[7]/b")
      .invoke("text")
      .then(cy.log);
    // .its("text")
    // .then(($text) => {
    //   console.log($text.get(0).innerText);
    // });
  });
});
