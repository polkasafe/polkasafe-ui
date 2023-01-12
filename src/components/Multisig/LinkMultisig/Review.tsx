// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import profileImg from 'src/assets/icons/profile-img.png';
import { CheckOutlined, CopyIcon, ShareIcon } from 'src/ui-components/CustomIcons';

import Loader from '../../UserFlow/Loader';

const Review = () => {
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
						<div className='rounded-lg bg-primary text-white w-9 h-9 mb-2 flex items-center justify-center'><CheckOutlined/></div>
						<p>Owners</p>
					</div>
					<Loader className='bg-primary h-[2px] w-[80px]'/>
					<div className='flex flex-col items-center justify-center'>
						<div className='rounded-lg bg-primary text-white w-9 h-9 mb-2 flex items-center justify-center'>4</div>
						<p>Review</p>
					</div>
				</div>
				<div className='flex w-[80%] h-[30vh] mt-5'>
					<div className='flex flex-col justify-between w-[60%] mr-2 h-full rounded-lg bg-bg-secondary text-sm overflow-auto'>
						<h1 className='mt-5 mx-5'>Details</h1>
						<div>
							<div className="flex items-center justify-between m-5">
								<p className='text-text_secondary'>Network:</p>
								<p className='text-primary'>Polkadot</p>
							</div>
							<div className="flex items-center justify-between mx-5 mb-5">
								<p className='text-text_secondary'>Safe Name:</p>
								<p>test-safe</p>
							</div>
							<div className="flex items-center justify-between mx-5 mb-5">
								<p className='text-text_secondary'>Safe Address:</p>
								<div className='flex'><img className='w-5 h-5' src={profileImg} alt="img"/><p className='mx-2'>3J98t...WNLy</p><CopyIcon className='mr-2 text-text_secondary hover:text-primary cursor-pointer'/><ShareIcon/></div>
							</div>
							<div className="flex items-center justify-between mx-5 mb-5">
								<p className='text-text_secondary'>Confirmations:</p>
								<p><span className='text-primary'>2</span> out 2 owners</p>
							</div>
						</div>
					</div>
					<div className='w-[50%] ml-2 h-full rounded-lg bg-bg-secondary'>
						<div className='flex flex-col h-full rounded-lg bg-bg-secondary text-sm'>
							<h1 className='mt-5 mx-5'>Owners</h1>
							<div className='flex flex-1 flex-col items-center justify-start overflow-auto'>
								<div className='flex items-center mx-5 mt-5'>
									<img className='h-8 w-8 mr-5' src={profileImg} alt="img" />
									<div className='flex flex-col'>
										<p className='text-sm'>Akshit</p>
										<div className='flex'><p className='text-sm text-text_secondary'>3J98t1Wp...rnqRhWNLy</p><button className='mx-1'><CopyIcon className='text-text_secondary cursor-pointer hover:text-primary'/></button><ShareIcon /></div>
									</div>
								</div>
								<div className='flex items-center mx-5 mt-5'>
									<img className='h-8 w-8 mr-5' src={profileImg} alt="img" />
									<div className='flex flex-col'>
										<p className='text-sm'>Akshit</p>
										<div className='flex'><p className='text-sm text-text_secondary'>3J98t1Wp...rnqRhWNLy</p><button className='mx-1'><CopyIcon className='text-text_secondary cursor-pointer hover:text-primary'/></button><ShareIcon /></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Review;
