// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import CancelBtn from 'src/components/Multisig/CancelBtn';
import AddBtn from 'src/components/Multisig/ModalBtn';
import { useModalContext } from 'src/context/ModalContext';

import NameAddress from '../LinkMultisig/NameAddress';
import SelectNetwork from '../LinkMultisig/SelectNetwork';
import Owners from './Owners';
import Review from './Review';

const LinkMultisig = () => {
	const { toggleVisibility } = useModalContext();
	const [nameAddress, setNameAddress] = useState(true);
	const [viewOwners, setViewOwners] = useState(true);
	const [viewReviews, setViewReviews] = useState(true);
	const viewNameAddress = () => {
		setNameAddress(false);
	};
	const handleViewOwners = () => {
		setNameAddress(false);
		setViewOwners(false);
	};
	const handleViewReviews = () => {
		setNameAddress(false);
		setViewOwners(false);
		setViewReviews(false);
	};
	return (
		<>
			{nameAddress?
				<div>
					<SelectNetwork />
					<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
						<CancelBtn onClick={toggleVisibility} />
						<AddBtn title='Continue' onClick={viewNameAddress}/>
					</div>
				</div>:
				<div>
					{viewOwners?<div>
						<NameAddress />
						<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
							<CancelBtn onClick={toggleVisibility} />
							<AddBtn title='Continue' onClick={handleViewOwners}/>
						</div>
					</div>:<div>
						{viewReviews?<div>
							<Owners/>
							<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
								<CancelBtn onClick={toggleVisibility} />
								<AddBtn title='Continue' onClick={handleViewReviews}/>
							</div>
						</div>: <div>
							<Review/>
							<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
								<CancelBtn onClick={toggleVisibility} />
								<AddBtn title='Link Multisig'/>
							</div>
						</div>}
					</div>}
				</div>
			}
		</>
	);
};

export default LinkMultisig;
