// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import { EModalType, IModalProps } from 'src/components/AppLayout/NavHeader';
import { CircleArrowDownIcon, KusamaIcon, PolkadotIcon } from 'src/ui-components/CustomIcons';

import NetworkCard from './NetworkCard';

export interface INetwork {
	icon: JSX.Element;
	title: string;
	to: string;
}

const networks: INetwork[] = [
	{
		icon: <PolkadotIcon />,
		title: 'Polkadot',
		to: '/'
	},
	{
		icon: <KusamaIcon />,
		title: 'Kusama',
		to: '/'
	}
];

const NetworksDropdown: FC<IModalProps> = ({ modalType, setModalType }) => {
	const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
	return (
		<div className='relative'>
			<button onClick={() => {
				if (modalType === EModalType.NETWORKS) {
					setModalType(EModalType.NONE);
				} else {
					setModalType(EModalType.NETWORKS);
				}
			}} className='flex items-center justify-center gap-x-5 outline-none border-none text-white bg-highlight rounded-lg p-3 shadow-none text-sm'>
				<p className='flex items-center gap-x-[10px]'>
					<span className='flex items-center text-base'>{selectedNetwork.icon}</span>
					<span className='hidden md:inline-flex'>{selectedNetwork.title}</span>
				</p>
				<CircleArrowDownIcon className='hidden md:inline-flex text-base text-primary'/>
			</button>
			{modalType === EModalType.NETWORKS && networks.length > 0 ? <div className='absolute top-16 right-0 rounded-xl border border-primary bg-bg-secondary py-[13.5px] px-3 z-10 min-w-[214px]'>
				{
					networks.map((network) => {
						return <NetworkCard onClick={() => {
							setSelectedNetwork(network);
						}} selectedNetwork={selectedNetwork} {...network} key={network.title} />;
					})
				}
			</div>: null}
		</div>
	);
};

export default NetworksDropdown;