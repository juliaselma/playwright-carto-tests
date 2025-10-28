import { expect } from '@playwright/test';
import { test } from './auth.fixture';

test('Should retrieve the list of all books and validate its structure', async ({
  request,
}) => {
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
  authToken,
  userId,
}) => {
  const USER_NAME = process.env.USER_NAME;

  const getUserResponse = await request.get(`/Account/v1/User/${userId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  expect(getUserResponse.status()).toBe(200);

  const userData = await getUserResponse.json();
  expect(userData).toHaveProperty('userId', userId);
  expect(userData).toHaveProperty('username', USER_NAME);
  expect(
    getUserResponse.status(),
    'The status code should be 200 for a valid token',
  ).toBe(200);
  expect(Array.isArray(userData.books)).toBe(true);

  console.log(
    `✅ Correctly authenticated GET /Account/v1/User/{UUID} successful.`,
  );
});
