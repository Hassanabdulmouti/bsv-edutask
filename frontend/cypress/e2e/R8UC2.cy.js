  let uid, taskId, todoId;

  
  const logIn = (email) => {
    cy.get('h1').should('contain.text', 'Login');
    cy.get('.inputwrapper #email').clear().type(email);
    cy.get('form').submit();
  };

 
  beforeEach(() => {
    const email = `mon.doe${Date.now()}@example.com`;
    cy.wrap(email).as('email');         
    
    

    cy.request({
      method: 'POST',
      url: 'http://localhost:5050/users/create',
      form: true,
      body: {
        firstName: 'Mon',
        lastName: 'Doe',
        email: email
      }
    }).then(({ body }) => {
      uid = body._id.$oid;

      return cy.request({
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
      });
    }).then(({ body }) => {
      taskId = body[0]._id.$oid;
      todoId = body[0].todos[0]._id.$oid;

      cy.visit('http://localhost:3000');
      logIn(email);

      cy.contains('My tasks for today').click();
    });
  });

  it('R8UC2-TC1: toggles a todo item to done (struck through)', () => {
    cy.request({
      method: 'GET',
      url: `http://localhost:5050/todos/byid/${todoId}`
    });
    cy.request({
      method: 'PUT',
      url: `http://localhost:5050/todos/byid/${todoId}`,
      form: true,
      body: {
        data: JSON.stringify({ '$set': { done: true } })
      }
    }).then((response) => {
      cy.request({
        method: 'GET',
        url: `http://localhost:5050/todos/byid/${todoId}`
      }).then((getRes) => {
        cy.request({
          method: 'GET',  
          url: `http://localhost:5050/tasks/byid/${taskId}`
        }).then((taskRes) => {
          cy.log('Task todos after update:', JSON.stringify(taskRes.body.todos));
          cy.wait(1000); 
          cy.reload();
        });
      });

      cy.get('h1').should('contain.text', 'Login');
      cy.get('@email').then((email) => {
        cy.get('.inputwrapper #email').type(email);
      });
      cy.get('form').submit();
      cy.get('h1').should('contain.text', 'Your tasks, Mon Doe');
      cy.get('.container-element').should('contain.text', 'My tasks for today');
      cy.contains('My tasks for today').click();

      cy.contains('.editable', 'Watch video')
        .should('have.css', 'text-decoration', 'line-through solid rgb(49, 46, 46)');
    });
  });

  it('R8UC2-TC2: toggles a done todo item back to active (not struck through)', () => {
    cy.request({
      method: 'PUT',
      url: `http://localhost:5050/todos/byid/${todoId}`,
      form: true,
      body: {
        data: JSON.stringify({ '$set': { done: false } })
      }
    }).then((response) => {
      cy.request({
        method: 'GET',
        url: `http://localhost:5050/todos/byid/${todoId}`
      }).then((getRes) => {
        cy.reload();
      });

      cy.get('h1').should('contain.text', 'Login');
      cy.get('@email').then((email) => {
        cy.get('.inputwrapper #email').type(email);
      });
      cy.get('form').submit();
      cy.get('h1').should('contain.text', 'Your tasks, Mon Doe');
      cy.get('.container-element').should('contain.text', 'My tasks for today');
      cy.contains('My tasks for today').click();
     
      cy.contains('.editable', 'Watch video')
        .should('have.css', 'text-decoration', 'none solid rgb(49, 46, 46)');
    });
  });

 
  after(() => {
    if (uid) {
      cy.request('DELETE', `http://localhost:5050/users/${uid}`);
    }
  });

