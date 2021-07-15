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
import hotspotPage from './hotspotPage';

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

    it('shows instruction for hotspot setup', async () => {
        render(<HotspotPage />);
        expect(screen.findByText('Share internet with a mobile phone')).toBeInTheDocument();
        expect(screen.findByText('To share internet to the node with a mobile phone follow these steps:')).toBeInTheDocument();
        expect(screen.findByText('Get an additional mobile phone to the one you are using with a mobile data connection.')).toBeInTheDocument();
        expect(screen.findByText('With this second mobile phone create a hotspot to share internet to the router with this data:  user : internet, password: internet')).toBeInTheDocument();
        expect(screen.findByText('Click on "Verify" to check out that your node can connect to the mobile hotspot.')).toBeInTheDocument();
    });

    it('shows a button for verifying hotspot setup', async () => {
        render(<HotspotPage />);
        expect(screen.findByRole('button', { name: /verify/i })).toBeEnabled();
    });

    it('shows a button for additional help', async() => {
        render(<HostpotPage />);
        const helpButton = await screen.findByLabelText('help');
        fireEvent.click(helpButton);
        expect(await screen.findByText(
            'Set up HotSpot network for iOs')).toBeInTheDocument();
        expect(await screen.findByText(
            'Config > Share internet > Let others to connect > ' +
            'WiFi password > password: internet')).toBeInTheDocument();
        expect(await screen.findByText(
            'Set up HotSpot network for Android')).toBeInTheDocument();
        expect(await screen.findByText(
            'To Create a hotspot network, look up for some of the following ' +
            'options in your phone: Shared connection, WiFi Zone, tether to ' +
            'network, HotSpot, Access Point')).toBeInTheDocument();
    });

    it('calls verify hostpot endpoint when clicking on verify', async() => {
        //TODO
    });

    it('shows a successfull message when verify button is clicked and internet connection is back', async() => {
        verifyIntenet.mockImplementationOnce(async () => true);
        render(<RemoteSupportPage />);
        const verifyInternetButton = await screen.findByRole('button', {name: /verify/i});
        fireEvent.click(verifyInternetButton);	
        expect(await screen.findByText(/Wi-Fi Hotspot successfully connected/i)).toBeVisible();
    });

	it('shows an error message when verify button was clicked and there`s no internet', async () => {
        verifyIntenet.mockImplementationOnce(async () => false);
		render(<RemoteSupportPage />);
		const verifyInternetButton = await screen.findByRole('button', {name: /verify/i});
		fireEvent.click(verifyInternetButton);
		expect(await screen.findByText(/The node can´t connect to the hotspot network/i)).toBeVisible();
	});
	
});