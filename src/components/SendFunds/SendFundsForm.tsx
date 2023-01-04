// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { WarningOutlined } from '@ant-design/icons';

import { Divider, Form, Input, Switch } from 'antd';
import React, { FC } from 'react';
import profileImg from 'src/assets/icons/profile-img.png';
import NetworksDropdown from 'src/components/NetworksDropdown';
import CancelBtn from 'src/components/Settings/CancelBtn';
import ModalBtn from 'src/components/Settings/ModalBtn';
import { LineIcon, SquareDownArrowIcon, WarningCircleIcon } from 'src/ui-components/CustomIcons';

interface ISendFundsFormProps {
	onCancel?: () => void;
}

const SendFundsForm: FC<ISendFundsFormProps> = (props) => {
	const { onCancel } = props;
	return (
		<Form>
			<section>
				<p className='text-primary font-normal text-xs leading-[13px]'>Sending from</p>
				<div className='flex items-center gap-x-[10px] mt-[14px]'>
					<article className='w-[500px] p-[10px] border-2 border-dashed border-bg-secondary rounded-lg flex items-center gap-x-4'>
						<div className='flex items-center justify-center w-10 h-10'>
							<img src={profileImg} className='w-full h-full' alt="profile img" />
						</div>
						<div className='flex flex-col gap-y-[6px]'>
							<h4 className='font-medium text-sm leading-[15px] text-white'>Jaski - 1</h4>
							<p className='text-text_secondary font-normal text-xs leading-[13px]'>3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy</p>
						</div>
						<div className='bg-highlight rounded-lg px-[10px] py-[6px] ml-auto font-normal text-xs leading-[13px]'>
							<span className='text-primary'>Balance: </span>
							<span className='text-white'>0.00 DOT</span>
						</div>
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
							<Input
								placeholder="Send to Address.."
								className="text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-[#505050]"
								id="recipient"
							/>
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
				<label className='text-primary font-normal text-xs leading-[13px] block'>Amount</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-[500px] relative'>
						<Form.Item
							name="amount"
							rules={[]}
							className='border-0 outline-0 my-0 p-0'
						>
							<div className='flex items-center h-[40px]'>
								<Input
									placeholder="0"
									className="h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-[#505050] pr-10"
									id="amount"
								/>
								<div className='absolute right-0'>
									<NetworksDropdown className='bg-transparent text-primary gap-x-[12.83px] font-medium' isCardToken={true} iconClassName='h-3 w-3' titleClassName='ml-[4px]' />
								</div>
							</div>
						</Form.Item>
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
			<section className='mt-[15px]'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-3'>Existential Deposit</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-[500px] relative'>
						<Form.Item
							name="existential_deposit"
							rules={[]}
							className='border-0 outline-0 my-0 p-0'
						>
							<div className='flex items-center h-[40px]'>
								<Input
									type='number'
									placeholder="1.0000"
									className="text-sm font-normal leading-[15px] outline-0 p-3 placeholder:text-[#505050] border-2 border-dashed border-[#505050] rounded-lg text-[#505050]"
									id="existential_deposit"
								/>
								<div className='absolute right-0'>
									<NetworksDropdown className='bg-transparent text-primary gap-x-[12.83px] font-medium' isCardToken={true} iconClassName='h-3 w-3' titleClassName='ml-[4px]' />
								</div>
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
						<Switch size='small' className='text-primary' defaultChecked onChange={() => {}} />
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
				<ModalBtn className='w-[300px]' title='Make Transaction' />
			</section>
		</Form>
	);
};

export default SendFundsForm;
