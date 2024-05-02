import { beforeEach, expect, test } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import App from '../App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { server } from '../mocks/server';
import 'mutationobserver-shim';
import fs from 'fs';
import path from 'path';

const loginPage = fs
  .readFileSync(path.resolve(__dirname, '../components/Login.jsx'), 'utf8')
  .replaceAll(/(?:\r\n|\r|\n| )/g, '');

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  document.body.innerHTML = '';
});
beforeEach(() => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});

test('Sign In butonu disabled olarak başlıyor', async () => {
  const loginButton = screen.getByText('Sign In');
  expect(loginButton).toBeDisabled();
});

test('Terms seçilir ise buton enabled oluyor', async () => {
  const user = userEvent.setup();

  const terms = screen.getByLabelText(/I agree to/i);
  const loginButton = screen.getByText('Sign In');

  await user.click(terms);
  expect(loginButton).not.toBeDisabled();
});

test("Terms'ün seçili olma durumu kaldırılır ise buton tekrar disabled oluyor", async () => {
  const user = userEvent.setup();

  const terms = screen.getByLabelText(/I agree to/i);
  const loginButton = screen.getByText('Sign In');

  await user.click(terms);
  expect(loginButton).not.toBeDisabled();
  await user.click(terms);
  expect(loginButton).toBeDisabled();
});

test('Terms kabul edilmez ise form submit olmuyor', async () => {
  const user = userEvent.setup();

  const login = screen.getByText('Login');
  await user.click(login);

  const email = screen.getByPlaceholderText(/Enter your email/i);
  const password = screen.getByPlaceholderText(/Enter your password/i);
  const loginButton = screen.getByText('Sign In');

  await user.type(email, 'erdem.guntay@wit.com.tr');
  await user.type(password, '9fxIH0GXesEwH_I');
  expect(loginButton).toBeDisabled();
  await user.click(loginButton);
});

test('Form doğru bilgiler ile doldurulunca form submit oluyor', async () => {
  const user = userEvent.setup();

  const login = screen.getByText('Login');
  await user.click(login);

  const email = screen.getByPlaceholderText(/Enter your email/i);
  const password = screen.getByPlaceholderText(/Enter your password/i);
  const terms = screen.getByLabelText(/I agree to/i);
  const loginButton = screen.getByText('Sign In');

  await user.type(email, 'erdem.guntay@wit.com.tr');
  await user.type(password, '9fxIH0GXesEwH_I');
  await user.click(terms);
  expect(loginButton).not.toBeDisabled();
  await user.click(loginButton);
  await screen.findByText('/main');
});
