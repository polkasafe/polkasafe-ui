// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { WarningOutlined } from '@ant-design/icons';

import { Signer } from '@polkadot/api/types';
import Identicon from '@polkadot/react-identicon';
import { AutoComplete, Divider, Form, Input, Switch } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import BN from 'bn.js';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { ParachainIcon } from 'src/components/NetworksDropdown';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { chainProperties } from 'src/global/networkConstants';
import useGetAllAccounts from 'src/hooks/useGetAllAccounts';
import Balance from 'src/ui-components/Balance';
import BalanceInput from 'src/ui-components/BalanceInput';
import { CopyIcon, LineIcon, PasteIcon, QRIcon, SquareDownArrowIcon, WarningCircleIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';
import copyAddress from 'src/utils/copyAddress';
import getNetwork from 'src/utils/getNetwork';
import initMultisigTransfer from 'src/utils/initMultisigTransfer';
// import shortenAddress from 'src/utils/shortenAddress';
import styled from 'styled-components';

interface ISendFundsFormProps {
	onCancel?: () => void;
	className?: string;
	setNewTxn?: React.Dispatch<React.SetStateAction<boolean>>
}

const addRecipientHeading = () => {
	const elm = document.getElementById('recipient_list');
	if (elm) {
		const parentElm = elm.parentElement;
		if (parentElm) {
			const isElmPresent = document.getElementById('recipient_heading');
			if (!isElmPresent) {
				const recipientHeading = document.createElement('p');
				recipientHeading.textContent = 'Recent Addresses';
				recipientHeading.id = 'recipient_heading';
				recipientHeading.classList.add('recipient_heading');
				parentElm.insertBefore(recipientHeading, parentElm.firstChild!);
			}
		}
	}
};

const network = getNetwork();

const SendFundsForm = (props: ISendFundsFormProps) => {
	const { activeMultisig, multisigAddresses, addressBook, address } = useGlobalUserDetailsContext();
	const { accountsMap, noAccounts, signersMap } = useGetAllAccounts();
	const { className, onCancel, setNewTxn } = props;
	const { api, apiReady } = useGlobalApiContext();
	const [note, setNote] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState(new BN(0));
	const [recipientAddress, setRecipientAddress] = useState(addressBook[0]?.address);
	const [callData, setCallData] = useState<string>('');
	const autocompleteAddresses: DefaultOptionType[] = addressBook.map(a => ({
		label: a.name,
		value: a.address
	}));

	useEffect(() => {
		if(api && apiReady && recipientAddress && amount){
			const call = api.tx.balances.transferKeepAlive(recipientAddress, amount);
			setCallData(call.method.toHex());
		}
	}, [amount, api, apiReady, recipientAddress]);

	const handleSubmit = async () => {
		if(!api || !apiReady || noAccounts || !signersMap || !address){
			return;
		}

		const wallet = accountsMap[address];
		if(!signersMap[wallet]) return;

		const signer: Signer = signersMap[wallet];
		api.setSigner(signer);

		const multisig = multisigAddresses.find((multisig) => multisig.address === activeMultisig);

		if(!multisig || !recipientAddress || !amount){
			queueNotification({
				header: 'Error!',
				message: 'Invalid Input.',
				status: NotificationStatus.ERROR
			});
			return;
		}
		setLoading(true);
		try {
			await initMultisigTransfer({
				amount,
				api,
				initiatorAddress: address,
				multisig,
				network,
				note,
				recipientAddress,
				transferKeepAlive: true
			});
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
			if(setNewTxn){
				setNewTxn(prev => !prev);
			}
		}
	};

	const onClick = () => {
		addRecipientHeading();
	};
	return (
		<Form
			className={classNames(className)}
		>
			<section>
				<p className='text-primary font-normal text-xs leading-[13px]'>Sending from</p>
				<div className='flex items-center gap-x-[10px] mt-[14px]'>
					<article className='w-[500px] p-[10px] border-2 border-dashed border-bg-secondary rounded-lg flex items-center gap-x-4'>
						<Identicon
							value={activeMultisig}
							size={30}
							theme='polkadot'
						/>
						<div className='flex flex-col gap-y-[6px] truncate'>
							<h4 className='font-medium text-sm leading-[15px] text-white'>{multisigAddresses.find((multisig) => multisig.address === activeMultisig)?.name}</h4>
							<p className='text-text_secondary font-normal text-xs leading-[13px]'>{(activeMultisig)}</p>
						</div>
						<Balance address={activeMultisig} />
					</article>
					<article className='w-[412px] flex items-center'>
						<span className='-mr-1.5 z-0'>
							<LineIcon className='text-5xl' />
						</span>
						<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>The transferred balance will be subtracted (along with fees) from the sender account.</p>
					</article>
				</div>
				<div className='w-[500px]'>
					<Divider className='border-[#505050]'>
						<SquareDownArrowIcon />
					</Divider>
				</div>
			</section>

			<section className=''>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Recipient</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-[500px]'>
						<Form.Item
							name="recipient"
							rules={[]}
							className='border-0 outline-0 my-0 p-0'
						>
							<div className="flex items-center">
								<AutoComplete
									onClick={onClick}
									options={autocompleteAddresses}
									id='recipient'
									placeholder="Send to Address.."
									onChange={(value) => setRecipientAddress(value)}
									defaultValue={address}
								/>
								<div className='absolute right-2'>
									<PasteIcon className='mr-2 text-primary' />
									<QRIcon className='text-text_secondary' />
								</div>
							</div>
						</Form.Item>
					</article>
					<article className='w-[412px] flex items-center'>
						<span className='-mr-1.5 z-0'>
							<LineIcon className='text-5xl' />
						</span>
						<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>The beneficiary will have access to the transferred fees when the transaction is included in a block.</p>
					</article>
				</div>
			</section>

			<section className='mt-[15px]'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Amount</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-[500px]'>
						<BalanceInput onChange={(balance) => setAmount(balance)} />
					</article>
					<article className='w-[412px] flex items-center'>
						<span className='-mr-1.5 z-0'>
							<LineIcon className='text-5xl' />
						</span>
						<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px] -mb-5'>
						If the recipient account is new, the balance needs to be more than the existential deposit. Likewise if the sending account balance drops below the same value, the account will be removed from the state.
						</p>
					</article>
				</div>
			</section>

			{callData && !!Number(amount) && recipientAddress &&
			<section className='mt-[15px]'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-3'>Call Data</label>
				<div className='flex items-center gap-x-[10px]'>
					<div
						className="text-sm cursor-pointer w-full font-normal flex items-center justify-between leading-[15px] outline-0 p-3 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-white"
						onClick={() => copyAddress(callData)}
					>
						{callData}
						<button className='text-primary'><CopyIcon /></button>
					</div>
				</div>
			</section>
			}

			<section className='mt-[15px]'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-3'>Existential Deposit</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-[500px]'>
						<Form.Item
							name="existential_deposit"
							rules={[]}
							className='border-0 outline-0 my-0 p-0'
						>
							<div className='flex items-center h-[40px]'>
								<Input
									disabled={true}
									type='number'
									placeholder={String(chainProperties[network].existentialDeposit)}
									className="text-sm font-normal leading-[15px] outline-0 p-3 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-white pr-24"
									id="existential_deposit"
								/>
								<div className='absolute right-0 text-white px-3 flex items-center justify-center'>
									<ParachainIcon src={chainProperties[network].logo} className='mr-2' />
									<span>{ chainProperties[network].tokenSymbol}</span>
								</div>
							</div>
						</Form.Item>
					</article>
				</div>
			</section>

			<section className='mt-[15px]'>
				<label className='text-primary font-normal text-xs block mb-7'>Note</label>
				<div className=''>
					<article className='w-[500px]'>
						<Form.Item
							name="note"
							rules={[]}
							className='border-0 outline-0 my-0 p-0'
						>
							<div className='flex items-center h-[40px]'>
								<Input.TextArea
									placeholder='Note'
									className="w-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-24"
									id="note"
									rows={4}
									value={note}
									onChange={(e) => setNote(e.target.value)}
								/>
							</div>
						</Form.Item>
					</article>
				</div>
			</section>

			<section className='mt-[15px]'>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-[500px] flex items-center gap-x-3'>
						<p className='text-white text-sm font-normal leading-[15px]'>
							Transfer with account keep-alive checks
						</p>
						<Switch disabled size='small' className='text-primary' defaultChecked />
					</article>
					<article className='w-[412px] flex items-center'>
						<span className='-mr-1.5 z-0'>
							<LineIcon className='text-5xl' />
						</span>
						<p className='p-3 bg-bg-secondary rounded-xl font-normal text-sm text-text_secondary leading-[15.23px]'>With the keep-alive option set, the account is protected against removal due to low balances.
						</p>
					</article>
				</div>
			</section>

			<section className='mt-4 max-w-[500px] text-waiting bg-waiting bg-opacity-10 p-3 rounded-lg font-normal text-xs leading-[13px] flex items-center gap-x-[11px]'>
				<span>
					<WarningCircleIcon className='text-base' />
				</span>
				<p className=''>
					The transaction, after application of the transfer fees, will drop the available balance below the existential deposit. As such the transfer will fail. The account needs more free funds to cover the transaction fees.
				</p>
			</section>

			<section className='flex items-center gap-x-5 justify-center mt-10'>
				<CancelBtn className='w-[300px]' onClick={onCancel} />
				<ModalBtn loading={loading} onClick={handleSubmit} className='w-[300px]' title='Make Transaction' />
			</section>
		</Form>
	);
};

export default styled(SendFundsForm)`
	.ant-select input {
		font-size: 14px !important;
		font-style: normal !important;
		line-height: 15px !important;
		border: 0 !important;
		outline: 0 !important;
		background-color: #24272E !important;
		border-radius: 8px !important;
		color: white !important;
		padding: 12px !important;
		display: block !important;
		height: auto !important;
	}
	.ant-select-selector {
		border: none !important;
		height: 40px !important; 
		box-shadow: none !important;
	}

	.ant-select {
		height: 40px !important;
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
`;
