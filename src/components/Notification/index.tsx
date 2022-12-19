// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { BellOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useState } from 'react';
import noNotification from 'src/assets/icons/no-notification.svg';
import { PencilNotificationIcon } from 'src/ui-components/CustomIcons';

import Card from './Card';

export enum ENotificationState {
	DISABLED,
	EXECUTED,
	NON_EXECUTED
}

export interface INotification {
	date: string;
	state: ENotificationState;
	time: string;
	title: string;
}

const Notification = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [notifications, setNotifications] = useState<INotification[]>([
		{
			date: '20/09/22',
			state: ENotificationState.NON_EXECUTED,
			time: '12:43PM',
			title: 'New Transaction to sign'
		},
		{
			date: '20/09/22',
			state: ENotificationState.DISABLED,
			time: '12:43PM',
			title: 'Transaction Executed'
		},
		{
			date: '20/09/22',
			state: ENotificationState.EXECUTED,
			time: '12:43PM',
			title: 'Transaction Executed'
		}
	]);
	return (
		<div className='relative'>
			<Button onClick={() => {
				setIsOpen(!isOpen);
			}} icon={<BellOutlined />} className='flex items-center justify-center outline-none border-none text-blue_secondary shadow-none text-xl' />
			{isOpen ? <div className='absolute top-16 right-0 bg-white rounded-lg border-[1.5px] border-blue_primary shadow-large p-3 z-10'>
				<p className='flex gap-x-5 items-center'>
					<span className='text-lg font-bold text-blue_primary w-56 md:w-64'>Notifications</span>
					<PencilNotificationIcon className='text-blue_secondary text-xl' />
				</p>
				<div>
					{
						notifications.length > 0 ? <section>
							<p className='flex justify-end mt-2'>
								<button onClick={() => {
									setNotifications([]);
								}} className='text-blue_primary underline text-xs flex items-center justify-center outline-none border-none shadow-none'>Clear All</button>
							</p>
							<div className='flex flex-col gap-y-2 mt-2'>
								{notifications.map((notification, index) => {
									return <Card key={index} {...notification} />;
								})}
							</div>
						</section> : <section className='flex flex-col items-center'>
							<div className='mt-10'>
								<img src={noNotification} alt="No notification icon" />
							</div>
							<p className='text-blue_primary text-lg opacity-90 mt-10'>No new notifications</p>
						</section>
					}
				</div>
			</div> : null}
		</div>
	);
};

export default Notification;