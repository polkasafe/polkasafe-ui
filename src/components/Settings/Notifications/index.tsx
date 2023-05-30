// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, MenuProps, Modal } from 'antd';
import { Checkbox } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { CHANNEL, IUserNotificationTriggerPreferences, NotificationStatus, Triggers } from 'src/types';
import { BellIcon, CheckOutlined, DiscordIcon, ElementIcon, MailIcon, OutlineCloseIcon, SlackIcon, TelegramIcon, WarningCircleIcon } from 'src/ui-components/CustomIcons';
import PrimaryButton from 'src/ui-components/PrimaryButton';
import queueNotification from 'src/ui-components/QueueNotification';

import DiscordInfoModal from './DiscordInfoModal';
import SlackInfoModal from './SlackInfoModal';
import TelegramInfoModal from './TelegramInfoModal';

const Notifications = () => {

	const { network } = useGlobalApiContext();
	const { pathname } = useLocation();
	const { notification_preferences, address, setUserDetailsContextState } = useGlobalUserDetailsContext();
	const [notifyAfter, setNotifyAfter] = useState<number>(2);
	const [email, setEmail] = useState<string>(notification_preferences?.channelPreferences?.['email']?.handle || '');
	const [emailValid, setEmailValid] = useState<boolean>(true);
	const [newTxn, setNewTxn] = useState<boolean>(false);
	const [txnExecuted, setTxnExecuted] = useState<boolean>(false);
	const [cancelledTxn, setCancelledTxn] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [verificationLoading, setVerificationLoading] = useState<boolean>(false);

	const [openTelegramModal, setOpenTelegramModal] = useState<boolean>(false);
	const [openDiscordModal, setOpenDiscordModal] = useState<boolean>(false);
	const [openSlackModal, setOpenSlackModal] = useState<boolean>(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [resendEmail, setResendEmail] = useState<boolean>(notification_preferences?.channelPreferences?.['email']?.verified || false);

	const emailVerificationRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	useEffect(() => {
		if(email){
			const validEmail = emailVerificationRegex.test(email);
			if(validEmail){
				setEmailValid(true);
			}
			else{
				setEmailValid(false);
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [email]);

	useEffect(() => {
		const triggerPreferences = notification_preferences?.triggerPreferences;
		if(triggerPreferences){
			setNewTxn(triggerPreferences[Triggers.INIT_MULTISIG_TRANSFER]?.enabled || false);
			setTxnExecuted(triggerPreferences[Triggers.EXECUTED_TRANSACTION]?.enabled || false);
			setCancelledTxn(triggerPreferences[Triggers.CANCELLED_TRANSACTION]?.enabled || false);
		}
	}, [notification_preferences]);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const notifyAfterHours: MenuProps['items'] = [1, 2, 4, 6, 8, 12, 24, 48].map((hr) => {
		return {
			key: hr,
			label: <span className={`${hr === notifyAfter ? 'text-primary' : 'text-white'}`}>{hr === 1 ? `${hr} hr` : `${hr} hrs`}</span>
		};
	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const onNotifyHoursChange: MenuProps['onClick'] = ({ key }) => {
		setNotifyAfter(Number(key));
		updateNotificationPreferences({ cancelled: true, executed: txnExecuted, newT: newTxn });
	};

	const updateNotificationPreferences = async ({ executed, newT, cancelled }: { newT: boolean, executed: boolean, cancelled: boolean }) => {

		try{
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				return;
			}
			else{
				const newPreferences: {[index: string]: IUserNotificationTriggerPreferences} = {
					[Triggers.CANCELLED_TRANSACTION]: {
						enabled: cancelled,
						name: Triggers.CANCELLED_TRANSACTION
					},
					[Triggers.EXECUTED_TRANSACTION]: {
						enabled: executed,
						name: Triggers.EXECUTED_TRANSACTION
					},
					[Triggers.EDIT_MULTISIG_USERS_EXECUTED]: {
						enabled: executed,
						name: Triggers.EDIT_MULTISIG_USERS_EXECUTED
					},
					[Triggers.EXECUTED_PROXY]:{
						enabled: executed,
						name: Triggers.EXECUTED_PROXY
					},
					[Triggers.INIT_MULTISIG_TRANSFER]:{
						enabled: newT,
						name: Triggers.INIT_MULTISIG_TRANSFER
					},
					[Triggers.CREATED_PROXY]:{
						enabled: newT,
						name: Triggers.CREATED_PROXY
					},
					[Triggers.EDIT_MULTISIG_USERS_START]:{
						enabled: newT,
						name: Triggers.EDIT_MULTISIG_USERS_START
					}
				};
				setLoading(true);

				const updateNotificationTriggerRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateNotificationTriggerPreferences`, {
					body: JSON.stringify({
						triggerPreferences: newPreferences
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: updateNotificationTriggerData, error: updateNotificationTriggerError } = await updateNotificationTriggerRes.json() as { data: string, error: string };

				if(updateNotificationTriggerError) {
					queueNotification({
						header: 'Failed!',
						message: updateNotificationTriggerError,
						status: NotificationStatus.ERROR
					});
					setLoading(false);
					return;
				}

				if(updateNotificationTriggerData){
					queueNotification({
						header: 'Success!',
						message: 'Your Notification Preferences has been Updated.',
						status: NotificationStatus.SUCCESS
					});
					setUserDetailsContextState(prev => ({
						...prev,
						notification_preferences: { ...prev.notification_preferences, triggerPreferences: newPreferences }
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
	};

	const verifyEmail = async () => {

		try{
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				return;
			}
			else{
				setVerificationLoading(true);

				const verifyTokenRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/notify`, {
					body: JSON.stringify({
						args:{
							address,
							email
						},
						trigger: 'verifyEmail'
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: verifyEmailUpdate, error: verifyTokenError } = await verifyTokenRes.json() as { data: string, error: string };

				if(verifyTokenError) {
					queueNotification({
						header: 'Failed!',
						message: verifyTokenError,
						status: NotificationStatus.ERROR
					});
					setVerificationLoading(false);
					return;
				}

				if(verifyEmailUpdate){
					queueNotification({
						header: 'Success!',
						message: 'Verification Email Sent.',
						status: NotificationStatus.SUCCESS
					});
					setResendEmail(false);
					setTimeout(() => setResendEmail(true), 60000);
					setUserDetailsContextState(prev => ({
						...prev,
						notification_preferences: { ...prev.notification_preferences, channelPreferences: {
							...prev.notification_preferences.channelPreferences,
							['email']: {
								enabled: false,
								handle: email,
								name: CHANNEL.EMAIL,
								verified: false
							}
						} }
					}));
					setVerificationLoading(false);
				}

			}
		} catch (error){
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in Sending Verification Email.',
				status: NotificationStatus.ERROR
			});
			setVerificationLoading(false);
		}
	};

	const getVerifyToken = async (channel: CHANNEL) => {

		try{
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				return;
			}
			else{

				const verifyTokenRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getChannelVerifyToken`, {
					body: JSON.stringify({
						channel
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: verifyToken, error: verifyTokenError } = await verifyTokenRes.json() as { data: string, error: string };

				if(verifyTokenError) {
					queueNotification({
						header: 'Failed!',
						message: verifyTokenError,
						status: NotificationStatus.ERROR
					});
					return;
				}

				if(verifyToken){
					return verifyToken;
				}

			}
		} catch (error){
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in generating token.',
				status: NotificationStatus.ERROR
			});
		}
	};

	const TelegramModal: FC = () => {
		return (
			<>
				<Button onClick={() => setOpenTelegramModal(true)} icon={<PlusCircleOutlined className='text-primary' />} className='flex items-center outline-none border-none bg-transparant text-primary'>ADD THE POLKASAFE BOT</Button>
				<Modal
					centered
					footer={false}
					closeIcon={
						<button
							className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
							onClick={() => setOpenTelegramModal(false)}
						>
							<OutlineCloseIcon className='text-primary w-2 h-2' />
						</button>}
					title={<h3 className='text-white mb-8 text-lg font-semibold flex items-center gap-x-2'><TelegramIcon className='text-text_secondary'/> How to add Telegram Bot</h3>}
					open={openTelegramModal}
					className={' w-auto md:min-w-[500px] max-w-[600px] scale-90'}
				>
					<TelegramInfoModal getVerifyToken={getVerifyToken} />
				</Modal>
			</>
		);
	};

	const DiscordModal: FC = () => {
		return (
			<>
				<Button onClick={() => setOpenDiscordModal(true)} icon={<PlusCircleOutlined className='text-primary' />} className='flex items-center outline-none border-none bg-transparant text-primary'>ADD THE POLKASAFE BOT</Button>
				<Modal
					centered
					footer={false}
					closeIcon={
						<button
							className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
							onClick={() => setOpenDiscordModal(false)}
						>
							<OutlineCloseIcon className='text-primary w-2 h-2' />
						</button>}
					title={<h3 className='text-white mb-8 text-lg font-semibold flex items-center gap-x-2'><DiscordIcon className='text-text_secondary'/> How to add Discord Bot</h3>}
					open={openDiscordModal}
					className={' w-auto md:min-w-[500px] max-w-[600px] scale-90'}
				>
					<DiscordInfoModal getVerifyToken={getVerifyToken} />
				</Modal>
			</>
		);
	};

	const SlackModal: FC = () => {
		return (
			<>
				<Button onClick={() => setOpenSlackModal(true)} icon={<PlusCircleOutlined className='text-primary' />} className='flex items-center outline-none border-none bg-transparant text-primary'>ADD THE POLKASAFE BOT</Button>
				<Modal
					centered
					footer={false}
					closeIcon={
						<button
							className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
							onClick={() => setOpenSlackModal(false)}
						>
							<OutlineCloseIcon className='text-primary w-2 h-2' />
						</button>}
					title={<h3 className='text-white mb-8 text-lg font-semibold flex items-center gap-x-2'><SlackIcon className='text-text_secondary'/> How to add Slack Bot</h3>}
					open={openSlackModal}
					className={' w-auto md:min-w-[500px] max-w-[600px] scale-90'}
				>
					<SlackInfoModal getVerifyToken={getVerifyToken} />
				</Modal>
			</>
		);
	};

	return (
		<div className={`flex flex-col gap-y-4 ${pathname === '/notification-settings' && 'scale-[80%] h-[125%] w-[125%] origin-top-left'}`}>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4 text-text_secondary'>
				<div className='col-span-3'><span className='flex items-center gap-x-2'><BellIcon /> General</span></div>
				<div className='col-span-7'>
					<p className='mb-4'>Configure the notifications you want Polkasafe to send in your linked channels</p>
					<div className='flex flex-col gap-y-3'>
						<div className='flex'>
							<Checkbox disabled={loading} className='text-white m-0 [&>span>span]:border-primary' checked={newTxn} onChange={(e) => { setNewTxn(e.target.checked); updateNotificationPreferences({ cancelled: cancelledTxn, executed: txnExecuted, newT: e.target.checked });}}>New Transaction needs to be signed</Checkbox>
						</div>
						<div className='flex'>
							<Checkbox disabled={loading} className='text-white m-0 [&>span>span]:border-primary' checked={txnExecuted} onChange={(e) => { setTxnExecuted(e.target.checked); updateNotificationPreferences({ cancelled: cancelledTxn, executed: e.target.checked, newT: newTxn });}}>Transaction has been signed and executed</Checkbox>
						</div>
						<div className='flex'>
							<Checkbox disabled={loading} className='text-white m-0 [&>span>span]:border-primary' checked={cancelledTxn} onChange={(e) => { setTxnExecuted(e.target.checked); updateNotificationPreferences({ cancelled: e.target.checked, executed: txnExecuted, newT: newTxn });}}>Transaction has been cancelled</Checkbox>
						</div>
						{/* <div className='flex items-center gap-x-3'>
							<Checkbox disabled={loading} className='text-white m-0 [&>span>span]:border-primary' checked={pendingTxn} onChange={(e) => { setPendingTxn(e.target.checked); updateNotificationPreferences({ executed: txnExecuted, newT: newTxn, notifyHr: notifyAfter, pending: e.target.checked });}}>For Pending Transactions remind signers every:</Checkbox>
							<Dropdown disabled={!pendingTxn || loading} className='text-white' trigger={['click']} menu={{ items: notifyAfterHours, onClick: onNotifyHoursChange }} >
								<button className={`'flex items-center gap-x-2 border ${!pendingTxn || loading ? 'border-text_secondary': 'border-primary'} rounded-md px-3 py-1 text-sm leading-[15px] text-text_secondary`}>{`${notifyAfter} ${notifyAfter === 1 ? 'hr' : 'hrs'}`} <CircleArrowDownIcon className='hidden md:inline-flex text-base text-primary'/></button>
							</Dropdown>
						</div> */}
					</div>
				</div>
			</div>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4'>
				<div className='col-span-3'><span className='flex items-center gap-x-2 text-text_secondary'><MailIcon /> Email Notifications</span></div>
				<Form className='col-span-5 flex items-start gap-x-3'>
					<Form.Item
						name='email'
						rules={[{ required: true }]}
						help={!emailValid && 'Please enter a valid email'}
						className='border-0 outline-0 my-0 p-0 w-full'
						validateStatus={!emailValid ? 'error' : 'success'}
					>
						<Input
							id='email'
							defaultValue={notification_preferences?.channelPreferences?.['email']?.handle || ''}
							onChange={(a) => setEmail(a.target.value)}
							placeholder={'Enter email'}
							className="w-full text-sm font-normal leading-[15px] border-0 outline-0 p-2 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
						/>
					</Form.Item>
					<PrimaryButton
						loading={verificationLoading}
						className={`text-white ${!email || !emailValid || (notification_preferences?.channelPreferences?.['email']?.handle === email) ? 'bg-highlight' : 'bg-primary'}`}
						onClick={verifyEmail}
						disabled={!email || !emailValid || notification_preferences?.channelPreferences?.['email']?.handle === email}
					>
						<p className='font-normal text-sm'>Verify</p>
					</PrimaryButton>
				</Form>
				{notification_preferences?.channelPreferences?.['email']?.verified && notification_preferences?.channelPreferences?.['email']?.handle === email &&
					<div className='flex items-center col-span-2 ml-5 gap-x-2'>
						<CheckOutlined className='text-success'/>
						<div className='text-white'>Email Verified!</div>
					</div>
				}
				<div className='col-span-3'></div>
				{notification_preferences?.channelPreferences?.['email']?.handle === email && !notification_preferences?.channelPreferences?.['email']?.verified &&
					<section className='mt-2 col-span-5 text-[13px] w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg font-normal flex items-center gap-x-2'>
						<WarningCircleIcon />
						<p>An email has been sent to your email address. Click on the sent link to Verify your email address</p>
					</section>
				}
			</div>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4 text-white'>
				<div className='col-span-3'><span className='flex items-center gap-x-2 text-text_secondary'><TelegramIcon /> Telegram Notifications</span></div>
				<div className='col-span-5 flex items-center'>
					<TelegramModal/>
					<span>to a Telegram chat to get Telegram notifications</span>
				</div>
			</div>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4 text-white'>
				<div className='col-span-3'><span className='flex items-center gap-x-2 text-text_secondary'><DiscordIcon /> Discord Notifications</span></div>
				<div className='col-span-5 flex items-center'>
					<DiscordModal/>
					<span>to a Discord channel to get Discord notifications</span>
				</div>
			</div>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4 text-white'>
				<div className='col-span-3'><span className='flex items-center gap-x-2 text-text_secondary'><SlackIcon /> Slack Notifications</span></div>
				<div className='col-span-5 flex items-center'>
					<SlackModal/>
					<span>to a Slack channel to get Slack notifications</span>
				</div>
			</div>
			<div className='grid grid-cols-10 bg-bg-main rounded-lg p-4 text-white'>
				<div className='col-span-3'><span className='flex items-center gap-x-2 text-text_secondary'><ElementIcon /> Element Notifications</span></div>
				<div className='col-span-5 text-primary'>COMING SOON...</div>
			</div>
		</div>
	);
};

export default Notifications;