// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import AssetsTable from 'src/components/Assets/AssetsTable';
import DropDown from 'src/components/Assets/DropDown';

const Assets = () => {
	return (
		<div className='h-[70vh] bg-bg-main rounded-lg'>
			<div className="grid grid-cols-12 gap-4">
				<div className="col-start-1 col-end-13">
					<div className="flex items-center justify-between">
						<div className='flex items-center'>
							<h2 className="text-lg font-bold text-white mt-3 ml-5">Tokens</h2>
						</div>
						<div className='flex items-center justify-center mr-5 mt-3'>
							<p className='text-text_secondary mx-2'>Currency:</p>
							<DropDown />
						</div>
					</div>
				</div>
				<div className='col-start-1 col-end-13 mx-5'>
					<AssetsTable />
				</div>
			</div>
		</div>
	);
};

export default Assets;