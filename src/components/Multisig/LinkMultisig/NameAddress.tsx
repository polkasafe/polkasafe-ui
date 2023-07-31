// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EthersAdapter } from '@safe-global/protocol-kit';
import { Form, Input } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import NetworkCard from 'src/components/NetworksDropdown/NetworkCard';
import { useGlobalWeb3Context } from 'src/context';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { returnTxUrl } from 'src/global/gnosisService';
import { GnosisSafeService } from 'src/services';
import { CheckOutlined, CircleArrowDownIcon } from 'src/ui-components/CustomIcons';

import Loader from '../../UserFlow/Loader';

interface Props {
	multisigAddress: string,
	setMultisigAddress: React.Dispatch<React.SetStateAction<string>>
	multisigName: string
	setMultisigName: React.Dispatch<React.SetStateAction<string>>
}

const NameAddress = ({ multisigAddress, setMultisigAddress, multisigName, setMultisigName }: Props) => {
	const { address } = useGlobalUserDetailsContext();
	const { ethProvider } = useGlobalWeb3Context();
	const { network } = useGlobalApiContext();
	const { multisigAddresses } = useGlobalUserDetailsContext();
	const [isVisible, toggleVisibility] = useState(false);
	const isMouseEnter = useRef(false);

	const [allSafes, setAllSafes] = useState<string[]>([]);

	console.log('multisigAddress', multisigAddress);

	useEffect(() => {
		const getAllSafes = async () => {
			const signer = ethProvider.getSigner();
			const adapter = new EthersAdapter({
				ethers: ethProvider,
				signerOrProvider: signer
			});
			const txUrl = returnTxUrl(network);
			const gnosisService = new GnosisSafeService(adapter, signer, txUrl);

			const safes = await gnosisService.getAllSafesByOwner(address);
			const multiSigs = multisigAddresses.map(item => item.address);
			const filteredSafes = safes?.safes.filter(item => !multiSigs.includes(item)) || [];
			setMultisigAddress(filteredSafes[0]);
			setAllSafes(filteredSafes!);
		};
		getAllSafes();
	}, []);

	return (
		<div>
			<div className='flex flex-col items-center w-[800px] h-[400px]'>
				<div className="flex justify-around items-center mb-10 w-full">
					<div className='flex flex-col items-center text-white justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'><CheckOutlined /></div>
						<p>Select Network</p>
					</div>
					<Loader className='bg-primary h-[2px] w-[80px]' />
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>2</div>
						<p>Name & Address</p>
					</div>
					<Loader className='bg-bg-secondary h-[2px] w-[80px]' />
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>3</div>
						<p>Owners</p>
					</div>
					<Loader className='bg-bg-secondary h-[2px] w-[80px]' />
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>4</div>
						<p>Review</p>
					</div>
				</div>
				<div>
					<Form
						className='my-0 w-[560px] mt-10'
					>
						<div className="flex flex-col gap-y-3">
							<label
								className="text-primary text-xs leading-[13px] font-normal"
								htmlFor="name"
							>
								Safe Name
							</label>
							<Form.Item
								name="name"
								rules={[]}
								className='border-0 outline-0 my-0 p-0'
							>
								<Input
									placeholder="my-polka-safe"
									className="text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 text-white placeholder:text-[#505050] bg-bg-secondary rounded-lg"
									id="name"
									value={multisigName}
									onChange={(e) => setMultisigName(e.target.value)}
								/>
							</Form.Item>
						</div>
						<div className="flex flex-col gap-y-3 mt-5">
							<label
								className="text-primary text-xs leading-[13px] font-normal"
								htmlFor="address"
							>
								Safe Address*
							</label>
							<Form.Item
								name="Address"
								//rules={[{ required: true }]}
								className='border-0 outline-0 my-0 p-0'
							//validateStatus={!multisigAddress ? 'error' : 'success'}
							>
								<div
									className='relative'
									onBlur={() => {
										if (!isMouseEnter.current) {
											(isVisible ? toggleVisibility(false) : null);
										}
									}}
								>
									<button
										onClick={() => isVisible ? toggleVisibility(false) : toggleVisibility(true)}
										className={classNames(
											'flex items-center justify-center gap-x-4 outline-none border-none text-white bg-highlight rounded-lg p-2.5 shadow-none text-xs'
										)}
									>
										{multisigAddress}
										<CircleArrowDownIcon className='hidden md:inline-flex text-sm text-primary' />
									</button>
									<div
										className={classNames(
											'absolute scale-90 top-[45px] left-[-50px] rounded-xl border border-primary bg-bg-secondary py-[13.5px] px-3 z-50 min-w-[214px]',
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
											allSafes.map((address) => {
												return <NetworkCard
													onClick={() => setMultisigAddress(address)}
													selectedNetwork={multisigAddress}
													key={address}
													network={address}
												/>;
											})
										}
									</div>
								</div>
							</Form.Item>
						</div>
					</Form>
				</div>
			</div>
		</div>
	);
};

export default NameAddress;
