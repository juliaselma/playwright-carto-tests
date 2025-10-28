export function getAuthBody(username: string, password: string) {
  return {
    userName: username,
    password: password,
  };
}
