// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { FC } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import { OutlineCheckIcon } from 'src/ui-components/CustomIcons';

import { ParachainIcon } from '.';

interface INetworkCardProps {
	selectedNetwork: string;
	onClick: () => void;
	isCardToken?: boolean;
	network: string;
}

const NetworkCard: FC<INetworkCardProps> = ({ isCardToken, onClick, selectedNetwork, network }) => {
	const isSelected = selectedNetwork === network;

	return (
		<button onClick={onClick} className={classNames('border-none outline-none shadow-none flex items-center gap-x-4 justify-between rounded-lg p-2 min-w-[190px]', {
			'bg-highlight': isSelected
		})}>
			<p className='flex items-center gap-x-[6px]'>
				<span className='h-4 w-4'>
					<ParachainIcon src={chainProperties[network].logo} />
				</span>
				<span className={classNames('font-medium text-sm capitalize', {
					'text-primary': isSelected,
					'text-white': !isSelected
				})}>
					{isCardToken? chainProperties[network].tokenSymbol: network}
				</span>
			</p>
			{isSelected? <OutlineCheckIcon className='text-primary' />: null}
		</button>
	);
};

export default NetworkCard;