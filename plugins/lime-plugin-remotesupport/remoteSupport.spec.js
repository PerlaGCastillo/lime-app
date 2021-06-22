import { h } from 'preact';
import { render as tlRender, fireEvent, cleanup, act, screen } from '@testing-library/preact';
import '@testing-library/jest-dom';

import RemoteSupportPage from './src/remoteSupportPage';
import { getSession, openSession, closeSession , hasInternet } from './src/remoteSupportApi';
import { ReactQueryCacheProvider } from 'react-query';
import queryCache from 'utils/queryCache';
import waitForExpect from 'wait-for-expect';

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
		getSession.mockImplementation(async () =>
			({ rw_ssh: 'ssh -p2222 test_rw_token@test_host', ro_ssh: 'ssh -p2222 test_ro_token@test_host'})
		);
		//render(<RemoteSupportPage />);
		openSession.mockImplementation(async () => null);
		hasInternet.mockImplementation(async () => true);
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

	it('show an error when open session fails', async() => {
		getSession.mockImplementation(async() => null);
		openSession.mockImplementation(async() => { throw new Error() })
		render(<RemoteSupportPage />);
		const createButton = await screen.findByRole('button', {name: /create session/i });
		fireEvent.click(createButton);
		expect(await screen.findByText(/Cannot connect to the remote support server/i)).toBeVisible();
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

	it.skip('shows share internet with a mobile screen after next button was clicked', async() => {
		hasInternet.mockImplementation(async () => false);
		render(<RemoteSupportPage />);
		const createNextButton = await screen.findByRole('button', {name: /next/i });
		fireEvent.click(createNextButton);
		await waitForExpect(() => {
			expect(route).toHaveBeenCalledWith('/hotspot');
		})
	});

	it.skip('shows WiFi config screen when see help link was clicked', async () => {
		hasInternet.mockImplementation(async () => false);
		render(<RemoteSupportPage />);
		const seeHelpButton = await screen.findByRole('button', {name: /see help/i });
		fireEvent.click(seeHelpButton);
		await waitForExpect(() => {
			expect(route).toHaveBeenCalledWith('/help');
		})	
	});

	it.skip('shows a message: WiFi-Denied Access to network when verify button was clicked', async () => {
		hasInternet.mockImplementationOnce(() => false)
		hasInternet.mockImplementation(async() => { throw new Error() })
		render(<RemoteSupportPage />);
		expect(await screen.findByText(
			/Internet access denied/i)).toBeInTheDocument();
		const createVerifyButton= await screen.findByRole('button', {name: /verify/i});
		fireEvent.click(createVerifyButton);
		expect(await screen.findByText(/something went wrong, there's no internet access/i)).toBeVisible();
	});

	it.skip('shows a successful message when verify button is clicked and internet connection is back', async() => {
		hasInternet.mockImplementation(async() => { throw new Success()} )
		render(<RemoteSupportPage />);
		const createVerifyButton = await screen.findByRole('button', {name: /verify/i });
		fireEvent.click(createVerifyButton);
		expect(await screen.findByText(/Wi-fi hotspot connected successfully /i)).toBeVisible();
	});
});