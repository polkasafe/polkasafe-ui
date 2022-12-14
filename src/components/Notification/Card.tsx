// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import classNames from 'classnames';
import React, { FC } from 'react';
import { PencilIcon } from 'src/ui-components/CustomIcons';

import { ENotificationState, INotification } from '.';

const Card: FC<INotification> = ({ date, state, time, title }) => {
	return (
		<article className={classNames('flex items-center px-3 py-2.5 gap-x-1 justify-between rounded-lg', {
			'bg-blue_primary1 text-blue_primary': state === ENotificationState.EXECUTED || state === ENotificationState.NON_EXECUTED,
			'bg-gray_primary text-blue_secondary': state === ENotificationState.DISABLED
		})}>
			<NotificationIcon state={state} />
			<div className='flex flex-col'>
				<p className='text-sm md:text-base font-medium'>{title}</p>
				<p className='text-xs flex items-center gap-x-2 italic'>
					<span>{time}</span>
					<span>{date}</span>
				</p>
			</div>
			<Button className='shadow-none flex items-center justify-center outline-none border-none text-blue_secondary text-lg' icon={<CloseOutlined/>}/>
		</article>
	);
};

const NotificationIcon: FC<{
    state: ENotificationState;
    className?: string;
}> = ({ className, state }) => {
	switch(state) {
	case ENotificationState.DISABLED:
		return <CheckOutlined className={`text-blue_secondary text-xl md:text-2xl ${className}`} />;
	case ENotificationState.NON_EXECUTED:
		return <PencilIcon className={`text-blue_primary text-3xl md:text-4xl ${className}`} />;
	case ENotificationState.EXECUTED:
		return <CheckOutlined className={`text-blue_primary text-xl md:text-2xl ${className}`} />;
	default:
		return null;
	}
};

export default Card;