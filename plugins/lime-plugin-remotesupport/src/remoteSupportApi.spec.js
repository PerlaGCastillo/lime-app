import api from 'utils/uhttpd.service';
import hotspotPage from './hostpotPage';

jest.mock('utils/uhttpd.service');

import { getSession, openSession, closeSession, hasInternet, verifyInternet } from './remoteSupportApi';

beforeEach(() => {
    api.call.mockClear();
    api.call.mockImplementation(async () => ({ status: 'ok' }));
})
 
describe('getSession', () => {
    it('calls the expected endpoint', async () => {
        await getSession();
        expect(api.call).toBeCalledWith('tmate', 'get_session', {});
    })

    it('resolves to session when there is a connected session', async () => {
        const sessionData = {
            rw_ssh: 'ssh -p2222 pL2qpxKQvPP9f9GPWjG2WkfrM@ny1.tmate.io',
            ro_ssh: 'ssh -p2222 pL2qpxKQvPP9f9GPWjG2WkfrM@ny1.tmate.io'
        };
        api.call.mockImplementation(async () => (
            {
                status: 'ok',
                session: sessionData,
            }));
        let session = await getSession();
        expect(session).toEqual(sessionData);
    });

    it('resolves to null when there is no session', async () => {
        const sessionData = 'no session';
        api.call.mockImplementation(async () => (
            {
                status: 'ok',
                session: sessionData,
            }));
        let session = await getSession();
        expect(session).toBeNull();
    });

    it('resolves to null when there is a non established session', async () => {
        const sessionData = {
            rw_ssh: "", ro_ssh: ""
        };
        api.call.mockImplementation(async () => (
            {
                status: 'ok',
                session: sessionData,
            }));
        let session = await getSession();
        expect(session).toBeNull();
    });
});

describe('closeSession', () => {
    it('calls the expected endpoint', async () => {
        await closeSession();
        expect(api.call).toBeCalledWith('tmate', 'close_session', {})
    })
});

describe('openSession', () => {
    it('calls the expected endpoint', async () => {
        await openSession();
        expect(api.call).toBeCalledWith('tmate', 'open_session', {})
    })

    it('resolves to api response on success', async () => {
        const result = await openSession();
        expect(result).toEqual({ status: 'ok'})
    })

    it('rejects to api call error on error', async () => {
        api.call.mockImplementationOnce(() => Promise.reject('timeout'));
        api.call.mockImplementationOnce(async () => ({'status': 'ok'}));
        expect.assertions(1);
        try {
            await openSession()
        } catch (e) {
            expect(e).toEqual('timeout')
        }
    })

    it('calls close session when rejected ', async () => {
        api.call.mockImplementationOnce(() => Promise.reject('timeout'));
        api.call.mockImplementationOnce(async () => ({'status': 'ok'}));
        expect.assertions(1);
        try {
            await openSession()
        } catch (e) {
            expect(api.call).toBeCalledWith('tmate', 'close_session', {})
        }
    })
});

describe('hasInternet', () => {
    it('calls the expected endpoint', async () => {
        await hasInternet();
        expect(api.call).toBeCalledWith('tmate','has_internet', {});
    });

    it('resolves to true when the node has internet connection', async () => {
        api.call.mockImplementation(async () => (
            {
                status: 'ok',
                has_internet: true,
            }));
        expect(await hasInternet()).toEqual(true);
    });

    it('resolves to false when there is no internet', async () => {
        api.call.mockImplementation(async () => (
            {
                status: 'ok',
                has_internet: false,
            }));
        expect(await hasInternet()).toEqual(false);
    });

});

describe('verifyInternet', () => {
    it('calls the expected endpoint', async () => {
        await verifyInternet();
        expect(api.call).toBeCalledWith('wifi-client', 'connect', {})
    })

    it('resolves to true on success', async () => {
        api.call.mockImplementation(async () => (
            {
                status: 'ok',
                connected: true,
            }));
        expect(await verifyInternet()).toEqual(true);
    });

    it('rejects when node cant connect to hotspot', async () => {
        api.call.mockImplementation(async() => Promise.reject("Can't connect to default network"));
        expect.assertions(1);
        try {
            await verifyInternet();
        } catch (e) {
            expect(e).toEqual("Can't connect to default network");
        }
    });
});