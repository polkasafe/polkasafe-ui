// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Input } from 'antd';
import React from 'react';
import profileImg from 'src/assets/icons/profile-img.png';
import { CheckOutlined, CopyIcon, ShareIcon } from 'src/ui-components/CustomIcons';
import shortenAddress from 'src/utils/shortenAddress';

import Loader from '../../UserFlow/Loader';

interface ISignatory{
	name: string
	address: string
}

interface Props{
	signatories: ISignatory[]
}

const Owners = ({ signatories }: Props) => {

	return (
		<div>
			<div className='flex flex-col items-center w-[800px] h-[400px]'>
				<div className="flex justify-around items-center mb-10 w-full">
					<div className='flex flex-col items-center justify-center'>
						<div className='rounded-lg bg-primary text-white w-9 h-9 mb-2 flex items-center justify-center'><CheckOutlined/></div>
						<p>Select Network</p>
					</div>
					<Loader className='bg-primary h-[2px] w-[80px]'/>
					<div className='flex flex-col items-center justify-center'>
						<div className='rounded-lg bg-primary text-white w-9 h-9 mb-2 flex items-center justify-center'><CheckOutlined/></div>
						<p>Name & Address</p>
					</div>
					<Loader className='bg-primary h-[2px] w-[80px]'/>
					<div className='flex flex-col items-center justify-center'>
						<div className='rounded-lg bg-primary text-white w-9 h-9 mb-2 flex items-center justify-center'>3</div>
						<p>Owners</p>
					</div>
					<Loader className='bg-bg-secondary h-[2px] w-[80px]'/>
					<div className='flex flex-col items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>4</div>
						<p>Review</p>
					</div>
				</div>
				<div>
					<p className='text-text_secondary mt-5'>This safe on <span className='text-white'>Polkadot</span> has {signatories?.length} owners. Optional: Provide a name for each owner.</p>
					<Form
						className='my-0 mt-5'
					>
						{signatories?.map((item, i: number) => (

							<div className="flex flex-col gap-y-3 mb-5" key={i}>
								<label
									className="text-primary text-xs leading-[13px] font-normal"
									htmlFor="name1"
								>Owner Name {i+1}</label>
								<div className="flex items-center">
									<Form.Item
										name="name1"
										rules={[]}
										className='border-0 outline-0 my-0 p-0'
									>
										<Input
											placeholder="John Doe"
											className="lg:w-[20vw] md:w-[25vw] text-sm font-normal m-0 leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white"
											id="name"
											value={item.name}
											defaultValue={item.name}
										/>
									</Form.Item>
									<div className='flex ml-3'><img className='mx-2 w-5 h-5' src={profileImg} alt="img" /><div className='text-white'>{shortenAddress(item.address)}</div>
										<button onClick={() => navigator.clipboard.writeText(item.address)}><CopyIcon className='mx-1 text-text_secondary hover:text-primary cursor-pointer'/></button>
										<ShareIcon className='text-text_secondary'/></div>
								</div>
							</div>
						))}
					</Form>
				</div>
			</div>
		</div>
	);
};

export default Owners;
