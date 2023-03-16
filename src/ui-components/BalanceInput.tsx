// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Input } from 'antd';
import BN from 'bn.js';
import React, { useState } from 'react';
import { ParachainIcon } from 'src/components/NetworksDropdown';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { chainProperties } from 'src/global/networkConstants';
import { inputToBn } from 'src/utils/inputToBn';

interface Props{
	className?: string
	label?: string
	onChange: (balance: BN) => void
	placeholder?: string
}

const BalanceInput = ({ className, label = '', onChange, placeholder = '' }: Props) => {
	const [isValidInput, setIsValidInput] = useState(true);
	const { network } = useGlobalApiContext();

	const onBalanceChange = (value: number | string | null): void => {
		value = Number(value);

		if(!value || value <= 0) {
			setIsValidInput(false);
			onChange(new BN(0));
			return;
		}

		const [balance, isValid] = inputToBn(`${value}`, network, false);
		setIsValidInput(isValid);

		if(isValid){
			onChange(balance);
		}
	};

	return <section className={`${className}`}>
		<label className='text-primary font-normal text-xs leading-[13px] block mb-2'>{ label }</label>
		<div className='flex items-center gap-x-[10px]'>
			<article className='w-full'>
				<Form.Item
					className='border-0 outline-0 my-0 p-0'
					name="balance"
					rules={[{ required: true }]}
					validateStatus={isValidInput ? 'success' : 'error'}
					help={!isValidInput && 'Please input a valid value'}
					initialValue={chainProperties[network].existentialDeposit}
				>
					<div className='flex items-center h-[40px]'>
						<Input
							id="amount"
							onChange={(a) => onBalanceChange(a.target.value)}
							placeholder={`${placeholder} ${chainProperties[network]?.tokenSymbol}`}
							className="w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24"
						/>
						<div className='absolute right-0 text-white px-3 flex items-center justify-center'>
							<ParachainIcon src={chainProperties[network].logo} className='mr-2' />
							<span>{ chainProperties[network].tokenSymbol}</span>
						</div>
					</div>
				</Form.Item>
			</article>
		</div>
	</section>;
};

export default BalanceInput;
