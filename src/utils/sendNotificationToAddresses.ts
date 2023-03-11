// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { INotificaion } from 'src/types';

interface Args extends Omit<INotificaion, 'created_at' | 'id'> {
	callHash: string
}

export default async function sendNotificationToAddresses({ addresses, callHash, message, type }: Args) {
	const newNotificationData: Omit<INotificaion, 'created_at' | 'id'>  = {
		addresses,
		link: `/transactions#${callHash}`,
		message,
		type
	};

	await fetch(`${FIREBASE_FUNCTIONS_URL}/sendNotification`, {
		body: JSON.stringify(newNotificationData),
		headers: firebaseFunctionsHeader(),
		method: 'POST'
	});
}