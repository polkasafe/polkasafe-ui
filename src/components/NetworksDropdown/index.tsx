// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { FC, useRef, useState } from 'react';
import { CircleArrowDownIcon } from 'src/ui-components/CustomIcons';
import { networks } from 'src/utils/networks';

import NetworkCard from './NetworkCard';

export const ParachainsIcon: FC<{ src: string }> = ({ src }) => {
	return <img className='block w-full h-full' src={src} alt="parachains icon" />;
};

interface INetworksDropdownProps {
	isCardToken?: boolean;
	className?: string;
	iconClassName?: string;
	titleClassName?: string;
}

const NetworksDropdown: FC<INetworksDropdownProps> = (props) => {
	const { className, isCardToken, iconClassName, titleClassName } = props;
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
			<button
				onClick={() => {
					(isVisible ? toggleVisibility(false) : toggleVisibility(true));
				}}
				className={classNames(
					'flex items-center justify-center gap-x-5 outline-none border-none text-white bg-highlight rounded-lg p-3 shadow-none text-sm',
					className
				)}
			>
				<p className={classNames(
					'flex items-center'
				)}>
					<span className={classNames(
						'flex items-center w-4 h-4',
						iconClassName
					)}>
						<ParachainsIcon src={selectedNetwork.icon} />
					</span>
					<span className={classNames(
						'ml-[10px] hidden md:inline-flex',
						titleClassName
					)}>
						{isCardToken? selectedNetwork.token: selectedNetwork.title}
					</span>
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
						return <NetworkCard
							onClick={() => {
								setSelectedNetwork(network);
							}}
							selectedNetwork={selectedNetwork}
							{...network}
							key={network.title}
							isCardToken={isCardToken}
						/>;
					})
				}
			</div>
		</div>
	);
};

export default NetworksDropdown;