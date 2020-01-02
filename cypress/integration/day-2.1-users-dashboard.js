/// <reference types="Cypress" />

/**
 * @abstract:See overview of progress
 *
 * @criteria
  When viewing the dashboard as a logged in user:
  - The app gets my language and words progress from the server
  - I'm shown my language
  - I'm shown the words to learn for the language
  - I'm shown my guess count for correct and incorrect for each word
  - I'm given a button/link to start learning
  - I'm shown the total score for guessing words
*/
describe(`User story: User's dashboard`, function() {
  beforeEach(() => {
    cy.server()
      .route({
        method: 'GET',
        url: '/api/language',
        status: 200,
        response: 'fixture:language'
      })
      .as('languageRequest');
  });

  beforeEach(() => {
    //cy.login();
    const loginUser = {
      username: 'admin',
      password: 'pass'
    };
    cy.visit('/login');

    cy.get('main form')
      .within($form => {
        cy.get('#login-username-input').type(loginUser.username);
        cy.get('#login-password-input').type(loginUser.password);
        cy.root().submit();
      })
      .wait(1000);
  });

  it('has h2 with title, total score, subtitle and link', () => {
    cy.fixture('language.json').then(({ language }) => {
      console.log(language);
      cy.get('main section').within($section => {
        console.log($section);
        cy.get('h2').should('contain', language.name);

        console.log(cy.root());
        cy.get('.total').should('contain', `Total Score: ${language.total_score}`);

        cy.get('a')
          .should('have.attr', 'href', '/learn')
          .and('have.text', 'Start Practicing!');

        cy.get('h3').should('have.text', 'Words to Practice');
      });
    });
  });

  it(`shows an LI and link for each language`, () => {
    cy.wait('@languageRequest');
    cy.fixture('language.json').then(({ words }) => {
      words.forEach((word, idx) => {
        cy.get('main section li')
          .eq(idx)
          .within($li => {
            cy.get('.Dashboard__original').should('have.text', word.original);

            cy.root().should('contain', `correct: ${word.correct_count}`);

            cy.root().should('contain', `incorrect: ${word.incorrect_count}`);
          });
      });
    });
  });
});
