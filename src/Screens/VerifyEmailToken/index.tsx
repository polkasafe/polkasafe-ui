// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect } from 'react';
import { useNavigate,useSearchParams } from 'react-router-dom';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { NotificationStatus } from 'src/types';
import Loader from 'src/ui-components/Loader';
import queueNotification from 'src/ui-components/QueueNotification';

const VerifyEmailToken = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { network } = useGlobalApiContext();

	useEffect(() => {
		const email = searchParams.get('email');
		const token = searchParams.get('token');
		const verifyEmail = async () => {
			const verifyEmailRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/verifyEmail`, {
				body: JSON.stringify({
					email,
					token
				}),
				headers: firebaseFunctionsHeader(network),
				method: 'POST'
			});

			const { data: verifyEmailData, error: verifyEmailError } = await  verifyEmailRes.json() as { data: string, error: string };

			if(verifyEmailError) {
				console.log(verifyEmailData);
				return;
			}

			if(verifyEmailData){
				queueNotification({
					header: 'Success!',
					message: 'Your Email has been verified.',
					status: NotificationStatus.SUCCESS
				});
				navigate('/');
			}
		};
		verifyEmail();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className='h-[70vh] bg-bg-main rounded-lg m-auto flex items-center justify-center'>
			<Loader />
		</div>
	);
};

export default VerifyEmailToken;