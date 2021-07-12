import api from 'utils/uhttpd.service';

export function getSession() {
	return api.call("tmate", "get_session", {})
		.then(result => (result.session && result.session.rw_ssh) ? result.session : null)
}

export function openSession() {
	return api.call("tmate", "open_session", {})
		.catch((error) => {
			closeSession();
			throw error;
		})
}

export function closeSession() {
	return api.call("tmate", "close_session", {})
}

export function hasInternet(){
	return api.call("tmate", "has_internet", {})
		.then(result => result.hasInternet ? result.hasInternet.online : result.hasInternet.offline);
}

export function verifyInternet(){
	return api.call("wifi-client", "connect", {});
}