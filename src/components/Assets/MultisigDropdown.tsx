// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { FC, useRef, useState } from 'react';
import { CircleArrowDownIcon, OutlineCheckIcon } from 'src/ui-components/CustomIcons';

interface IMultisigDropdownProps {
	className?: string;
    activeAddress: 'Proxy' | 'Multisig';
    setActiveAddress: React.Dispatch<React.SetStateAction<'Proxy' | 'Multisig'>>;
}

const MultisigDropdown: FC<IMultisigDropdownProps> = ({ className, activeAddress, setActiveAddress }) => {

	const [isVisible, toggleVisibility] = useState(false);
	const isMouseEnter = useRef(false);

	const handleSetActive = (active: 'Proxy' | 'Multisig') => {
		setActiveAddress(active);
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
					'flex items-center justify-center gap-x-4 outline-none border-none text-white rounded-lg p-1 shadow-none text-sm',
					{
						'bg-[#FF79F2] text-highlight': activeAddress === 'Proxy',
						'bg-primary text-white': activeAddress === 'Multisig'
					},
					className
				)}
			>
				<p className={classNames(
					'flex items-center'
				)}>
					<span className={classNames(
						'ml-[10px] hidden md:inline-flex capitalize'
					)}>
						{activeAddress}
					</span>
				</p>
				<CircleArrowDownIcon className='hidden md:inline-flex text-base'/>
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

				<button onClick={() => handleSetActive('Proxy')} className={classNames('border-none outline-none shadow-none flex items-center gap-x-4 justify-between rounded-lg p-3 min-w-[190px]', {
					'bg-highlight': activeAddress === 'Proxy'
				})}>
					<p className='flex items-center gap-x-[6px]'>
						<span className={classNames('font-medium text-sm capitalize bg-[#FF79F2] rounded-md py-1 px-2 text-highlight')}>
								Proxy
						</span>
					</p>
					{activeAddress === 'Proxy' ? <OutlineCheckIcon className='text-primary' />: null}
				</button>
				<button onClick={() => handleSetActive('Multisig')} className={classNames('border-none outline-none shadow-none flex items-center gap-x-4 justify-between rounded-lg p-3 min-w-[190px]', {
					'bg-highlight': activeAddress === 'Multisig'
				})}>
					<p className='flex items-center gap-x-[6px]'>
						<span className={classNames('font-medium text-sm capitalize bg-primary rounded-md py-1 px-2 text-white')}>
								Multisig
						</span>
					</p>
					{activeAddress === 'Multisig' ? <OutlineCheckIcon className='text-primary' />: null}
				</button>

			</div>
		</div>
	);
};

export default MultisigDropdown;