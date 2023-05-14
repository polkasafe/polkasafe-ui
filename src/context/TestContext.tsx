// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { createContext,FC, PropsWithChildren } from 'react';
import { Polkasafe } from 'src/polkasafe-sdk/packages';

export const TestContext= createContext({});

export const TestContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const client = new Polkasafe();
	const address = localStorage.getItem('address');
	const network = localStorage.getItem('network');
	const signature = localStorage.getItem('signature');
	if(address && network && signature){
		client.setSignature(signature, network, address);
	}
	console.log('something');
	// eslint-disable-next-line react/react-in-jsx-scope
	return <TestContext.Provider value={{ client }}>
		{children}
	</TestContext.Provider>;
};