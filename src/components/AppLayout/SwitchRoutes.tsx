// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddressBook from 'src/Screens/AddressBook';
import Assets from 'src/Screens/Assets';
import Donate from 'src/Screens/Donate';
import Home from 'src/Screens/Home';
import MultiSig from 'src/Screens/MultiSig';
import SendFunds from 'src/Screens/SendFunds';
import Settings from 'src/Screens/Settings';
import Transaction from 'src/Screens/Transactions';

const SwitchRoutes = () => {
	return (
		<Routes>
			<Route path='/' element={<Home />} />
			<Route path='/donate' element={<Donate />} />
			<Route path='/settings' element={<Settings />} />
			<Route path='/transactions' element={<Transaction />} />
			<Route path='/create-multisig' element={<MultiSig />} />
			<Route path='/send-funds' element={<SendFunds />} />
			<Route path='/assets' element={<Assets />} />
			<Route path='/address-book' element={<AddressBook />} />
		</Routes>
	);
};

export default SwitchRoutes;