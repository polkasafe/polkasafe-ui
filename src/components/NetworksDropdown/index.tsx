// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { FC, useRef, useState } from 'react';
import kusamaIcon from 'src/assets/parachains-icons/kusama.svg';
import polkadotIcon from 'src/assets/parachains-icons/polkadot.svg';
import { CircleArrowDownIcon } from 'src/ui-components/CustomIcons';

import NetworkCard from './NetworkCard';

export interface INetwork {
	icon: string;
	title: string;
	to: string;
}

const networks: INetwork[] = [
	{
		icon: polkadotIcon,
		title: 'Polkadot',
		to: '/'
	},
	{
		icon: kusamaIcon,
		title: 'Kusama',
		to: '/'
	}
];

export const ParachainsIcon: FC<{ src: string }> = ({ src }) => {
	return <img className='w-4 h-4' src={src} alt="parachains icon" />;
};

const NetworksDropdown = () => {
	const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
	const [isVisible, toggleVisibility] = useState(false);
	const isMouseEnter = useRef(false);
	return (
		<div
			className='relative'
			onBlur={() => {
				if (!isMouseEnter.current) {
					(isVisible ? toggleVisibility(false) : null);
				}
			}}
		>
			<button onClick={() => {
				(isVisible ? toggleVisibility(false) : toggleVisibility(true));
			}} className='flex items-center justify-center gap-x-5 outline-none border-none text-white bg-highlight rounded-lg p-3 shadow-none text-sm'>
				<p className='flex items-center gap-x-[10px]'>
					<span className='flex items-center text-base'>
						<ParachainsIcon src={selectedNetwork.icon} />
					</span>
					<span className='hidden md:inline-flex'>{selectedNetwork.title}</span>
				</p>
				<CircleArrowDownIcon className='hidden md:inline-flex text-base text-primary'/>
			</button>
			<div
				className={classNames(
					'absolute top-16 right-0 rounded-xl border border-primary bg-bg-secondary py-[13.5px] px-3 z-10 min-w-[214px]',
					{
						'opacity-0 h-0 pointer-events-none hidden': !isVisible,
						'opacity-100 h-auto': isVisible
					}
				)}
				onMouseEnter={() => {
					isMouseEnter.current = true;
				}}
				onMouseLeave={() => {
					isMouseEnter.current = false;
				}}
			>
				{
					networks.map((network) => {
						return <NetworkCard onClick={() => {
							setSelectedNetwork(network);
						}} selectedNetwork={selectedNetwork} {...network} key={network.title} />;
					})
				}
			</div>
		</div>
	);
};

export default NetworksDropdown;