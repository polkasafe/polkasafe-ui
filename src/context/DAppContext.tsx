// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@polkadot/api-augment';

import React, { PropsWithChildren, useContext, useState } from 'react';

export interface DAppContextType {
    iframeVisibility: Apps|null;
    setIframeVisibility: React.Dispatch<React.SetStateAction<Apps|null>>;
}

export const DAppContext: React.Context<DAppContextType> = React.createContext(
    {} as DAppContextType
);

export enum Apps {
	POLKASSEMBLY='polkassembly',
	SUB_ID='sub_id',
}

export function DAppContextProvider({
	children
}: PropsWithChildren): React.ReactElement {
	const [iframeVisibility, setIframeVisibility] = useState<Apps | null>(null);
	return (
		<DAppContext.Provider value={{ iframeVisibility, setIframeVisibility }}>
			{children}
		</DAppContext.Provider>
	);
}

export function useGlobalDAppContext() {
	return useContext(DAppContext);
}
