// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ConfigProvider } from 'antd';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { styledTheme } from 'src/themes/styledTheme';
import { ThemeProvider } from 'styled-components';

import AppLayout from './components/AppLayout';
import { ActiveMultisigProvider } from './context/ActiveMultisigContext';
import { ApiContextProvider } from './context/ApiContext';
import { DAppContextProvider } from './context/DAppContext';
import ModalContextProvider from './context/ModalContext';
import { UserDetailsProvider } from './context/UserDetailsContext';
import { antdTheme } from './themes/antdTheme';
import { GlobalStyle } from './ui-components/GlobalStyle';

function App() {
	return (
		<BrowserRouter>
			<ConfigProvider theme={antdTheme}>
				<ThemeProvider theme={styledTheme}>
					<ApiContextProvider>
						<UserDetailsProvider>
							<ActiveMultisigProvider>
								<DAppContextProvider>
									<GlobalStyle/>
									<ModalContextProvider>
										<AppLayout />
									</ModalContextProvider>
								</DAppContextProvider>
							</ActiveMultisigProvider>
						</UserDetailsProvider>
					</ApiContextProvider>
				</ThemeProvider>
			</ConfigProvider>
		</BrowserRouter>
	);
}

export default App;
