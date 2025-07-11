describe('R8UC1 - Add Todo Item to Task', () => {
  let uid;


  beforeEach(function () {
    cy.request({
      method: 'POST',
      url: 'http://localhost:5050/users/create',
      form: true,
      body: {
        firstName: 'Mon',
        lastName: 'Doe',
        email: 'mon.doe@gmail.com'
      }
    }).then((res) => {
      uid = res.body._id.$oid;
      cy.log('User created with ID:', uid);
      cy.request({
        method: 'POST',
        url: 'http://localhost:5050/tasks/create',
        form: true,
        body: {
          userid: uid,
          title: 'My tasks for today',
          description: 'My tasks for today',
          url: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
          todos: 'Watch video'
        }
      }).then((res) => {
        cy.log(JSON.stringify(res.body));
      }).then((res) => {
        cy.visit('http://localhost:3000');
        cy.get('h1')
          .should('contain.text', 'Login');

        cy.get('.inputwrapper #email')
          .type('mon.doe@gmail.com');

        cy.get('form')
          .submit();

        cy.get('h1')
          .should('contain.text', 'Your tasks, Mon Doe');

        cy.get('.container-element')
          .should('contain.text', 'My tasks for today');

        cy.contains('My tasks for today')
          .click();
      });
    });
  });

  it('R8UC1-TC1: creates a new todo item when the description field is not empty', () => {
    cy.get('form.inline-form input[type="text"]')
      .scrollIntoView()
      .should('exist')
      .type('Complete the project report', { force: true });

    cy.get('form.inline-form input[type="submit"]')
      .should('not.be.disabled')
      .click({ force: true });

    cy.get('ul.todo-list')
      .should('contain.text', 'Complete the project report');
  });

  it('R8UC1-TC2: does not enable the "Add" button when the description field is empty', () => {
    cy.get('form.inline-form input[type="text"]')
      .scrollIntoView()
      .should('exist')
      .should('have.value', '');

    cy.get('form.inline-form input[type="submit"]')
      .should('be.disabled');
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
