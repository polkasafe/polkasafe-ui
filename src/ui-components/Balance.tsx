// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { useGlobalWeb3Context } from 'src/context';
import formatBnBalance from 'src/utils/formatBnBalance';

interface Props {
	className?: string
	address: string
	onChange?: (balance: string) => void
}

const Balance = ({ address, className }: Props) => {

	const { ethProvider } = useGlobalWeb3Context();

	const [balance, setBalance] = useState<string>('0');

	const fetchEthBalance = async (address: string) => {
		try {
			const balance = ethers.utils.formatEther(
				await ethProvider.getBalance(address)
			);
			setBalance(balance);
		} catch (err) {
			console.log('Err from fetchEthBalance', err);
		}
	};

	useEffect(() => {
		if (address) fetchEthBalance(address);
	}, [address]);

	return (
		<div className={`bg-highlight rounded-lg px-[10px] py-[6px] ml-auto font-normal text-xs leading-[13px] flex items-center justify-center ${className}`}>
			<span className='text-primary mr-2'>Balance: </span>
			<span className='text-white'>{ethers.utils.parseUnits(balance.toString(), 'ether').toString()}</span>
		</div>
	);
};

export default Balance;