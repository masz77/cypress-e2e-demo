/// <reference types="cypress" />
// import userData from '../fixtures/account.json'

describe('parent', () => {
    beforeEach(() => {
      cy.wrap('one').as('a')
    })
  
    context('child', () => {
      beforeEach(() => {
        cy.wrap('two').as('b')
      })
  
      describe('grandchild', () => {
        beforeEach(() => {
          cy.wrap('three').as('c')
          cy.fixture('account.json').as('user123')
        })
  
        it('can access all aliases as properties', function () {
          expect(this.a).to.eq('one') // true
          expect(this.b).to.eq('two') // true
          expect(this.c).to.eq('three') // true
          let a = this.user123.test1.currentPassword
          console.log(a)
          expect(this.user123.test1.currentPassword).to.eq('admin') // true

        })
      })
    })
  })