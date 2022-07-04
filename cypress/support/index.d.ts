// cypress/support/index.d.ts file
// extends Cypress assertion Chainer interface with
// the new assertion methods

/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    insertRequiredFieldForAddnew: (
      projNumber: string,
      projName: string
    ) => Cypress.Chainable<JQuery>;
    logOutCmd: () => Cypress.Chainable<JQuery>;
    changePassword: (
      id: string,
      oldPassword: string,
      newPassword: string
    ) => Cypress.Chainable<JQuery>;
    logInCmd: (userName: string, password: string) => Cypress.Chainable<JQuery>;
    isProjectPropertiesEnabled: () => Cypress.Chainable<JQuery>;
    isProjectPropertiesDisabled: () => Cypress.Chainable<JQuery>;
    fillInDetail: (
      number: string,
      name: string,
      brand: string
    ) => Cypress.Chainable<JQuery>;
    logInAsAdmin: () => Cypress.Chainable<JQuery>;
    clickAddNewButton: () => Cypress.Chainable<JQuery>;
    isProjectProperties(expected: string): Chainable<Element>;
    visitTheMainPage(): Chainable<Element>;
    deleteMaterialFromProjectPage(): Chainable<Element>;
    setUpAliasesForMaterialTab(): Chainable<Element>;
    addNewMaterialDetails(): Chainable<Element>;
    createNotaryOfficeUser(): Chainable<Element>;
    setUpNewAccount(): Chainable<Element>;
    addUser(statusCode: number): Chainable<Element>;
    changeLangToEng(): Chainable<Element>;
    deleteProject(
      projectName: string,
      haveAnotherOKCheck: boolean
    ): Chainable<Element>;
    deleteUserByAccountName(accountName: string): Chainable<Element>;

    isExistInRow(searchText: string, _isExist: boolean): Chainable<Element>;
    createNewProject(
      projectName: string,
      projectNumber: string
    ): Chainable<Element>;

    changePasswordToOldPassword(
      test_id: string,
      test_oldPwd: string,
      test_newPwd: string
    ): Chainable<Element>;
    changePasswordToNewPassword(
      test_id: string,
      test_oldPwd: string,
      test_newPwd: string
    ): Chainable<Element>;

    searchFor(searchText: string): Chainable<Element>;
    coinTransfer_approve(isApproved: boolean): Chainable<Element>;
    pressDeleteButtonThenOK(
      _alias: string,
      statusCode: number,
      haveAnotherOKCheck: boolean
    ): Chainable<Element>;
    addNew(InteriorOrExterior: string): Chainable<Element>;
    coinTransfer_enterCoinNumberAndSubmit(
      realAmount: number,
      amount: number,
      isNumberEnteredValid: boolean
    ): Chainable<Element>;
    coinTransfer_selectAccount(
      field: number,
      _Receiver: string
    ): Chainable<Element>;
    deleteInOrEx(InteriorOrExterior: string): Chainable<Element>;
    setUpListener(InteriorOrExterior: string): Chainable<Element>;
    navigateTo(page: string): Chainable<Element>;
    random(max: number): Chainable<Element>;

    checkBoxShouldHaveLength(_numberOfCheckBox: number): Chainable<Element>;
    approveNotaryOfficeAccount(_isApproved: boolean): Chainable<Element>;

    signUpFunc(
      accountName: string,
      phone: number,
      prefix: string,
      userName: string,
      password: string,
      mode: number
    ): Chainable<Element>;
  }
}
