// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { Button, Form, Input, InputNumber } from 'antd';
import React from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { CheckOutlined, CopyIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import shortenAddress from 'src/utils/shortenAddress';

import Loader from '../../UserFlow/Loader';

interface ISignatory{
	name: string
	address: string
}

interface Props{
	signatories: ISignatory[]
	setSignatoriesWithName: React.Dispatch<React.SetStateAction<ISignatory[]>>
	signatoriesArray: ISignatory[]
	setSignatoriesArray: React.Dispatch<React.SetStateAction<ISignatory[]>>
	threshold: number
	setThreshold: React.Dispatch<React.SetStateAction<number>>
	multisigThreshold?: number
}

const Owners = ({ signatories, multisigThreshold, threshold, setThreshold, setSignatoriesWithName, signatoriesArray, setSignatoriesArray }: Props) => {

	const { network } = useGlobalApiContext();

	const onSignatoryChange = (event: any, i: number) => {
		setSignatoriesArray((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.address = event.target.value;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};
	const onNameChange = (event: any, i: number) => {
		setSignatoriesArray((prevState) => {
			const copyArray = [...prevState];
			const copyObject = { ...copyArray[i] };
			copyObject.name = event.target.value;
			copyArray[i] = copyObject;
			return copyArray;
		});
	};

	const onAddSignatory = () => {
		setSignatoriesArray((prevState) => {
			const copyOptionsArray = [...prevState];
			copyOptionsArray.push({ address: '', name: '' });
			return copyOptionsArray;
		});
	};

	const onRemoveSignatory = (i: number) => {
		const copyOptionsArray = [...signatoriesArray];
		copyOptionsArray.splice(i, 1);
		setSignatoriesArray(copyOptionsArray);
	};

	return (
		<div>
			<div className='flex flex-col items-center w-[800px] h-[400px]'>
				<div className="flex justify-around items-center mb-10 w-full">
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'><CheckOutlined/></div>
						<p>Select Network</p>
					</div>
					<Loader className='bg-primary h-[2px] w-[80px]'/>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'><CheckOutlined/></div>
						<p>Name & Address</p>
					</div>
					<Loader className='bg-primary h-[2px] w-[80px]'/>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>3</div>
						<p>Owners</p>
					</div>
					<Loader className='bg-bg-secondary h-[2px] w-[80px]'/>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>4</div>
						<p>Review</p>
					</div>
				</div>
				<div className='px-4 overflow-auto w-full'>
					<Form
						className='my-0 mt-5'
					>
						{signatories.length && multisigThreshold ?
							<>
								<p className='text-text_secondary mb-3'>This safe on <span className='text-white capitalize'>{network}</span> has {signatories?.length} owners. Optional: Provide a name for each owner.</p>
								{
									signatories?.map((item, i: number) => (

										<div className="flex flex-col gap-y-3 mb-5" key={i}>
											<label
												className="text-primary text-xs leading-[13px] font-normal"
												htmlFor="name1"
											>Owner Name {i+1}</label>
											<div className="flex items-center">

												<Input
													placeholder="John Doe"
													className="lg:w-[20vw] md:w-[25vw] text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
													id="name"
													value={item.name}
													onChange={(e) => {
														const copyArray = [...signatories];
														const copyObject = { ...copyArray[i] };
														copyObject.name = e.target.value;
														copyArray[i] = copyObject;
														setSignatoriesWithName(copyArray);
													}}
													defaultValue={item.name}
												/>
												<div className='flex ml-3'>
													<Identicon value={item.address} size={20} theme='polkadot' />
													<div className='text-white'>{shortenAddress(item.address)}</div>
													<button onClick={() => copyText(item.address, true, network)}><CopyIcon className='mx-1 text-text_secondary hover:text-primary'/></button>
													<a href={`https://${network}.subscan.io/account/${item.address}`} target='_blank' rel="noreferrer" >
														<ExternalLinkIcon className='text-text_secondary hover:text-primary' />
													</a>
												</div>
											</div>
										</div>
									))
								}
							</>
							:
							<>
								<p className='text-text_secondary mb-3'>We cannot find this Multisig or multisig is not on-chain (it should have a existential balance and at least one transaction), Please enter the Signatories and threshold of this Multisig.</p>
								{signatoriesArray.map((signatory, i) => (
									<div className="flex flex-col gap-y-3" key={i}>
										<div className="flex items-center gap-x-4">
											<div className='flex-1 flex items-start gap-x-4'>
												<Form.Item>
													<label
														className="text-primary text-xs leading-[13px] font-normal"
													>Name {i+1}</label>
													<Input
														placeholder={`Name ${i+1}`}
														disabled={i === 0}
														className=" text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
														value={signatory.name}
														onChange={(e) => onNameChange(e, i)}
													/>
												</Form.Item>
												<Form.Item
													className='w-full'
													name={`Address ${i+1}`}
													rules={[{ required: true }]}
													help={signatory.address === '' && 'This Is Required.'}
													validateStatus={!signatory.address ? 'error' : 'success'}
												>
													<label
														className="text-primary text-xs leading-[13px] font-normal"
													>Address {i+1}</label>
													<Input
														id={`Address ${i+1}`}
														placeholder={`Address ${i+1}`}
														disabled={i === 0}
														className=" text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
														value={signatory.address}
														onChange={(e) => onSignatoryChange(e, i)}
													/>
												</Form.Item>
											</div>
											{i > 1 && <Button className='bg-bg-secondary rounded-lg text-white border-none outline-none ' onClick={() => onRemoveSignatory(i)}>-</Button>}
										</div>
									</div>
								))}
								<div className='w-full flex justify-end'>
									<Button
										className='border-none text-white bg-primary'
										onClick={() => onAddSignatory()}>+</Button>
								</div>
								<Form.Item
									className="flex flex-col gap-y-3"
									name='threshold-1'
									rules={[{ required: true }]}
									help={((threshold < 2 || threshold > signatoriesArray.length) && 'Threshold Must Be Atleast 2 And Less Than Signatories.')}
									validateStatus={(threshold < 2 || threshold > signatoriesArray.length) ? 'error' : 'success'}
								>
									<label
										className="text-primary text-xs leading-[13px] font-normal"
									>Threshold</label>
									<InputNumber
										placeholder="0"
										id='threshold-1'
										className=" bg-bg-secondary placeholder:text-[#505050] text-white outline-none border-none w-full mt-2 py-2"
										onChange={(value) => setThreshold(value!)}
										value={threshold}
									/>
								</Form.Item>
							</>}
					</Form>
				</div>
			</div>
		</div>
	);
};

export default Owners;
