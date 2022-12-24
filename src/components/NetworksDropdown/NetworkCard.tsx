// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { FC } from 'react';
import { OutlineCheckIcon } from 'src/ui-components/CustomIcons';

import { INetwork, ParachainsIcon } from '.';

interface INetworkCardProps extends INetwork {
	selectedNetwork: INetwork;
	onClick: () => void;
}

const NetworkCard: FC<INetworkCardProps> = ({ icon, onClick, selectedNetwork, title }) => {
	const isSelected = selectedNetwork.title === title;
	return (
		<button onClick={onClick} className={classNames('border-none outline-none shadow-none flex items-center gap-x-4 justify-between rounded-lg p-3 min-w-[190px]', {
			'bg-highlight': isSelected
		})}>
			<p className='flex items-center gap-x-[6px]'>
				<span className='text-base'>
					<ParachainsIcon src={icon} />
				</span>
				<span className={classNames('font-medium text-sm', {
					'text-primary': isSelected,
					'text-white': !isSelected
				})}>
					{title}
				</span>
			</p>
			{isSelected? <OutlineCheckIcon />: null}
		</button>
	);
};

export default NetworkCard;