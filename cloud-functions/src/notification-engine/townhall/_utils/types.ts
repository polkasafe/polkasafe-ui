import {
	IUserNotificationChannelPreferences,
	IUserNotificationTriggerPreferences
} from '../../notification_engine_constants';

export enum ETHNotificationTrigger {
    NEW_DISCUSSION_CREATED = 'newDiscussionCreated',
    NEW_OFFCHAIN_PROPOSAL_CREATED = 'newOffchainProposalCreated',
    NEW_ONCHAIN_PROPOSAL_CREATED = 'newOnchainProposalCreated',
}

export enum ETHPostType {
	DISCUSSION = 'discussion',
	PROPOSAL = 'proposal',
	ONCHAIN_PROPOSAL = 'onchain_proposal',
	SNAPSHOT_PROPOSAL = 'snapshot_proposal',
	DISCOURSE_POST = 'discourse_post'
}

enum ETHPostStatus {
	PENDING = 'pending',
	ACTIVE = 'active',
	CANCELED = 'canceled',
	DEFEATED = 'defeated',
	SUCCEEDED = 'succeeded',
	QUEUED = 'queued',
	EXPIRED = 'expired',
	EXECUTED = 'executed',
	CLOSED = 'closed',
	SUBMITTED = 'submitted',
	PENDING_QUEUE = 'pending_queue',
	PENDING_EXECUTION = 'pending_execution'
}

export interface ITHPost {
	comments_count: number;
	contract_address?: string | null;
	created_at: Date;
	description: string;
	discussion?: string;
	end_date?: Date | null;
	house_id: string;
	id: string;
	is_vote_results_hide_before_voting_ends?: boolean;
	post_type: ETHPostType;
	start_date?: Date | null;
	status?: ETHPostStatus;
	tags: string[];
	title: string;
	updated_at: Date;
	user_id?: string | null;
	proposer?: string | null;
	voting_system_options?: string[];
	scores?: number[];
	total_votes?: number | null;
	// AI summary
	summary?: string | null;
	// Voted
	is_voted?: boolean;

	create_tx_hash?: string | null;
	queue_tx_hash?: string | null;
	execute_tx_hash?: string | null;
	cancel_tx_hash?: string | null;

	targets?: string[] | null;
	values?: string[] | null;
	calldatas?: string[] | null;

	// PROJECT FOR CUSTOM DEPLOYMENT
	project_id: string;

	subscribers: string[];
}

export interface ITHUserNotificationPreferences {
	channelPreferences: { [channel: string]: IUserNotificationChannelPreferences };
	triggerPreferences: {
		[house_id: string]: { [trigger_name: string]: IUserNotificationTriggerPreferences };
	};
}

export interface ITHUser {
	address: string | null;
	bio: string | null;
	created_at?: Date;
	email: string | null;
	follow_houses: string[];
	id: string;
	img_url: string | null;
	is_substrate_user: boolean;
	is_username_autogenerated: boolean | null;
	lens_handle?: string | null;
	name: string | null;
	username: string | null;
	updated_at?: Date;
	wishlist?: string[];
	notification_preferences: ITHUserNotificationPreferences;
}

export interface ITHNotification {
	id: string;
	created_at: Date;
	title: string;
	message: string;
	url?: string;
}

export enum ETHContentType {
	COMMENT = 'comment',
	REPLY = 'reply',
	POST = 'post'
}

export enum ETHBountySource {
	TWITTER = 'twitter',
	LENS = 'lens',
	BOUNTY_BIRD = 'bounty bird',
	FARCASTER = 'farcaster'
}

export enum ETHBountyStatus {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED'
}

export interface ITHBounty {
	id: string;
	username: string;
	display_name: string;
	status: ETHBountySource;
	source: ETHBountyStatus;
	source_author_id?: string;
	source_id?: string;
	source_text?: string;
	task: string;
	amount: string;
	deadline?: Date;
	max_claims: number;
	created_at: Date;
	updated_at: Date;
	replies_count?: number;
	deleted?: boolean;
}

export interface ITHComment {
	id: string;
	is_reason?: boolean;
	created_at: Date;
	updated_at: Date;
	post_id: string;
	house_id: string;
	post_type: ETHPostType;
	content: string;
	user_id: string;
	discourse_id: number | null;

	// For Reply
	is_reply: boolean;
	parent_id: string | null;

	// report
	is_flagged: boolean;
	is_moderator_approval: boolean;

	// PROJECT FOR CUSTOM DEPLOYMENT
	project_id: string;
}
