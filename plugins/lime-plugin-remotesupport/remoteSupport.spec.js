import { h } from 'preact';
import { render as tlRender, fireEvent, cleanup, act, screen } from '@testing-library/preact';
import '@testing-library/jest-dom';
import { render } from 'utils/test_utils';
import queryCache from 'utils/queryCache';

import RemoteSupportPage from './src/remoteSupportPage';
import { getSession, openSession, closeSession, hasInternet } from './src/remoteSupportApi';
import waitForExpect from 'wait-for-expect';
import { route } from 'preact-router';

jest.mock('./src/remoteSupportApi');


describe('remote support page', () => {
	beforeAll(() => {
		jest.useFakeTimers();
	})

	beforeEach(() => {
		hasInternet.mockImplementation(async () => true);
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

	it('shows a button to create session when no session', async () => {
		getSession.mockImplementation(async () => null);
		render(<RemoteSupportPage />);
		expect(await screen.findByRole('button', {name: /create session/i })).toBeEnabled();
	});

	it('shows rw session token when there is an open session', async () => {
		render(<RemoteSupportPage />);
		expect(await screen.findByText('ssh -p2222 test_rw_token@test_host')).toBeInTheDocument();
	});

	it('shows a button to close session when there is an open session', async () => {
		render(<RemoteSupportPage />);
		expect(await screen.findByRole('button', {name: /close session/i})).toBeEnabled();
	});

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
		getSession.mockImplementationOnce(async () => null);
		render(<RemoteSupportPage />);
		expect(await screen.findByText(/This node has not internet connection/i)).toBeInTheDocument();	
		expect(await screen.findByText(/To enable remote access it's necessary to be connected to the internet. You can share internet with a cellphone, just click NEXT to see how/i)).toBeInTheDocument();	
		expect(await screen.findByRole('button', {name: /next/i})).toBeEnabled();
		expect(screen.queryByRole('button', {name: /create session/i})).toBeNull();
	});
	
	it('redirects to share internet with a mobile screen tutorial when clicking in next button', async() => {
		hasInternet.mockImplementation(async () => false);
		render(<RemoteSupportPage />);
		const nextButton = await screen.findByRole('button', {name: /next/i});
		fireEvent.click(nextButton);
		await waitForExpect(() => {
			expect(route).toHaveBeenCalledWith('hotspot-guide');
		});
	});

});