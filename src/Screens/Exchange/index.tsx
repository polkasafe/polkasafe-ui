// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { MinusCircleOutlined,PlusCircleOutlined } from '@ant-design/icons';
import { OnrampWebSDK } from '@onramp.money/onramp-web-sdk';
import { Dropdown, Form, Input } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ParachainIcon } from 'src/components/NetworksDropdown';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { chainProperties } from 'src/global/networkConstants';
import AddressInput from 'src/ui-components/AddressInput';
import { CircleArrowDownIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import PrimaryButton from 'src/ui-components/PrimaryButton';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import styled from 'styled-components';

const Exchange = ({ className }: { className?: string }) => {

	const { network } = useGlobalApiContext();
	const { address: userAddress } = useGlobalUserDetailsContext();

	const [isOnramp, setIsOnramp] = useState<number>(1);
	const [walletAddress, setWalletAddress] = useState<string>(userAddress);
	const [coinCode, setCoinCode] = useState<'polkadot' | 'kusama'>(network === 'kusama' ? 'kusama' : 'polkadot');
	const [coinAmount, setCoinAmount] = useState<number>();

	const currencyOptions: ItemType[] = [
		{
			key: 'polkadot',
			label: <span className='text-white flex items-center gap-x-2'>
				<ParachainIcon src={chainProperties['polkadot'].logo} />
				{ chainProperties['polkadot'].tokenSymbol}
			</span>
		},
		{
			key: 'kusama',
			label: <span className='text-white flex items-center gap-x-2'>
				<ParachainIcon src={chainProperties['kusama'].logo} />
				{ chainProperties['kusama'].tokenSymbol}
			</span>
		}
	];

	const onConfirm = () => {
		if(!walletAddress || !coinAmount || isNaN(coinAmount)) return;
		const onramp = new OnrampWebSDK({
			appId: 437189,
			coinAmount: Number(coinAmount),
			coinCode: coinCode === 'kusama' ? 'ksm' : 'dot',
			flowType: isOnramp,
			paymentMethod: 1,
			walletAddress: getEncodedAddress(walletAddress, network) || walletAddress
		});

		onramp.show();

	};

	return (
		<div className={`scale-[80%] w-[125%] h-[125%] p-5 origin-top-left bg-bg-main rounded-lg flex justify-center ${className}`}>
			{userAddress ?
				<div className='h-full flex flex-col gap-y-5 bg-bg-secondary rounded-lg p-5'>
					<div className='w-full flex items-center gap-x-3'>
						<span
							onClick={() => setIsOnramp(1)}
							className={`p-[10px] bg-opacity-10 text-xl text-white flex items-center justify-center flex-col gap-y-3 ${isOnramp === 1 ? 'bg-success text-success' : 'bg-text_secondary'} cursor-pointer rounded-lg leading-none w-[180px] h-[120px]`}
						>
							<PlusCircleOutlined/>
							Buy
						</span>
						<span
							onClick={() => setIsOnramp(2)}
							className={`p-[10px] bg-opacity-10 text-xl text-white flex items-center justify-center flex-col gap-y-3 ${isOnramp === 2 ? 'bg-success text-success' : 'bg-text_secondary'} cursor-pointer rounded-lg leading-none w-[180px] h-[120px]`}
						>
							<MinusCircleOutlined/>
							Sell
						</span>
					</div>
					<div>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Wallet Address*</label>
						<AddressInput defaultAddress={userAddress} onChange={(address) => setWalletAddress(address)} />
					</div>
					<div className='flex-1'>
						<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Token Amount*</label>
						<Form.Item
							className='border-0 outline-0 my-0 p-0'
							name="coin-amount"
							rules={[{ required: true }]}
							validateStatus={coinAmount && isNaN(coinAmount) ? 'error' : 'success'}
							help={coinAmount && isNaN(coinAmount) && 'Please enter a valid Amount'}
						>
							<div className='flex items-center h-[50px]'>
								<Input
									id="coin-amount"
									onChange={(e) => setCoinAmount(e.target.value as any)}
									placeholder='10'
									value={coinAmount}
									className="w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-main rounded-lg text-white pr-20"
								/>
								<Dropdown
									trigger={['click']}
									className={className}
									menu={{
										items: currencyOptions,
										onClick: (e) => setCoinCode(e.key as any)
									}}
								>
									<div className='absolute cursor-pointer right-0 text-white pr-3 flex items-center justify-center'>
										<ParachainIcon src={chainProperties[coinCode].logo} className='mr-2' />
										<span>{ chainProperties[coinCode].tokenSymbol}</span>
										<CircleArrowDownIcon className='text-primary ml-1' />
									</div>
								</Dropdown>
							</div>
						</Form.Item>
					</div>
					<PrimaryButton disabled={!walletAddress || !coinAmount || isNaN(coinAmount)} className='flex justify-center' onClick={onConfirm}>Confirm</PrimaryButton>
				</div>
				: <div className='h-full w-full flex items-center justify-center text-primary font-bold text-lg'>
					<Link to='/'><span>Please Login</span> <ExternalLinkIcon /></Link>
				</div>
			}
		</div>
	);
};

export default styled(Exchange)`
    .ant-select input {
        font-size: 14px !important;
        font-style: normal !important;
        line-height: 15px !important;
        border: 0 !important;
        outline: 0 !important;
        background-color: #1B2028 !important;
        border-radius: 8px !important;
        color: white !important;
        padding: 12px !important;
        display: block !important;
        height: 100% !important;
    }
    .ant-select-selector {
        border: none !important;
        height: 50px !important; 
        box-shadow: none !important;
    }

    .ant-select {
        height: 50px !important;
    }
    .ant-select-selection-search {
        inset: 0 !important;
    }
    .ant-select-selection-placeholder{
        color: #505050 !important;
        z-index: 100;
        display: flex !important;
        align-items: center !important;
    }

    .ant-skeleton .ant-skeleton-content .ant-skeleton-title +.ant-skeleton-paragraph{
        margin-block-start: 8px !important;
    }

    .ant-dropdown {
        transform: scale(0.9) !important;
        transform-origin: center !important;
    }
`;