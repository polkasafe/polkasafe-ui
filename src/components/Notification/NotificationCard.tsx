// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { INotification } from 'src/types';
import { ArrowDownLeftIcon } from 'src/ui-components/CustomIcons';

import { ENotificationStatus } from '.';

const NotificationCard: FC<INotification> = ({ message, created_at, link }) => {
	const { notifiedTill } = useGlobalUserDetailsContext();

	const status = notifiedTill && dayjs(notifiedTill).isAfter(created_at) ? ENotificationStatus.READ : ENotificationStatus.UNREAD;
	return (
		<Link to={link || '#'} className={classNames('flex items-center gap-x-4 rounded-lg p-3', {
			'bg-highlight': status === ENotificationStatus.UNREAD
		})}>
			{status === ENotificationStatus.UNREAD && <div>
				<span className='block h-[10px] w-[10px] rounded-full bg-primary'></span>
			</div>}
			<div className='flex flex-col gap-y-1'>
				<p className='text-sm font-medium text-white'>{message} ({status})</p>
				<p className='text-xs font-normal text-text_secondary'>
					<span>{dayjs(created_at).format('D-MM-YY')} </span>
					at
					<span> {dayjs(created_at).format('HH:mm')}</span>
				</p>
			</div>
			<button className='shadow-none flex items-center justify-center outline-none border-none text-blue_secondary ml-auto p-3 bg-success rounded-lg bg-opacity-10 text-success text-sm'>
				<ArrowDownLeftIcon />
			</button>
		</Link>
	);
};

export default NotificationCard;