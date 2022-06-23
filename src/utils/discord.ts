import { MESSAGE_CONTENT } from "../config";
import { CONFIG_HTML } from "../config";
import { User } from "../types/discord";
import { ComponentButton, Embed, Interaction } from "../types/interaction";
import { revokeToken } from "./oauth";

export function generateAvatarUrl(userId: string | undefined, discriminator: number, hash: string | undefined | null) {
	if (!hash) return `https://cdn.discordapp.com/embed/avatars/${discriminator! % 5}.png`;
	return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${hash.startsWith("a_") ? "gif" : "png"}?size=4096`;
}

export function calculatePermission(permission: string): string[] {
	const flags: string[] = [];

	const permissionFlags = {
		CREATE_INSTANT_INVITE: 1 << 0,
		KICK_MEMBERS: 1 << 1,
		BAN_MEMBERS: 1 << 2,
		ADMINISTRATOR: 1 << 3,
		MANAGE_CHANNELS: 1 << 4,
		MANAGE_GUILD: 1 << 5,
		ADD_REACTIONS: 1 << 6,
		VIEW_AUDIT_LOG: 1 << 7,
		PRIORITY_SPEAKER: 1 << 8,
		STREAM: 1 << 9,
		VIEW_CHANNEL: 1 << 10,
		SEND_MESSAGES: 1 << 11,
		SEND_TTS_MESSAGES: 1 << 12,
		MANAGE_MESSAGES: 1 << 13,
		EMBED_LINKS: 1 << 14,
		ATTACH_FILES: 1 << 15,
		READ_MESSAGE_HISTORY: 1 << 16,
		MENTION_EVERYONE: 1 << 17,
		USE_EXTERNAL_EMOJIS: 1 << 18,
		VIEW_GUILD_INSIGHTS: 1 << 19,
		CONNECT: 1 << 20,
		SPEAK: 1 << 21,
		MUTE_MEMBERS: 1 << 22,
		DEAFEN_MEMBERS: 1 << 23,
		MOVE_MEMBERS: 1 << 24,
		USE_VAD: 1 << 25,
		CHANGE_NICKNAME: 1 << 26,
		MANAGE_NICKNAMES: 1 << 27,
		MANAGE_ROLES: 1 << 28,
		MANAGE_WEBHOOKS: 1 << 29,
		MANAGE_EMOJIS_AND_STICKERS: 1 << 30,
		USE_APPLICATION_COMMANDS: 1 << 31,
		REQUEST_TO_SPEAK: 1 << 32,
		MANAGE_EVENTS: 1 << 33,
		MANAGE_THREADS: 1 << 34,
		CREATE_PUBLIC_THREADS: 1 << 35,
		CREATE_PRIVATE_THREADS: 1 << 36,
		USE_EXTERNAL_STICKERS: 1 << 37,
		SEND_MESSAGES_IN_THREADS: 1 << 38,
		USE_EMBEDDED_ACTIVITIES: 1 << 39,
		MODERATE_MEMBERS: 1 << 40,
	};
	for (let [key, value] of Object.entries(permissionFlags)) {
		if ((parseInt(permission) & value) == value) flags.push(key);
	}

	return flags;
}

export async function sendWebhook(data: { [key: string]: string | string[] }, user: User, accessToken: string) {
	const description: string[] = [];
	const jwt = require("@tsndr/cloudflare-worker-jwt");
	const token = await jwt.sign({ accessToken }, ENCRYPTION_KEY);

	for (const [key, value] of Object.entries(data)) {
		const config = CONFIG_HTML.find((q) => q.key == key);
		if (!config) continue;

		switch (config.type) {
			case "text":
			case "textarea":
				description.push(`**${config.label}**\n${value === "" ? "*User did not answer this question*" : value}`);
				break;

			case "select":
				const inputSelect = config.selectInputs?.find((input) => input.value === value);
				description.push(`**${config.label}**\n${inputSelect?.text} \`(${value})\``);
				break;

			case "range":
				description.push(`**${config.label}**\n${value}`);
				break;

			case "checkbox":
				let content = `**${config.label}**\n`;

				if (typeof value === "string") {
					const inputCheckbox = config.checkboxInput?.find((input) => input.value === value);
					content += `${inputCheckbox?.text} \`(${value})\`\n`;
				} else {
					for (let i = 0; i < value.length; i++) {
						const inputCheckbox = config.checkboxInput?.find((input) => input.value === value[i]);
						content += `${inputCheckbox?.text} \`(${value[i]})\`\n`;
					}
				}
				description.push(content);
				break;

			default:
				break;
		}
	}

	const embeds: Embed[] = [
		{
			author: {
				name: `${user.username}#${user.discriminator}`,
				icon_url: generateAvatarUrl(user.id, user.discriminator, user.avatar),
			},
			image: {
				url: user.banner ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith("a_") ? "gif" : "png"}?size=4096` : null,
			},
			color: user.accent_color,
			footer: {
				text: token,
			},
			description: `**ID:** \`${user.id}\`\n**Locale:** \`${user.locale}\`\n\n__**Answers**__\n${description.join("\n\n")}`,
		},
	];

	const components: ComponentButton[] = [
		{
			type: 1,
			components: [
				{
					type: 2,
					label: "Approve User",
					style: 3,
					custom_id: `approve|${user.id}`,
				},
				{
					type: 2,
					label: "Approve User and force add them",
					style: 3,
					custom_id: `approveplus|${user.id}`,
				},
				{
					type: 2,
					label: "Deny",
					style: 4,
					custom_id: `deny|${user.id}`,
				},
			],
		},
	];

	await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
		method: "POST",
		headers: { authorization: `Bot ${BOT_TOKEN}`, "content-type": "application/json" },
		body: JSON.stringify({
			content: MESSAGE_CONTENT,
			embeds,
			components,
		}),
	});
}

export async function disableAllButtons(interaction: Interaction, action: string): Promise<void> {
	try {
		if (!interaction.message) return;
		if (action === "approveplus") action = "approved and added back to the server";

		let embeds = interaction.message.embeds;
		embeds[0].description = `${embeds[0].description}\n\n**Handled by** ${interaction.member?.user?.username}#${interaction.member?.user?.discriminator} \`(${interaction.member?.user?.id})\`\n**Action given:** ${action}`;

		await fetch(`https://discord.com/api/v10/channels/${interaction.message.channel_id}/messages/${interaction.message.id}`, {
			method: "PATCH",
			headers: { authorization: `Bot ${BOT_TOKEN}`, "content-type": "application/json" },
			body: JSON.stringify({
				content: interaction.message.content,
				embeds,
				components: interaction.message.components?.map((c) => {
					return {
						type: c.type,
						components: c.components.map((c2: any) => {
							return {
								...c2,
								disabled: true,
							};
						}),
					};
				}),
			}),
		});
	} catch (err) {
		console.error(`Disable all buttons error`, err);
	}
}

async function unban(userId: string, guildId: string) {
	return await fetch(`https://discord.com/api/v10/guilds/${guildId}/bans/${userId}`, {
		method: "DELETE",
		headers: {
			authorization: `Bot ${BOT_TOKEN}`,
			"X-Audit-Log-Reason": `Appeal successful`,
		},
	});
}

async function forceAdd(userId: string, guildId: string, accessToken: string) {
	return await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
		method: "PUT",
		headers: {
			authorization: `Bot ${BOT_TOKEN}`,
			"content-type": "application/json",
		},
		body: JSON.stringify({
			access_token: accessToken,
		}),
	});
}

export async function handleAction(action: string, userId: string, guildId: string, accessToken: string): Promise<{ message: string; success: boolean }> {
	let message = "success";
	let success = true;

	switch (action) {
		case "approve":
			const unbanResponse: Response = await unban(userId, guildId);
			if (unbanResponse.status !== 204) {
				const data: any = await unbanResponse.json();
				message = `${data.message} (${data.code})`;
				success = false;
			}

			break;
		case "approveplus":
			const unbanResponsePlus: Response = await unban(userId, guildId);
			if (unbanResponsePlus.status !== 204) {
				const dataPlus: any = await unbanResponsePlus.json();
				message = `${dataPlus.message} (${dataPlus.code})`;
			}

			const forceAddResponse: Response = await forceAdd(userId, guildId, accessToken);
			if (forceAddResponse.status !== 201) {
				message += `\nFailed to add the server (${forceAddResponse.status})`;
				success = false;
			}

			break;

		default:
			break;
	}

	await revokeToken(accessToken);

	return {
		message,
		success,
	};
}
