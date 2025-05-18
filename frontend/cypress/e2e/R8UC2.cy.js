describe('R8UC2 - Toggle Todo Item Done/Active', () => {
  let uid;
  let name;

  before(function () {
    cy.fixture('user.json').then((user) => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:5050/users/create',
        form: true,
        body: user
      }).then((res) => {
        uid = res.body._id.$oid;
        name = user.firstName + " " + user.lastName;
      });
    });
  });

  beforeEach(function () {
    cy.visit('http://localhost:3000');

    cy.get('h1').should('contain.text', 'Login');
    cy.get('.inputwrapper #email').type('mon.doe@gmail.com');
    cy.get('form').submit();
    cy.get('h1').should('contain.text', 'Your tasks, Mon Doe');
    cy.get('.inputwrapper #title').type('My tasks for today');
    cy.get('.inputwrapper #url').type('https://www.youtube.com/watch?v=O6P86uwfdR0');
    cy.get('form').submit();
    cy.get('.container-element').should('contain.text', 'My tasks for today');
    cy.contains('My tasks for today').click();

    cy.get('form.inline-form input[type="text"]')
      .scrollIntoView() 
      .should('exist')
      .type('Toggle this todo', { force: true });
    cy.get('form.inline-form input[type="submit"]')
      .should('not.be.disabled')
      .click({ force: true });
    cy.get('ul.todo-list').should('contain.text', 'Toggle this todo');
  });

  it('R8UC2-TC1: toggles a todo item to done (struck through)', () => {
    cy.contains('li.todo-item', 'Toggle this todo')
      .find('.checker')
      .click({ force: true });

    cy.contains('li.todo-item', 'Toggle this todo')
      .find('.checker')
      .should('have.class', 'checked');
  });

  it('R8UC2-TC2: toggles a done todo item back to active (not struck through)', () => {
    cy.contains('li.todo-item', 'Toggle this todo')
      .find('.checker')
      .click({ force: true });

    cy.contains('li.todo-item', 'Toggle this todo')
      .find('.checker')
      .click({ force: true });

    cy.contains('li.todo-item', 'Toggle this todo')
      .find('.checker')
      .should('have.class', 'unchecked');
  });

  after(function () {
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5050/users/${uid}`
    }).then((res) => {
      cy.log(res.body);
    });
  });
});
