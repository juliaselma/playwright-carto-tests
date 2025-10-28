import { test as base, expect } from '@playwright/test';
import { getAuthBody } from './payloads/authPayloads';
import { API_ROUTES } from './config/apiEndpoints';

type AuthFixtures = {
  authToken: string;
  userId: string;
};

export const test = base.extend<AuthFixtures>({
  authToken: async ({ request }, use) => {
    const USER_NAME = process.env.USER_NAME;
    const PASSWORD = process.env.PASSWORD;

    const generateTokenResponse = await request.post(
      API_ROUTES.GENERATE_TOKEN,
      { data: getAuthBody(USER_NAME!, PASSWORD!) },
    );
    expect(generateTokenResponse.status()).toBe(200);
    const tokenData = await generateTokenResponse.json();
    const token = tokenData.token;

    await use(token);
  },

  userId: async ({ request }, use) => {
    const USER_NAME = process.env.USER_NAME;
    const PASSWORD = process.env.PASSWORD;

    const loginResponse = await request.post(API_ROUTES.LOGIN, {
      data: getAuthBody(USER_NAME!, PASSWORD!),
    });
    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    const id = loginData.userId;

    await use(id);
  },
});
