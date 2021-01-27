import api from 'utils/uhttpd.service';

export function getBatHost(mac, outgoingIface) {
	return api.call('bat-hosts', 'get_bathost', {mac, outgoing_iface: outgoingIface}).toPromise()
		.then(response => new Promise((res, rej) => {
			if (response.status === 'ok') {
				res(response.bathost);
			}
			else {
				rej(response.message);
			}
		}))
}
