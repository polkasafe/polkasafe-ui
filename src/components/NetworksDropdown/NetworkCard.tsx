// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { FC } from 'react';
import { OutlineCheckIcon } from 'src/ui-components/CustomIcons';
import { INetwork } from 'src/utils/networks';

import { ParachainsIcon } from '.';

interface INetworkCardProps extends INetwork {
	selectedNetwork: INetwork;
	onClick: () => void;
	isCardToken?: boolean;
}

const NetworkCard: FC<INetworkCardProps> = ({ icon, isCardToken, onClick, selectedNetwork, token, title }) => {
	const isSelected = selectedNetwork.title === title;
	return (
		<button onClick={onClick} className={classNames('border-none outline-none shadow-none flex items-center gap-x-4 justify-between rounded-lg p-3 min-w-[190px]', {
			'bg-highlight': isSelected
		})}>
			<p className='flex items-center gap-x-[6px]'>
				<span className='h-4 w-4'>
					<ParachainsIcon src={icon} />
				</span>
				<span className={classNames('font-medium text-sm', {
					'text-primary': isSelected,
					'text-white': !isSelected
				})}>
					{isCardToken? token: title}
				</span>
			</p>
			{isSelected? <OutlineCheckIcon className='text-primary' />: null}
		</button>
	);
};

export default NetworkCard;