import { User } from "./types/discord";
import { appealForm, generateHTMLFromConfig, landingPage } from "./utils/html";
import { handleOauth, getUserInfo } from "./utils/oauth";
import { parse } from "cookie";
import { calculatePermission, disableAllButtons, handleAction, sendWebhook } from "./utils/discord";
import { verify } from "./utils/verify";
import { Interaction, InteractionCallbackType, InteractionType } from "./types/interaction";
import { respond } from "./utils/helpers";
import { CONFIG_HTML } from "./config";

export async function handleRequest(request: Request): Promise<Response> {
	const { pathname } = new URL(request.url);

	if (pathname === "/submit" && request.method === "POST") {
		await handlePOST(request);

		return new Response(null, {
			status: 301,
			headers: {
				Location: `${REDIRCT_URI}/?msg=Sucessfully submitted the form`,
				"Set-Cookie": "access_token=deleted",
			},
		});
	}

	if (pathname === "/interaction") {
		return await handleInteraction(request);
	}

	const accessToken = await handleOauth(request);
	let user: User = await getUserInfo(accessToken);

	return new Response(
		`<!DOCTYPE html>
  <html lang="en">
    <head>
      	<meta charset="UTF-8" />
      	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
      	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
    	<title>Ban appeal</title>

		<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymous">
		
    </head>
    <body>
	<div class="alert alert-info text-center" role="alert" id="msg" hidden>
  		
	</div>

      ${
				accessToken !== "invalid_request"
					? `
					${appealForm(user)}
					${generateHTMLFromConfig().join("<br/>")}
        			`
					: landingPage
			}


		<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js" integrity="sha384-pprn3073KE6tl6bjs2QrFaJGz5/SUsLqktiwsUTF55Jfv3qYSDhgCecCxMW52nD2" crossorigin="anonymous"></script>
		
		<script> 
			const params = new Proxy(new URLSearchParams(window.location.search), {
				get: (searchParams, prop) => searchParams.get(prop),
		  	});

		  const value = params.msg;
		  if (value) {
			const obj = document.getElementById("msg")
			obj.hidden = false;
			obj.innerText = value;
		  }
		
		</script>
    </body>
  </html>
  `,
		{
			headers: {
				"content-type": "text/html;charset=UTF-8",
				"Set-Cookie": `access_token=${accessToken}; Max-Age=${60 * 60 * 1 /* 1 hour */}`,
			},
		},
	);
}

async function handlePOST(request: Request) {
	const cookie = parse(request.headers.get("Cookie") || "");
	const accessToken = cookie.access_token;
	const user = await getUserInfo(accessToken);
	if (user.message === "401: Unauthorized") {
		return new Response(null, {
			status: 301,
			headers: {
				Location: `${REDIRCT_URI}/?msg=Something went wrong with submitting the form try again`,
				"Set-Cookie": "access_token=deleted",
			},
		});
	}
	let input = await request.formData();

	let output: any = {};
	for (let [key, value] of input) {
		let tmp = output[key];
		if (tmp === undefined) {
			output[key] = value;
		} else {
			// @ts-ignore
			output[key] = [].concat(tmp, value);
		}
	}

	for (const [key, _] of Object.entries(output)) {
		const config = CONFIG_HTML.find((q) => q.key == key);

		if (!config) {
			return new Response(null, {
				status: 301,
				headers: {
					Location: `${REDIRCT_URI}/?msg=Something went wrong with submitting the form try again`,
					"Set-Cookie": "access_token=deleted",
				},
			});
		}
	}

	await sendWebhook(output, user, accessToken);
}
async function handleInteraction(request: Request): Promise<Response> {
	if (!request.headers.get("X-Signature-Ed25519") || !request.headers.get("X-Signature-Timestamp")) return Response.redirect("https://github.com/y3ll0wlife");
	if (!(await verify(request))) return new Response("", { status: 401 });

	const interaction: Interaction = await request.json();
	if (interaction.type === InteractionType.PING)
		return respond({
			type: InteractionCallbackType.PONG,
		});

	if (!interaction.data)
		return respond({
			type: 4,
			data: {},
		});

	if (interaction.data.custom_id?.startsWith("approve") || interaction.data.custom_id?.startsWith("deny")) {
		const [action, userId] = interaction.data.custom_id.split("|");

		if (!calculatePermission(interaction.member?.permissions!).includes("BAN_MEMBERS")) {
			return respond({
				type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					flags: 64,
					content: `This maze was not meant for you.`,
				},
			});
		}

		const jwt = require("@tsndr/cloudflare-worker-jwt");
		const token = interaction.message?.embeds[0].footer.text;
		const isValid = await jwt.verify(token, ENCRYPTION_KEY);
		if (!isValid)
			return respond({
				type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					flags: 64,
					content: `JWT token is invalid. Can't validate this user properly.`,
				},
			});

		const { payload } = jwt.decode(token);

		const reponse = await handleAction(action, userId, interaction.guild_id!, payload.accessToken);

		if (reponse.success == false) {
			return respond({
				type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					flags: 64,
					content: `Error: ${reponse.message}`,
				},
			});
		}

		let data = {
			type: 4,
			data: {},
		};

		switch (action) {
			case "approve":
				data = {
					type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						flags: 64,
						content: `Great I have now unbanned the user from the server`,
					},
				};
				break;

			case "approveplus":
				data = {
					type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						flags: 64,
						content: `Great I have now unbanned and added the user back to the server`,
					},
				};
				break;

			case "deny":
				data = {
					type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						flags: 64,
						content: `Denied the request`,
					},
				};
				break;

			default:
				break;
		}

		await disableAllButtons(interaction, action);

		return respond(data);
	}

	return respond({
		type: 4,
		data: {
			content: `:eyes: This should not happen`,
		},
	});
}
