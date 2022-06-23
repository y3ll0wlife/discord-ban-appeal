export interface User {
	id: string;
	username: string;
	avatar: string | null;
	avatar_decoration: string | null;
	discriminator: number;
	public_flags: number;
	flags: number;
	banner: string | null;
	banner_color: string | null;
	accent_color: number | null;
	locale: string;
	mfa_enabled: boolean;
	premium_type: 0 | 1 | 2;

	message?: "401: Unauthorized";
	code?: number;
}

export interface GuildMember {
	user?: User;
	nick?: string | null;
	avatar?: string | null;
	roles: string[];
	joined_at: string;
	premium_since?: string | null;
	deaf: boolean;
	mute: boolean;
	pending?: boolean;
	permissions?: string;
	communication_disabled_until?: string | null;
}
