import { h } from 'preact';
import { render as tlRender, fireEvent, cleanup, act, screen } from '@testing-library/preact';
import '@testing-library/jest-dom';

import RemoteSupportPage from './src/remoteSupportPage';
import { getSession, openSession, closeSession , hasInternet } from './src/remoteSupportApi';
import { ReactQueryCacheProvider } from 'react-query';
import queryCache from 'utils/queryCache';
import waitForExpect from 'wait-for-expect';
import { route } from 'preact-router';
import nextHotspotView, { hasInternet_ } from './src/hotspotView';
import { showHelp } from 'yargs';

jest.mock('./src/remoteSupportApi');

const render = (ui) => tlRender(
	<ReactQueryCacheProvider queryCache={queryCache}>
		{ui}
	</ReactQueryCacheProvider>
)

describe('remote support page', () => {
	beforeAll(() => {
		jest.useFakeTimers();
	})

	beforeEach(() => {
		hasInternet.mockImplementation(async () => 
			({ online: 'Wi-Fi successfully connected', offline: 'The node can´t connect to the network'})
		);
		getSession.mockImplementation(async () =>
			({ rw_ssh: 'ssh -p2222 test_rw_token@test_host', ro_ssh: 'ssh -p2222 test_ro_token@test_host'})
		);
		openSession.mockImplementation(async () => null);
		closeSession.mockImplementation(async () => null);
	});

	afterEach(() => {
		cleanup();
		act(() => queryCache.clear());
	});
	
	afterAll(() => {
		jest.useRealTimers();
	})

	it('shows a button to create session when there is no session', async () => {
		getSession.mockImplementation(async () => null);
		render(<RemoteSupportPage />);
		expect(await screen.findByRole('button', {name: /create session/i })).toBeEnabled();
	});

	it('shows rw session token when there is an open session', async () => {
		render(<RemoteSupportPage />);
		expect(await screen.findByText('ssh -p2222 test_rw_token@test_host')).toBeInTheDocument();
	})

	it('shows a button to close session when there is an open session', async () => {
		render(<RemoteSupportPage />);
		expect(await screen.findByRole('button', {name: /close session/i})).toBeEnabled();
	})

	it('shows rw session token after clicking on open session', async() => {
		getSession
			.mockImplementationOnce(async () => null)
			.mockImplementationOnce(async () =>
				({ rw_ssh: 'ssh -p2222 test_rw_token@test_host', ro_ssh: 'ssh -p2222 test_ro_token@test_host'}));
		render(<RemoteSupportPage />);
		const createButton = await screen.findByRole('button', {name: /create session/i });
		fireEvent.click(createButton);
		expect(await screen.findByText('ssh -p2222 test_rw_token@test_host')).toBeInTheDocument();
	});

	it('shows a button to show the console when there is an active session', async() => {
		render(<RemoteSupportPage />);
		expect(await screen.findByRole('button', {name: /show console/i})).toBeEnabled();
	});

	it('shows connection guide to hotspot when there is no internet', async () => {
		hasInternet.mockImplementation(async () => false);
		render(<RemoteSupportPage />);
		expect(await screen.findByText(/This node has not internet connection/i)).toBeInTheDocument();	
	});
	
	it('shows share internet with a mobile screen tutorial after next button was clicked', async() => {
		hasInternet.mockImplementation(async () => false);
		render(<RemoteSupportPage />);
		const onNextHotspotView = await screen.findByRole('button', {name: /next/i});
		fireEvent.click(onNextHotspotView);
		await waitForExpect(() => {
			expect(route).toHaveBeenCalledWith('nextHotspotView')
		})
	});
	//HOTSPOT
	it('calls hotspot config for iOs and Android when help icon was clicked', async () => {
		hasInternet.mockImplementation(async () => false);
		render(<RemoteSupportPage />);
		const onToogleHelp= await screen.findByRole('button', {name: /How to configure my WiFi zone/i});
		fireEvent.click(onToogleHelp);
		  await waitForExpect(() => {
		  	expect(route).toHaveBeenCalledWith('./help');
		 })
	});

	it('shows a message: WiFi-Denied Access to network when verify button was clicked', async () => {
		hasInternet.mockImplementationOnce(async () => ({online: 'online'}));
		hasInternet.mockImplementationOnce(async () => ({offline: 'offline'}));
		hasInternet.mockImplementation(async() => { throw new Error() })
		render(<RemoteSupportPage />);
		expect(await screen.findByText(/The node can´t connect to the hotspot network/i)).toBeInTheDocument();
		expect(await screen.findByRole('button', {name: /verify/i})).toBeDisabled();
	});

	it('shows an enabled button to verify hotspot access when its configured', async () =>{
		hasInternet.mockImplementation(async () => ({online: 'online'}));
		hasInternet.mockImplementation(async () => ({offline: 'offline'}));
		render(<RemoteSupportPage />);
		await flushPromises();
		expect(await screen.findByRole('button', {name: /verify/i})).toBeEnabled();
	});

	it('shows a successful message when verify button is clicked and internet connection is back', async() => {
		hasInternet.mockImplementation(async() => { throw new Success()} )
		render(<RemoteSupportPage />);
		//expect(await screen.findByRole('button', {name: /verify/i })).toBeEnabled();
		const createVerifyButton = await screen.findByRole('button', {name: /verify/i });
		fireEvent.click(createVerifyButton);
		expect(await screen.findByText(/Wi-fi hotspot connected successfully /i)).toBeVisible();
	});
});