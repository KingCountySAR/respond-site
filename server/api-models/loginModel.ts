export interface LoginError {
  error: string,
}

export interface LoginResult {
  userId: string,
  name: string,
  email: string,
  domain: string,
  isTrainee?: boolean,
  picture?: string,
  error?: undefined,
}

type LoginModel = LoginResult|LoginError;

export default LoginModel;