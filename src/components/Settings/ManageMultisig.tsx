// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ArrowRightOutlined } from '@ant-design/icons';
import { EthersAdapter, Web3Adapter } from '@safe-global/protocol-kit';
import { Form, Input, Modal } from 'antd';
import React, { FC, useState } from 'react';
import Details from 'src/components/Settings/Details';
import Feedback from 'src/components/Settings/Feedback';
import ListOwners from 'src/components/Settings/Owners/List';
import { useGlobalWeb3Context } from 'src/context';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { GnosisSafeService } from 'src/services';
import { CopyIcon, ExternalLinkIcon, OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import shortenAddress from 'src/utils/shortenAddress';

import CancelBtn from './CancelBtn';
import ModalBtn from './ModalBtn';

const ManageMultisig = () => {

	const { multisigAddresses, activeMultisig, address: userAddress } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const { web3Provider, ethProvider, web3AuthUser } = useGlobalWeb3Context();

	const [openAddSignatories, setOpenAddSignatories] = useState(false);
	const [signatory, setSignatory] = useState('');

	const multisig = multisigAddresses.find((item: any) => item.address === activeMultisig || item.proxy === activeMultisig);

	const handleAddSignatories = async () => {
		const address = localStorage.getItem('address');
		const signature = localStorage.getItem('signature');
		const signer = ethProvider.getSigner();
		const adapter = new Web3Adapter({
			signerAddress: web3AuthUser!.accounts[0],
			web3: web3Provider as any
		});
		const txUrl = 'https://safe-transaction-goerli.safe.global';
		const gnosisService = new GnosisSafeService(adapter, signer, txUrl);
		const res = await gnosisService.addOwner(signatory, activeMultisig);
		console.log('res addOwner', res);
		await fetch(`${FIREBASE_FUNCTIONS_URL}/addSignatoriesEth`, {
			body: JSON.stringify({
				newSignatory: signatory
			}),
			headers: {
				...firebaseFunctionsHeader('goerli', address!, signature!),
				'x-multisig': activeMultisig
			},
			'method': 'POST'
		});
	};

	const AddSignatoriesModal: FC = () => {
		return (
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenAddSignatories(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Add Signatories</h3>}
				open={openAddSignatories}
				className={'w-auto md:min-w-[500px] scale-90'}
			>
				<Form
					className='my-0 w-[560px]'
				>
					<div className="flex flex-col gap-y-3">
						<label
							className="text-primary text-xs leading-[13px] font-normal"
							htmlFor="name"
						>
							Name
						</label>
						<Form.Item
							name="name"
							rules={[]}
							className='border-0 outline-0 my-0 p-0'
						>
							<Input
								placeholder="Write an address here."
								required
								className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
								id="name"
								onChange={(e) => setSignatory(e.target.value)}
							/>
						</Form.Item>
					</div>
					<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
						<CancelBtn onClick={() => setOpenAddSignatories(false)} />
						<ModalBtn onClick={handleAddSignatories} title='Add' />
					</div>
				</Form>
			</Modal>
		);
	};

	return (
		<div>
			{!multisigAddresses || !multisig ?
				<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
					<p className='text-white'>Looks Like You Don&apos;t have a Multisig. Please Create One to use our Features.</p>
				</section> : <>
					<div className='flex justify-between align-middle mb-5'  >
						<h2 className='font-bold text-xl leading-10 text-white'>Manage Safe Owners</h2>
						<ModalBtn
							title='Add' onClick={() => setOpenAddSignatories(true)} />
					</div>
					<AddSignatoriesModal
					/>
					<div className='bg-bg-main p-5 rounded-xl relative overflow-hidden'>
						{multisig?.proxy ?
							<section className='flex items-center justify-between flex-col gap-5 md:flex-row mb-6'>
								<div className='bg-bg-secondary rounded-lg p-3 w-auto flex items-center gap-x-4'>
									<div className='flex flex-col items-start'>
										<div className={'px-2 mb-1 py-[2px] rounded-md text-xs font-medium bg-primary text-white'}>Multisig</div>
										<div className='flex items-center text-text_secondary'>
											{shortenAddress(multisig?.address || '', 10)}
											<button className='ml-2 mr-1' onClick={() => copyText(multisig?.address)}><CopyIcon /></button>
											<a href={`https://${network}.subscan.io/account/${getEncodedAddress(multisig?.address || '', network)}`} target='_blank' rel="noreferrer" >
												<ExternalLinkIcon />
											</a>
										</div>
									</div>
									<div className='h-[50px] w-[50px] rounded-full flex items-center justify-center bg-text_secondary text-bg-main text-xl'><ArrowRightOutlined /></div>
									<div className='flex flex-col items-start'>
										<div className={'px-2 mb-1 py-[2px] rounded-md text-xs font-medium bg-[#FF79F2] text-highlight'}>Proxy</div>
										<div className='flex items-center text-text_secondary'>
											{shortenAddress(multisig?.proxy || '', 10)}
											<button className='ml-2 mr-1' onClick={() => copyText(multisig?.proxy)}><CopyIcon /></button>
											<a href={`https://${network}.subscan.io/account/${getEncodedAddress(multisig?.proxy || '', network)}`} target='_blank' rel="noreferrer" >
												<ExternalLinkIcon />
											</a>
										</div>
									</div>
								</div>
								{/* <AddNewOwnerBtn disabled={!multisig?.proxy} /> */}
							</section> :
							network !== 'astar' &&
							<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
								<p className='text-white'>Create a proxy to edit or backup your Multisig.</p>
							</section>
						}
						<section>
							<ListOwners disabled={!multisig?.proxy} />
						</section>
					</div>
				</>}
			{userAddress &&
				<div className='mt-[30px] flex gap-x-[30px]'>
					{multisigAddresses && activeMultisig && multisig &&
						<section className='w-full'>
							<Details />
						</section>}
					<section className='w-full max-w-[50%]'>
						<Feedback />
					</section>
				</div>}
		</div>
	);
};

export default ManageMultisig;