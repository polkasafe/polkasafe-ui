// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AssetsTable from 'src/components/Assets/AssetsTable';
// import DropDown from 'src/components/Assets/DropDown';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IAsset } from 'src/types';
import { ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import Loader from 'src/ui-components/Loader';

const Assets = () => {

	const [loading, setLoading] = useState<boolean>(false);
	const [assetsData, setAssetsData] = useState<IAsset[]>([]);
	const { address, activeMultisig } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();

	const handleGetAssets = useCallback(async () => {
		try{
			const address = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!address || !signature || !activeMultisig) {
				console.log('ERROR');
				return;
			}
			else{

				setLoading(true);
				const getAssestsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getAssetsForAddress`, {
					body: JSON.stringify({
						address: activeMultisig,
						network
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data, error } = await getAssestsRes.json() as { data: IAsset[], error: string };

				if(error) {
					setLoading(false);
					return;
				}

				if(data){
					setAssetsData(data);
					setLoading(false);

				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	}, [activeMultisig, network]);

	useEffect(() => {
		handleGetAssets();
	}, [handleGetAssets]);

	if(loading) return <Loader size='large'/>;

	return (
		<div className='h-[70vh] bg-bg-main rounded-lg'>
			{address ?
				<div className="grid grid-cols-12 gap-4">
					<div className="col-start-1 col-end-13">
						<div className="flex items-center justify-between">
							<div className='flex items-center'>
								<h2 className="text-lg font-bold text-white mt-3 ml-5">Tokens</h2>
							</div>
							{/* <div className='flex items-center justify-center mr-5 mt-3'>
						<p className='text-text_secondary mx-2'>Currency:</p>
						<DropDown />
					</div> */}
						</div>
					</div>
					<div className='col-start-1 col-end-13 mx-5'>
						<AssetsTable assets={ assetsData }/>
					</div>
				</div>
				:
				<div className='h-full w-full flex items-center justify-center text-primary font-bold text-lg'>
					<Link to='/'><span>Please Login</span> <ExternalLinkIcon /></Link>
				</div>}
		</div>
	);
};

export default Assets;