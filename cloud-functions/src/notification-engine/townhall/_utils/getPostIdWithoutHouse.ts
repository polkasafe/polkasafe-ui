import { ITHPost } from './types';

export const getPostIdWithoutHouse = (post: ITHPost) => {
	let post_id = '';
	if (post?.id?.includes(`${post?.house_id}--`)) {
		post_id = post?.id.replace(`${post?.house_id}--`, '');
	}
	return post_id;
};

export const getPostIdWithoutHouseId = (id: string, house_id: string) => {
	let post_id = '';
	if (id?.includes(`${house_id}--`)) {
		post_id = id.replace(`${house_id}--`, '');
	}
	return post_id;
};

export const getPostIdWithoutHouseIdV2 = (id: string) => {
	let post_id = '';
	if (id?.includes('--')) {
		post_id = id.split('--')[1] || '';
	}
	return post_id;
};
