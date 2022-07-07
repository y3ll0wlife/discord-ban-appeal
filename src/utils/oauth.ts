import { parse } from "cookie";
import { Oauth2Token } from "../types/oauth";
import { User } from "../types/discord";

export async function handleOauth(request: Request): Promise<string> {
	const cookie = parse(request.headers.get("Cookie") || "");
	const accessToken = cookie.access_token;

	if (!(await getUserInfo(accessToken)).message) return cookie.access_token;

	const code = request.url.split("code=")[1];

	const response = await fetch("https://discord.com/api/oauth2/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			grant_type: "authorization_code",
			code,
			redirect_uri: REDIRCT_URI,
		}),
	});

	const responseData: Oauth2Token = await response.json();

	if (responseData.error) return responseData.error;
	return responseData.access_token;
}

export async function revokeToken(acessToken: string): Promise<Response> {
	const response = await fetch("https://discord.com/api/oauth2/token/revoke", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			token: acessToken,
		}),
	});

	return response;
}

export async function getUserInfo(accessToken: string): Promise<User> {
	const response = await fetch(`https://discord.com/api/users/@me`, {
		method: "GET",
		headers: {
			authorization: `Bearer ${accessToken}`,
		},
	});
	const responseData: User = await response.json();

	return responseData;
}
