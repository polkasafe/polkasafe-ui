// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import noNotification from 'src/assets/icons/no-notification.svg';
import { NotificationIcon } from 'src/ui-components/CustomIcons';

import Card from './Card';

export enum ENotificationStatus {
	READ = 'READ',
	UNREAD = 'UNREAD'
}

export interface INotification {
	date: string;
	status: ENotificationStatus;
	time: string;
	title: string;
}

const Notification = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [notifications, setNotifications] = useState<INotification[]>([
		{
			date: 'Dec 18, 2022',
			status: ENotificationStatus.UNREAD,
			time: '02:30 PM',
			title: 'Notification - 1'
		},
		{
			date: 'Dec 18, 2022',
			status: ENotificationStatus.READ,
			time: '02:30 PM',
			title: 'Notification - 2'
		},
		{
			date: 'Dec 18, 2022',
			status: ENotificationStatus.UNREAD,
			time: '02:30 PM',
			title: 'Notification - 3'
		}
	]);
	return (
		<div className='relative'>
			<button onClick={() => {
				setIsOpen(!isOpen);
			}} className='flex items-center justify-center outline-none border-none text-white bg-highlight rounded-lg p-3 shadow-none text-lg'>
				<NotificationIcon />
			</button>
			{isOpen ? <div className='absolute top-16 right-0 bg-bg-main rounded-xl border border-primary py-[13.5px] px-3 z-10 min-w-[300px] sm:min-w-[344px]'>
				<div className='flex gap-x-5 items-center justify-between mb-5'>
					<h3 className='text-white font-bold text-xl'>Notifications</h3>
					<button onClick={() => {
						setNotifications([]);
					}} className='outline-none border-none shadow-none py-[6px[ px-[10px] text-sm flex items-center justify-center h-[25px] rounded-md text-failure bg-failure bg-opacity-10'>Clear All</button>
				</div>
				<div>
					{
						notifications.length > 0 ? <section>
							<div className='flex flex-col gap-y-[10px] mt-2'>
								{notifications.map((notification, index) => {
									return <Card key={index} {...notification} />;
								})}
							</div>
						</section> : <section className='flex flex-col items-center'>
							<div className='mt-10'>
								<img src={noNotification} alt="No notification icon" />
							</div>
							<p className='text-white text-base font-medium mt-10'>No new notifications</p>
						</section>
					}
				</div>
			</div> : null}
		</div>
	);
};

export default Notification;