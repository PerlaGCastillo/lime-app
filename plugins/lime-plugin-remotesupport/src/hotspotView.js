import { h } from 'preact';
import { useHasInternet, useVerifyInternet } from './remoteSupportQueries';
import { useEffect, useState } from 'preact/hooks';
import Loading from 'components/loading';
import I18n from 'i18n-js';
import { route } from 'preact-router';
import style from './style.less';


function hasInternet() {
	const [hasInternet, setHasInternet] = useState();
	const verifyInternet = useCallback(() => {
		setHasInternet(hasInternet.online ? "online" : "offline")
	}, [hasInternet]);
  
	return (
	  <div>
	  	<p>{hasInternet}</p>
		<button onClick={verifyInternet}>Verify</button>
		{/* <button onClick={() => setHasInternet()}> Verify </button> */}
	  </div>
	);
  }

export const hasInternet_ = ({ hasInternet, nextHotspotView}) =>
	<div class="d-flex flex-column flex-grow-1">
		<h4> Enable Remote Access</h4>
		<p>{I18n.t('⚠ Your node has no internet connection')}</p>
		<p>{I18n.t('To enable remote access it\'s necessary being connected to the internet. You can share internet with a cellphone, just click NEXT to see how')}</p>
		<div class={`d-flex justify-content-center `}>
			<button onClick={nextHotspotView}>{I18n.t("Next")}</button>
		</div>
	</div>

const nextHotspotView = () => {
	const {data: hasInternet } = useHasInternet();

	useHasInternet(() => {
		if (!hasInternet && !session) goBack();
	}, [isLoading, session])

	useEffect(() => {
	 	if (hasInternet) {
	 		setHasInternet()
	 	}
	 }, [hasInternet])
	
	function goBack() {
		route('/remotesupport');
	}

	if (isLoading) {
		return <div class="container container-center"><Loading /></div>
	}

	return <nextHotspotView  goBack={goBack} />
}

export default nextHotspotView;
