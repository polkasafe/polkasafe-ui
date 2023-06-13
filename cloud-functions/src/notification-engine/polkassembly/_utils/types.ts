import { IUserNotificationChannelPreferences, IUserNotificationPreferences, IUserNotificationTriggerPreferences } from '../../notification_engine_constants';

export enum EPAProposalType {
	DEMOCRACY_PROPOSALS = 'democracy_proposals',
	TECH_COMMITTEE_PROPOSALS = 'tech_committee_proposals',
	TREASURY_PROPOSALS = 'treasury_proposals',
	REFERENDUMS = 'referendums',
	FELLOWSHIP_REFERENDUMS = 'fellowship_referendums',
	COUNCIL_MOTIONS = 'council_motions',
	BOUNTIES = 'bounties',
	TIPS = 'tips',
	CHILD_BOUNTIES = 'child_bounties',
	OPEN_GOV = 'referendums_v2',
	REFERENDUM_V2 = 'referendums_v2',
	DISCUSSIONS = 'discussions',
	GRANTS = 'grants'
}

export enum EPAPostStatus {
	SUBMITTED= 'submitted',
	VOTING= 'voting',
	CLOSED= 'closed'
}

export interface IPAUserPreference {
	user_id: number;
	notification_settings: IUserNotificationPreferences;
	post_subscriptions: {
		[key in EPAProposalType]?: (number | string)[];
	}
}

export interface IPAPostComment {
  user_id: number,
  content: string,
  created_at: Date,
  id: string,
  updated_at: Date,
  sentiment: number|0;
  username: string,
  user_profile_img: string;
}

export interface IPACommentReply {
  user_id: number,
  content: string,
  created_at: Date,
  id: string,
  updated_at: Date,
  username: string,
  user_profile_img: string,
}

export enum EPASocialType {
	EMAIL = 'Email',
	RIOT = 'Riot',
	TWITTER = 'Twitter',
	TELEGRAM = 'Telegram',
	DISCORD = 'Discord',
}

export interface IPASocial {
	type: EPASocialType;
	link: string;
}

export interface IPAProfileDetails {
	bio?: string;
	badges?: string[];
	title?: string;
	image?: string;
	social_links?: IPASocial[]
}

export interface IPAUserNotificationPreferences {
	channelPreferences: {[channel:string]: IUserNotificationChannelPreferences},
	triggerPreferences: {
		[network:string] : {[index:string] : IUserNotificationTriggerPreferences}
	}
}

export interface IPAUser {
	email: string;
	email_verified: boolean;
	id: number;
	password: string;
	profile: IPAProfileDetails;
	salt: string;
	username: string;
	web3_signup: boolean;
	notification_preferences?: IPAUserNotificationPreferences
}

export interface IPANotification {
	id: string,
	userId: number,
	created_at: Date,
	title: string,
	message: string,
	url?: string,
	network: string
}

export enum EMentionType {
	COMMENT = 'comment',
	REPLY = 'reply',
	POST = 'post'
}
