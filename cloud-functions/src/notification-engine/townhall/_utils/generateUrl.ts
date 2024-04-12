import { getPostIdWithoutHouse } from './getPostIdWithoutHouse';
import { ITHPost } from './types';

export function getOrg(house_id: string) {
	if (house_id === 'astar') {
		return 'astar';
	} else if (house_id === 'polkadot') {
		return 'polkadot';
	} else if (house_id === 'kusama') {
		return 'kusama';
	} else if (house_id === 'ded') {
		return 'ded';
	}
	return null;
}

export function generatePostUrl(post: ITHPost) {
	const projectId = post.project_id;
	const org = getOrg(post.house_id);

	const postId = getPostIdWithoutHouse(post);
	if (projectId === 'astar') {
		if (org) {
			return `https://${org}.townhallgov.com/post/${postId}`;
		} else {
			return `https://astargov.com/${post?.house_id}/post/${postId}`;
		}
	} else {
		if (org) {
			return `https://${org}.townhallgov.com/post/${postId}`;
		} else {
			return `https://app.townhallgov.com/${post?.house_id}/post/${postId}`;
		}
	}
}
