// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dropdown } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import React, { FC } from 'react';
import { useGlobalCurrencyContext } from 'src/context/CurrencyContext';
import { currencies, currencyProperties } from 'src/global/currencyConstants';
import { CircleArrowDownIcon } from 'src/ui-components/CustomIcons';

export const CurrencyFlag: FC<{ src: string, className?:string }> = ({ src, className }) => {
	return <img className={`${className} block rounded-sm`} height={10} width={20} src={src} alt="Currency Flag" />;
};

const ChangeCurrency = ({ className }: { className?: string }) => {

	const { currency, setCurrency } = useGlobalCurrencyContext();

	const currencyOptions: ItemType[] = Object.values(currencies).map((c) => ({
		key: c,
		label: <span className='text-white flex items-center gap-x-2'>
			<CurrencyFlag src={currencyProperties[c].logo} />
			{c} ({currencyProperties[c].symbol})
		</span>
	}));

	const onCurrencyChange = (e: any) => {
		setCurrency(e.key);
		localStorage.setItem('currency', e.key);
	};

	return (
		<div className={className}>
			<h2 className='font-semibold text-lg leading-[22px] text-white mb-4'>
				Fiat Currency
			</h2>
			<Dropdown
				trigger={['click']}
				className={`border border-primary rounded-lg p-2.5 bg-bg-secondary cursor-pointer ${className}`}
				menu={{
					items: currencyOptions,
					onClick: onCurrencyChange
				}}
			>
				<div className="flex justify-between gap-x-4 items-center text-white text-[16px]">
					<span className='flex items-center gap-x-2'>
						<CurrencyFlag src={currencyProperties[currency].logo} />
						{currency} ({currencyProperties[currency].symbol})
					</span>
					<CircleArrowDownIcon className='text-primary' />
				</div>
			</Dropdown>
		</div>
	);
};

export default ChangeCurrency;