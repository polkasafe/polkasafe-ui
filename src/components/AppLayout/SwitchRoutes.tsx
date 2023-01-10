// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddressBook from 'src/Screens/AddressBook';
import Apps from 'src/Screens/Apps';
import Assets from 'src/Screens/Assets';
import ContactUs from 'src/Screens/ContactUs';
import Donate from 'src/Screens/Donate';
import Error404 from 'src/Screens/Error404';
import Error500 from 'src/Screens/Error500';
import Home from 'src/Screens/Home';
import PrivacyPolicy from 'src/Screens/PrivacyPolicy';
import Settings from 'src/Screens/Settings';
import TermsAndCondition from 'src/Screens/TermsAndCondition';
import Transaction from 'src/Screens/Transactions';

import ConnectWallet from '../Home/ConnectWallet';

const SwitchRoutes = () => {
	return (
		<Routes>
			<Route path='/' element={<Home />} />
			<Route path='/connect-wallet' element={<ConnectWallet />} />
			<Route path='/apps' element={<Apps />} />
			<Route path='/donate' element={<Donate />} />
			<Route path='*' element={<Error404/>}/>
			<Route path="/error/500" element={<Error500/>} />
			<Route path='/settings' element={<Settings />} />
			<Route path='/transactions' element={<Transaction />} />
			<Route path='/assets' element={<Assets />} />
			<Route path='/address-book' element={<AddressBook />} />
			<Route path='/contact-us' element={<ContactUs/>} />
			<Route path='/privacy-policy' element={<PrivacyPolicy/>} />
			<Route path='/terms-and-conditions' element={<TermsAndCondition/>} />
		</Routes>
	);
};

export default SwitchRoutes;