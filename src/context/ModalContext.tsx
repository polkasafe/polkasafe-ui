// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { Context, createContext, FC, PropsWithChildren, ReactNode, useContext, useState } from 'react';
import Modal, { IModal } from 'src/ui-components/Modal';

interface IModalContext {
	toggleVisibility: () => void;
	openModal: (title: string, children: ReactNode, CloseBtnNode?: ReactNode) => void;
}

const ModalContext: Context<IModalContext> = createContext({} as IModalContext);

export const useModalContext = () => {
	return useContext(ModalContext);
};

const ModalContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const [modal, setModal] = useState<IModal>({
		isVisible: false,
		title: ''
	});
	const toggleVisibility = () => {
		setModal((prev) => ({ ...prev, isVisible: !prev.isVisible }));
	};
	const openModal = (title: string, children: ReactNode, CloseBtnNode?: ReactNode) => {
		setModal({
			CloseBtnNode,
			children,
			isVisible: true,
			title
		});
	};
	return (
		<ModalContext.Provider value={{
			openModal,
			toggleVisibility
		}}>
			{children}
			<Modal toggleVisibility={toggleVisibility} { ...modal } />
		</ModalContext.Provider>
	);
};

export default ModalContextProvider;