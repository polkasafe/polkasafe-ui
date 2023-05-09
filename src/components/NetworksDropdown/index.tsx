// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { FC, useRef, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { chainProperties, networks } from 'src/global/networkConstants';
import { CircleArrowDownIcon } from 'src/ui-components/CustomIcons';

import NetworkCard from './NetworkCard';

export const ParachainIcon: FC<{ src: string, className?:string, size?: number }> = ({ src, className, size = 20 }) => {
	return <img className={`${className} block rounded-full`} height={size} width={size} src={src} alt="Chain logo" />;
};

interface INetworksDropdownProps {
	isCardToken?: boolean;
	className?: string;
	iconClassName?: string;
	titleClassName?: string;
}

const NetworksDropdown: FC<INetworksDropdownProps> = ({ className, isCardToken, iconClassName, titleClassName }) => {
	const { network, setNetwork } = useGlobalApiContext();

	const [isVisible, toggleVisibility] = useState(false);
	const isMouseEnter = useRef(false);

	const handleSetNetwork = (networkToSet: string) => {
		localStorage.setItem('network', networkToSet);
		setNetwork(networkToSet);
		toggleVisibility(false);
	};

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
				onClick={() => isVisible ? toggleVisibility(false) : toggleVisibility(true) }
				className={classNames(
					'flex items-center justify-center gap-x-4 outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-xs',
					className
				)}
			>
				<p className={classNames(
					'flex items-center'
				)}>
					<span className={classNames(
						'flex items-center w-3 h-3',
						iconClassName
					)}>
						<ParachainIcon src={chainProperties[network].logo} />
					</span>
					<span className={classNames(
						'ml-[10px] hidden md:inline-flex capitalize',
						titleClassName
					)}>
						{isCardToken? chainProperties[network].tokenSymbol: network}
					</span>
				</p>
				<CircleArrowDownIcon className='hidden md:inline-flex text-sm text-primary'/>
			</button>
			<div
				className={classNames(
					'absolute top-16 right-0 rounded-xl border border-primary bg-bg-secondary py-[13.5px] px-3 z-50 min-w-[214px]',
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
					Object.values(networks).map((networkEntry) => {
						return <NetworkCard
							onClick={() => handleSetNetwork(networkEntry) }
							selectedNetwork={network}
							key={networkEntry}
							network={networkEntry}
							isCardToken={isCardToken}
						/>;
					})
				}
			</div>
		</div>
	);
};

export default NetworksDropdown;