import { Config } from "./types/config";

// The message that will be sent with each new appeal
// <@User Id> for user pings
// <@&Role ID> for role pings
export const MESSAGE_CONTENT: string = "New ban appeal";

// This is the information that will be presented on the website
export const WEBSITE_CONFIG = {
	landingText: "Welcome to the ban appeal form for [Your Server Name]!",
	landingTextDescription: "Press the login button to start the process",
};

// Example configuration
export const CONFIG_HTML: Config[] = [
	{
		label: "Why should you be unbanned?",
		type: "text",
		key: "why-unban",
		required: true,
	},
	{
		label: "What was the reason for the ban (if you know)?",
		type: "textarea",
		key: "reason-for-ban",
		required: true,
	},
	{
		label: "Do you feel like the ban was justified?",
		type: "select",
		key: "ban-justified",
		required: true,
		selectInputs: [
			{
				text: "Yes",
				value: "yes",
			},
			{
				text: "No",
				value: "no",
			},
		],
	},
	{
		label: "To as much as of extent can you explain as to why you were banned?",
		type: "textarea",
		key: "explain-ban",
		required: true,
	},
	{
		label: "Anything else you want to say?",
		type: "textarea",
		key: "other-info",
		required: true,
	},
];

// THESE VALUES SHOULD NOT BE CHANGED
const scopes = ["identify", "guilds.join"].join(" ");
export const OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRCT_URI}&response_type=code&scope=${scopes}`;
