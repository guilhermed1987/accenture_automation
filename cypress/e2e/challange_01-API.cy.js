describe('Book Store API Flow', () => {
    const baseUrl = 'https://demoqa.com';
    const username = `user_${Date.now()}`;
    const password = 'Password@123';
    let userId;
    let token;
    let selectedBooks = [];
  
    before(() => {
      // 1. User creation
      cy.request('POST', `${baseUrl}/Account/v1/User`, {
        userName: username,
        password: password
      }).then((response) => {
        expect(response.status).to.eq(201);
        userId = response.body.userID;
      });
  
      // 2. Token generation
      cy.request('POST', `${baseUrl}/Account/v1/GenerateToken`, {
        userName: username,
        password: password
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('Success');
        token = response.body.token;
      });
    });
  
    it('Authorize user', () => {
      cy.request('POST', `${baseUrl}/Account/v1/Authorized`, {
        userName: username,
        password: password
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.eq(true);
      });
    });
  
    it('Select 2 books from collection', () => {
      cy.request('GET', `${baseUrl}/BookStore/v1/Books`).then((response) => {
        expect(response.status).to.eq(200);
        const books = response.body.books;
        expect(books.length).to.be.greaterThan(1);
  
        selectedBooks = books.slice(0, 2);
      });
    });
  
    it('Rent selected books', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/BookStore/v1/Books`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          userId: userId,
          collectionOfIsbns: selectedBooks.map((b) => ({ isbn: b.isbn }))
        }
      }).then((res) => {
        expect(res.status).to.eq(201);
      });
    });
  
    it('List user details', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/Account/v1/User/${userId}`,
        headers: { Authorization: `Bearer ${token}` }
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.username).to.eq(username);
        expect(res.body.books.length).to.eq(2);
      });
    });
  });
  