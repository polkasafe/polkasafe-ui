// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Form, Input } from 'antd';
import React, { useState } from 'react';
import appsBG from 'src/assets/icons/apps-bg.svg';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { NotifyMail } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';

const Apps = () => {
	const { network } = useGlobalApiContext();
	const [form] = Form.useForm();

	const [loading, setLoading] = useState<boolean>(false);
	const [email, setEmail] = useState<string>('');

	const handleAddEmail = async () => {
		try{
			setLoading(true);
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				setLoading(false);
				return;
			}
			else{

				const addEmailRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addAppsAlertRecipient`, {
					body: JSON.stringify({
						email
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: addEmailData, error: addEmailError } = await addEmailRes.json() as { data: string, error: string };

				if(addEmailError) {

					queueNotification({
						header: 'Error!',
						message: addEmailError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if(addEmailData){
					queueNotification({
						header: 'Success!',
						message: 'Your Email has been added successfully!',
						status: NotificationStatus.SUCCESS
					});
					setEmail('');
					setLoading(false);

				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	return (
		<div className='h-full bg-bg-main rounded-lg m-auto flex items-center justify-center'>
			<Form form={form} className='flex flex-col items-center justify-center'>
				<img src={appsBG} alt="bg"/>
				<h1 className="text-base text-primary m-5 font-bold">Cooking Our Apps.</h1>
				<p className='text-text_secondary'>We are going to launch Apps on <span className='text-primary'>PolkaSafe</span> very soon.</p>
				<p className='text-text_secondary mt-1 mb-2'>Stay Tuned.</p>
				<div className="flex justify-around">
					<Form.Item className='m-0 mr-2' name='email' validateStatus={!email ? 'error' : 'success'} rules={[{ message: 'Email Is Required.', required: true }, { message: 'Invalid Email', type: 'email'  }]}>
						<Input id='email' value={email} onChange={(e) => setEmail(e.target.value)} className= 'placeholder-text_placeholder bg-bg-secondary text-white p-2 outline-none border-none min-w-[300px]' placeholder='name@example.com' />
					</Form.Item>
					<Button disabled={!email} loading={loading} onClick={handleAddEmail} className={`flex items-center justify-center ${!email ? 'bg-highlight text-text_secondary' : 'bg-primary text-white'} border-none ml-1 py-4`}><NotifyMail/>Notify me</Button>
				</div>
			</Form>
		</div>
	);
};

export default Apps;