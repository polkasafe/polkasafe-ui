// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal } from 'antd';
import React, { FC,useState } from 'react';
import { AddIcon, OutlineCloseIcon } from 'src/ui-components/CustomIcons';

import AddOwner from './Add';

const AddNewOwnerBtn = () => {

	const [openAddOwnerModal, setOpenAddOwnerModal] = useState(false);

	const AddOwnerModal: FC = () => {
		return (
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenAddOwnerModal(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Create Multisig</h3>}
				open={openAddOwnerModal}
				className={' w-auto md:min-w-[500px]'}
			>
				<AddOwner />
			</Modal>
		);
	};

	return (
		<>
			<AddOwnerModal />
			<button onClick={() => setOpenAddOwnerModal(true) } className='text-white text-xs md:text-sm font-medium bg-primary py-2 px-3 md:p-3 rounded-md md:rounded-lg flex items-center gap-x-3'>
				<AddIcon />
				<span>Add New Owner</span>
			</button>
		</>
	);
};

export default AddNewOwnerBtn;