import { test, expect } from '@playwright/test';

const USER_NAME = process.env.USER_NAME;
const PASSWORD = process.env.PASSWORD;

test.describe('API Testing: BookStore and Token Generation', () => {
  test('Should retrieve the list of all books and validate its structure', async ({
    request,
  }) => {
    console.log('--- OBTAINING ALL THE BOOKS ---');
    const booksResponse = await request.get('/BookStore/v1/Books');

    expect(booksResponse.status(), 'Status code should be 200').toBe(200);

    const booksData = await booksResponse.json();
    expect(booksData).toHaveProperty('books');
    expect(Array.isArray(booksData.books)).toBe(true);

    if (booksData.books.length > 0) {
      const firstBook = booksData.books[0];
      expect(firstBook).toHaveProperty('isbn');
      expect(typeof firstBook.isbn).toBe('string');
      expect(firstBook).toHaveProperty('title');
      expect(firstBook).toHaveProperty('author');
      expect(firstBook).toHaveProperty('publish_date');
      expect(firstBook).toHaveProperty('publisher');
      expect(firstBook).toHaveProperty('pages');
      expect(typeof firstBook.pages).toBe('number');
    }
    console.log(
      `✅ Endpoint /BookStore/v1/Books validated. Total books: ${booksData.books.length}`,
    );
  });

  test('Should successfully consume an authenticated method (Get User) using the generated token', async ({
    request,
  }) => {
    console.log('\n--- GENERATE TOKEN AND CONSUME AUTHENTICATED METHOD ---');

    const generateTokenResponse = await request.post(
      '/Account/v1/GenerateToken',
      {
        data: {
          userName: USER_NAME,
          password: PASSWORD,
        },
      },
    );
    expect(generateTokenResponse.status()).toBe(200);
    const tokenData = await generateTokenResponse.json();
    const authToken = tokenData.token;
    expect(authToken.length).toBeGreaterThan(0);
    console.log(`✅ Token successfully generated`);

    const loginResponse = await request.post('/Account/v1/Login', {
      data: {
        userName: USER_NAME,
        password: PASSWORD,
      },
    });
    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    const userId = loginData.userId;
    expect(userId.length).toBeGreaterThan(0);
    console.log(`✅ User ID obtained.`);

    const getUserResponse = await request.get(`/Account/v1/User/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(
      getUserResponse.status(),
      'The status code should be 200 for a valid token',
    ).toBe(200);

    const userData = await getUserResponse.json();
    expect(userData).toHaveProperty('userId', userId);
    expect(userData).toHaveProperty('username', USER_NAME);
    expect(Array.isArray(userData.books)).toBe(true);

    console.log(
      `✅ Correctly authenticated GET /Account/v1/User/{UUID} successful.`,
    );
  });
});
