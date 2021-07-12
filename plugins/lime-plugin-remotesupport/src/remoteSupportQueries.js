import { useQuery, useMutation } from 'react-query';
import queryCache from 'utils/queryCache';
import { getSession, openSession, closeSession, hasInternet, verifyInternet } from './remoteSupportApi'


export function useHasInternet() {
	return useQuery(["tmate", "has_internet"], hasInternet);
}

export function useVerifyInternet() {
	return useMutation(verifyInternet, {
		onSuccess: () => queryCache.invalidateQueries(["tmate", "has_internet"]),
		onError: () => queryCache.setQueryData(["tmate", "has_internet"], false)
	});
}

export function useSession(queryConfig) {
	return useQuery(["tmate", "get_session"], getSession, queryConfig);
}

export function useOpenSession() {
	return useMutation(openSession, {
		onSuccess: () => queryCache.invalidateQueries(["tmate", "get_session"]),
		onError: () => queryCache.setQueryData(["tmate", "get_session"], null)
	})
}

export function useCloseSession() {
	return useMutation(closeSession, {
		onSuccess: () => queryCache.invalidateQueries(["tmate", "get_session"])
	})
}