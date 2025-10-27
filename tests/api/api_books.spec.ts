import { test, expect } from '@playwright/test';

const USER_NAME = 'julia.selma';
const PASSWORD = 'TestPass28$';
const BASE_URL = 'https://demoqa.com';

test.describe('API Testing: BookStore and Token Generation', () => {
  let authToken: string;
  let userId: string;

  test.beforeAll(
    'Setup: Generate Token and get User ID',
    async ({ request }) => {
      console.log('--- PASO 1: GENERAR TOKEN ---');

      const generateTokenResponse = await request.post(
        `${BASE_URL}/Account/v1/GenerateToken`,
        {
          data: {
            userName: USER_NAME,
            password: PASSWORD,
          },
        },
      );

      expect(
        generateTokenResponse.status(),
        'El código de estado debe ser 200 (Success)',
      ).toBe(200);

      const tokenData = await generateTokenResponse.json();
      expect(tokenData).toHaveProperty('token');
      expect(typeof tokenData.token).toBe('string');
      expect(tokenData).toHaveProperty('expires');
      expect(tokenData).toHaveProperty('status');
      expect(tokenData).toHaveProperty('result');

      authToken = tokenData.token;
      console.log(
        `✅ Token generado exitosamente: ${authToken.substring(0, 10)}...`,
      );

      const loginResponse = await request.post(`${BASE_URL}/Account/v1/Login`, {
        data: {
          userName: USER_NAME,
          password: PASSWORD,
        },
      });
      expect(loginResponse.status()).toBe(200);
      const loginData = await loginResponse.json();
      expect(loginData).toHaveProperty('userId');

      userId = loginData.userId;
      console.log(`✅ User ID obtenido para autenticación: ${userId}`);
    },
  );


  test('Should retrieve the list of all books and validate its structure', async ({
    request,
  }) => {
    console.log('\n--- PASO 2: OBTENER TODOS LOS LIBROS ---');
    const booksResponse = await request.get(`${BASE_URL}/BookStore/v1/Books`);

    expect(booksResponse.status(), 'El código de estado debe ser 200').toBe(
      200,
    );

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
      `✅ Endpoint /BookStore/v1/Books validado. Total de libros: ${booksData.books.length}`,
    );
  });

  test('Should successfully consume an authenticated method (Get User) using the generated token', async ({
    request,
  }) => {
    console.log('\n--- PASO 3: CONSUMIR MÉTODO AUTENTICADO ---');
    const getUserResponse = await request.get(
      `${BASE_URL}/Account/v1/User/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    expect(
      getUserResponse.status(),
      'El código de estado debe ser 200 para un token válido',
    ).toBe(200);

    const userData = await getUserResponse.json();
    expect(userData).toHaveProperty('userId', userId);
    expect(userData).toHaveProperty('username', USER_NAME);
    expect(Array.isArray(userData.books)).toBe(true);


    if (userData.books.length > 0) {
      const userBook = userData.books[0];
      expect(userBook).toHaveProperty('isbn');
      expect(userBook).toHaveProperty('title');
    }

    console.log(`✅ Consumo autenticado GET /Account/v1/User/{UUID} exitoso.`);
  });
});
