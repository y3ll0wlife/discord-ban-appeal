export interface Oauth2Token {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
	token_type: "Bearer";

	error?: "invalid_request";
	error_description?: 'Invalid "code" in request.';
}

export type Oauth2Data = {
	client_id: string;
	client_secret: string;
	grant_type: "authorization_code";
	code: string;
	redirect_uri: string;
};
