// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';

export const notify = async ({ network, triggerName, args }: { network: string, triggerName: string, args: any }) => {
	try{
		const userAddress = localStorage.getItem('address');
		const signature = localStorage.getItem('signature');

		if(!userAddress || !signature) {
			console.log('ERROR');
			return;
		}
		else{

			const notifyRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/notify`, {
				body: JSON.stringify({
					args,
					trigger: triggerName
				}),
				headers: firebaseFunctionsHeader(network),
				method: 'POST'
			});

			const { data: notifyData, error: notifyError } = await  notifyRes.json() as { data: string, error: string };

			if(notifyError) {
				queueNotification({
					header: 'Error',
					message: notifyError,
					status: NotificationStatus.ERROR
				});
				return { error:notifyError };
			}

			if(notifyData){
				queueNotification({
					header: 'Notification Sent',
					message: '',
					status: NotificationStatus.SUCCESS
				});
				return { message:'success' };
			}

		}
	} catch (error){
		console.log('ERROR', error);
		return { error };
	}
};