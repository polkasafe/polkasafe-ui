// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dropdown, Form, Input, Tooltip } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import { ParachainIcon } from 'src/components/NetworksDropdown';
import { CurrencyFlag } from 'src/components/Settings/ChangeCurrency';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalCurrencyContext } from 'src/context/CurrencyContext';
import { currencies, currencyProperties } from 'src/global/currencyConstants';
import { chainProperties } from 'src/global/networkConstants';
import formatBnBalance from 'src/utils/formatBnBalance';
import { inputToBn } from 'src/utils/inputToBn';

import { CircleArrowDownIcon, WarningCircleIcon } from './CustomIcons';

interface Props{
	className?: string
	label?: string
	fromBalance?: string | BN
	onChange: (balance: BN) => void
	placeholder?: string
	defaultValue?: string
}

const BalanceInput = ({ fromBalance, className, label = '', onChange, placeholder = '', defaultValue }: Props) => {
	const [isValidInput, setIsValidInput] = useState(true);
	const { network } = useGlobalApiContext();
	const [balance, setBalance] = useState<string>('');
	const [bnBalance, setBnBalance] = useState(new BN(0));
	const { allCurrencyPrices, tokenUsdPrice } = useGlobalCurrencyContext();

	const [currency, setCurrency] = useState<string>(network);

	const tokenCurrencyPrice = currency !== network ? Number(tokenUsdPrice) * allCurrencyPrices[currencyProperties[currency]?.symbol]?.value : 1;

	useEffect(() => {
		const value = Number(defaultValue);
		if(isNaN(value)) return;
		if(!value || value <= 0) {
			setIsValidInput(false);
			onChange(new BN(0));
			return;
		}

		const [balance, isValid] = inputToBn(`${network === 'astar' ? value.toFixed(13) : network === 'alephzero' ? value.toFixed(11) : value}`, network, false);
		setIsValidInput(isValid);

		if(isValid){
			setBnBalance(balance);
			onChange(balance);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultValue, network]);

	const onBalanceChange = (value: number | string | null): void => {
		value = Number(value);

		if(!value || value <= 0) {
			setIsValidInput(false);
			onChange(new BN(0));
			return;
		}

		let balanceInput = value;

		if(currency !== network && !['westend', 'rococo'].includes(network)) {
			balanceInput = value/tokenCurrencyPrice;
		}

		const [balance, isValid] = inputToBn(`${balanceInput.toFixed(5)}`, network, false);
		setIsValidInput(isValid);

		if(isValid){
			setBnBalance(balance);
			onChange(balance);
		}
	};

	const currencyOptions: ItemType[] = [{
		key: network,
		label: <span className='text-white flex items-center gap-x-2'>
			<ParachainIcon src={chainProperties[network].logo} />
			{ chainProperties[network].tokenSymbol}
		</span>
	}];

	Object.values(currencies).forEach((c) => {
		currencyOptions.push({
			key: c,
			label: <span className='text-white flex items-center gap-x-2'>
				<CurrencyFlag src={currencyProperties[c].logo} />
				{c} ({currencyProperties[c].symbol})
			</span>

		});
	});

	const onCurrencyChange = (e: any) => {
		setCurrency(e.key);
		onBalanceChange('');
		setBalance('');
	};

	return <section className={`${className}`}>
		<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>{ label }</label>
		<div className='flex items-center gap-x-[10px]'>
			<article className='w-full'>
				<Form.Item
					className='border-0 outline-0 my-0 p-0'
					name="balance"
					rules={[{ required: true }]}
					validateStatus={!isValidInput || (fromBalance && bnBalance?.gte(new BN(fromBalance))) ? 'error' : 'success'}
					help={!isValidInput ? 'Please input a valid value' : (fromBalance && !bnBalance?.isZero() && bnBalance?.gte(new BN(fromBalance)) && 'Insufficient Balance in Sender Account.')}
					initialValue={chainProperties[network].existentialDeposit}
				>
					<div className='flex items-center h-[50px]'>
						<Input
							id="balance"
							onChange={(a) => {onBalanceChange(a.target.value); setBalance(a.target.value);}}
							placeholder={`${placeholder} ${chainProperties[network]?.tokenSymbol}`}
							defaultValue={defaultValue}
							value={balance}
							className="w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20"
						/>
						{!['westend', 'rococo'].includes(network) ?
							<Dropdown
								trigger={['click']}
								className={className}
								menu={{
									items: currencyOptions,
									onClick: onCurrencyChange
								}}
							>
								{currency === network ?
									<div className='absolute cursor-pointer right-0 text-white pr-3 flex items-center justify-center'>
										<ParachainIcon src={chainProperties[network].logo} className='mr-2' />
										<span>{ chainProperties[network].tokenSymbol}</span>
										<CircleArrowDownIcon className='text-primary ml-1' />
									</div>
									:
									<div className='absolute cursor-pointer right-0 text-white pr-3 flex items-center justify-center'>
										<CurrencyFlag className='mr-2' src={currencyProperties[currency].logo} />
										<span>{ currencyProperties[currency].symbol}</span>
										<CircleArrowDownIcon className='text-primary ml-1' />
									</div>
								}
							</Dropdown>
							:
							<div className='absolute right-0 text-white pr-3 flex items-center justify-center'>
								<ParachainIcon src={chainProperties[network].logo} className='mr-2' />
								<span>{ chainProperties[network].tokenSymbol}</span>
							</div>
						}
					</div>
					{currency !== network && isValidInput &&
						<span className='text-xs text-waiting flex items-center gap-x-1 mt-1'>
							You send = {formatBnBalance(bnBalance, { numberAfterComma: 3, withUnit: true }, network)}
							<Tooltip title={`1 ${chainProperties[network].tokenSymbol} = ${tokenCurrencyPrice?.toFixed(2)} ${currencyProperties[currency].symbol}`}>
								<WarningCircleIcon className='text-sm' />
							</Tooltip>
						</span>
					}
				</Form.Item>
			</article>
		</div>
	</section>;
};

export default BalanceInput;
