// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Input, MenuProps } from 'antd';
import { Checkbox, Dropdown } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IUserNotificationPreferences, NotificationStatus } from 'src/types';
import { BellIcon, CircleArrowDownIcon, MailIcon } from 'src/ui-components/CustomIcons';
import PrimaryButton from 'src/ui-components/PrimaryButton';
import queueNotification from 'src/ui-components/QueueNotification';

const Notifications = () => {

	const { network } = useGlobalApiContext();
	const { notificationPreferences, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const triggerPreferences = notificationPreferences?.triggerPreferences || {};
	const [notifyAfter, setNotifyAfter] = useState<number>(notificationPreferences?.triggerPreferences?.pendingTransaction || 2);
	const [email, setEmail] = useState<string>('');
	const [newTxn, setNewTxn] = useState<boolean>(notificationPreferences?.triggerPreferences?.newTransaction || true);
	const [txnExecuted, setTxnExecuted] = useState<boolean>(notificationPreferences?.triggerPreferences?.transactionExecuted || true);
	const [pendingTxn, setPendingTxn] = useState(notificationPreferences?.triggerPreferences?.pendingTransaction === 0 ? false : true);
	const [loading, setLoading] = useState<boolean>(false);

	const notifyAfterHours: MenuProps['items'] = [1, 2, 4, 6, 8, 12, 24, 48].map((hr) => {
		return {
			key: hr,
			label: <span className={`${hr === notifyAfter ? 'text-primary' : 'text-white'}`}>{hr === 1 ? `${hr} hr` : `${hr} hrs`}</span>
		};
	});

	const onNotifyHoursChange: MenuProps['onClick'] = ({ key }) => {
		setNotifyAfter(Number(key));
	};

	const updateNotificationPreferences = useCallback(async () => {

		try{
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				return;
			}
			else{
				if(newTxn === triggerPreferences.newTransaction && txnExecuted === triggerPreferences.transactionExecuted && notifyAfter === triggerPreferences.pendingTransaction && email === notificationPreferences.channelPreferences['email'].handle ) return;

				const newPreferences: IUserNotificationPreferences = {
					channelPreferences: notificationPreferences.channelPreferences,
					triggerPreferences: {
						newTransaction: newTxn,
						pendingTransaction: pendingTxn ? notifyAfter : 0,
						transactionExecuted: txnExecuted
					}
				};
				setLoading(true);

				const addAddressRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateNotificationPreferences`, {
					body: JSON.stringify({
						notificationPreferences: newPreferences
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: updatePreferencesData, error: updatePreferencesError } = await addAddressRes.json() as { data: string, error: string };

				if(updatePreferencesError) {
					queueNotification({
						header: 'Failed!',
						message: updatePreferencesError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if(updatePreferencesData){
					queueNotification({
						header: 'Success!',
						message: 'Your Notification Preferences has been Updated.',
						status: NotificationStatus.SUCCESS
					});
					setUserDetailsContextState(prev => ({
						...prev,
						notificationPreferences: newPreferences
					}));
					setLoading(false);
				}

			}
		} catch (error){
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in Updating Notification Preferences.',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [email, network, newTxn, notifyAfter, pendingTxn, txnExecuted]);

	useEffect(() => {
		updateNotificationPreferences();
	}, [updateNotificationPreferences]);

	return (
		<div className='flex flex-col gap-y-4'>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4 text-text_secondary'>
				<div className='col-span-3'><span className='flex items-center gap-x-2'><BellIcon /> General</span></div>
				<div className='col-span-7'>
					<p className='mb-4'>Configure the notifications you want Polkasafe to send in your linked channels</p>
					<div className='flex flex-col gap-y-3'>
						<Checkbox disabled={loading} className='text-white m-0 [&>span>span]:border-primary' value={newTxn} onChange={(e) => setNewTxn(e.target.checked)}>New Transaction needs to be signed</Checkbox>
						<Checkbox disabled={loading} className='text-white m-0 [&>span>span]:border-primary' value={txnExecuted} onChange={(e) => setTxnExecuted(e.target.checked)}>Transaction has been signed and executed</Checkbox>
						<div className='flex items-center gap-x-3'>
							<Checkbox disabled={loading} className='text-white m-0 [&>span>span]:border-primary' value={pendingTxn} onChange={(e) => setPendingTxn(e.target.checked)}>For Pending Transactions remind signers every:</Checkbox>
							<Dropdown disabled={!pendingTxn} className='text-white' trigger={['click']} menu={{ items: notifyAfterHours, onClick: onNotifyHoursChange }} >
								<button className={`'flex items-center gap-x-2 border ${!pendingTxn ? 'border-text_secondary': 'border-primary'} rounded-md px-3 py-1 text-sm leading-[15px] text-text_secondary`}>{`${notifyAfter} ${notifyAfter === 1 ? 'hr' : 'hrs'}`} <CircleArrowDownIcon className='hidden md:inline-flex text-base text-primary'/></button>
							</Dropdown>
						</div>
					</div>
				</div>
			</div>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4 text-text_secondary'>
				<div className='col-span-3'><span className='flex items-center gap-x-2'><MailIcon /> Email Notifications</span></div>
				<div className='col-span-5 flex items-center gap-x-3'>
					<Input
						id="balance"
						onChange={(a) => setEmail(a.target.value)}
						placeholder={'Enter email'}
						className="w-full text-sm font-normal leading-[15px] border-0 outline-0 p-2 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24"
					/>
					<PrimaryButton onClick={() => console.log('verify')} disabled={!email}>
						<p className='font-normal text-sm'>Verify</p>
					</PrimaryButton>
				</div>
			</div>
		</div>
	);
};

export default Notifications;