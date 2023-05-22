// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import 'src/themes/app.css';

import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
	::-webkit-scrollbar {
		width: 6px;
		height: 6px;
	}

	::-webkit-scrollbar-track {
		background: #f1f1f1; 
	}
	
	/* Handle */
	::-webkit-scrollbar-thumb {
		background: #888; 
	}

	::-webkit-scrollbar-thumb:hover {
		background: #555; 
	}
	.scroll-transparent::-webkit-scrollbar {
		width: 0px;
		height: 0px;
	}

	.scroll-transparent::-webkit-scrollbar-track {
		background: transparent; 
	}
	
	/* Handle */
	.scroll-transparent::-webkit-scrollbar-thumb {
		background: transparent; 
	}

	.scroll-transparent::-webkit-scrollbar-thumb:hover {
		background: transparent; 
	}

	body {
		margin: 0;
		font-family: font_default, 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Oxygen',
				'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
				sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background-color: #F6F7FE; 
		/* TODO: Use variable for bg-color */
		color: black_text;
		scroll-behavior: smooth;
	}

	ul, ol {
    	list-style: revert !important;
  	}

	ul {
		padding: 0;
	}

	p {
		a {
			color: blue_primary;
			&:hover {
				color: blue_secondary;
			}
		}
	}

	a:hover {
		text-decoration: none;
	}

	input {
		color: #fff !important;
	}

	::selection {
		background-color: white;
		color: #1573FE;
	}

	.ant-btn-primary {
		color: blue_primary !important;

		&:hover, &:focus, &:active{
			color: #fff !important;
		}

		&[disabled] {
			color: grey !important;
		}
	}

	.ant-form-item-explain-error {
		margin-top: 0.3em !important;
		margin-bottom: 1em !important;
	}

	.ant-switch {
		background: #1A2A42 !important;
	}

	.ant-switch-checked{
		background-color: #1573FE !important;
	}

	.ant-checkbox-disabled+span{
		color: #8B8B8B !important;
	}

	.ant-segmented-item-selected .ant-segmented-item-label {
		color: blue_primary !important;
	}


	.ant-modal-header {
		border-radius: 10px 10px 0 0;
	}

	.ant-modal-content {
		border-radius: 10px;
	}

	.ant-tabs-tab-bg-white .ant-tabs-tab:not(.ant-tabs-tab-active) {
		background-color: white;
		border-top-color: white;
		border-left-color: white;
		border-right-color: white;
		border-bottom-color: #E1E6EB;
	}
	.ant-tabs-tab-bg-white .ant-tabs-tab-active{
		border-top-color: #E1E6EB;
		border-left-color: #E1E6EB;
		border-right-color: #E1E6EB;
		border-radius: 6px 6px 0 0 !important;
	}
	.ant-tabs-tab-bg-white .ant-tabs-nav:before{
		border-bottom: 1px solid #E1E6EB;
	}

	.ant-menu-submenu-popup {
		display: none !important;
	}

	.ant-dropdown-menu-root {
		margin-top: 6px !important;
		border: 1px solid #1573FE !important;
		border-radius: 12px !important;
		background-color: #24272E !important;
		padding: 12px 8px !important;
  }
	.ant-picker-panel-container {
		background-color: #1573FE !important;
	}
	.ant-picker-header {
		color: white !important;
	}
	.ant-picker-body th, td{
		color: white !important;
	}
	.ant-picker-header-super-prev-btn , .ant-picker-header-prev-btn, .ant-picker-header-next-btn, .ant-picker-header-super-next-btn{
		color: white !important;
	}
	.ant-picker-footer, .ant-picker-header {
		border-color: white !important;
	}
	.ant-picker-today-btn {
		color: white !important;
	}
	.ant-picker-header-super-prev-btn:hover , .ant-picker-header-prev-btn:hover, .ant-picker-header-next-btn:hover, .ant-picker-header-super-next-btn:hover, .ant-picker-month-btn:hover, .ant-picker-year-btn:hover, .ant-picker-today-btn:hover {
		color: #1B2028 !important;
	}

	.ant-select-dropdown {
		background-color: #24272E !important;
		border: 1px solid #1573FE !important;
		border-radius: 12px !important;
		padding-bottom: 10px !important;
		transform: scale(0.9) !important;
		transform-origin: center !important;
	}
	.ant-select-item-option-content {
		color: white !important;
		border-bottom: 1px solid #8B8B8B !important;
		font-family: 'Archivo' !important;
		font-style: normal !important;
		font-weight: 400 !important;
		font-size: 14px !important;
		line-height: 15px !important;
		padding: 10px !important;
	}
	.recipient_heading {
		font-family: 'Archivo';
		font-style: normal;
		font-weight: 400;
		font-size: 12px;
		line-height: 13px;
		color: #1573FE;
		margin-left: 12px;
		margin-top: 12px;
	}

	.ant-timeline .ant-timeline-item-head {
		background-color: transparent !important;
	}

	.ant-message-notice-content {
		background-color: #fff !important;
		color: #000 !important;
	}

	::-webkit-scrollbar-track {
		border-radius: 10px;
		background: #1B2028;
	}

	::-webkit-scrollbar-thumb {
		background: #1B2028;
		border-radius: 10px;
	}

	.overflow-y-auto:hover::-webkit-scrollbar-thumb,
	.overflow-auto:hover::-webkit-scrollbar-thumb{
		background: linear-gradient(white,#AFCFFF) !important;
	}
`;
