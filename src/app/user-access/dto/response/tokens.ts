export interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface TwitterOAuthTokens {
  oauth_callback_configmed: string;
  oauth_token: string;
  oauth_token_secret: string;
}

export interface TwitterOAuthCredentials {
  redirect_state: string;
  oauth_token: string;
  oauth_verifier: string;
}

export interface ISimpleSignUpCredentials {
  email: string;
  full_name: string;
}
