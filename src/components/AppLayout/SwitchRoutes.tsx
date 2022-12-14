// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Donate from 'src/Screens/Donate';
import Home from 'src/Screens/Home';
import Settings from 'src/Screens/Settings';

const SwitchRoutes = () => {
	return (
		<Routes>
			<Route path='/' element={<Home/>} />
			<Route path='/donate' element={<Donate/>} />
			<Route path='/settings' element={<Settings/>} />
		</Routes>
	);
};

export default SwitchRoutes;