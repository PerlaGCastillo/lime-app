import { h } from 'preact';
import { useHasInternet } from './remoteSupportQueries';
import { useEffect, useState } from 'preact/hooks';
import Loading from 'components/loading';
import I18n from 'i18n-js';
import { route } from 'preact-router';
import style from './style.less';

export const hasInternet_ = ({ hasInternet, next}) =>
	<div class="d-flex flex-column flex-grow-1">
		<h4> Enable Remote Access</h4>
		{/* TODO add warning icon before this p */}
		<p>{I18n.t('⚠ Your node has no internet connection')}</p>
		<p>{I18n.t('To enable remote access it\'s necessary being connected to the internet. You can share internet with a cellphone, just click NEXT to see how')}</p>
		<div class={`d-flex justify-content-center `}>
			<button onClick={nextInternet}>{I18n.t("Next")}</button>
		</div>
	</div>

const hotspotView = () => {
	const {data: hasInternet } = useHasInternet();

	useHasInternet(() => {
		if (!hasInternet && !session) goBack();
	}, [isLoading, session])

	// useEffect(() => {
	// 	if (hasInternet) {
	// 		setHaInternet()
	// 	}
	// }, [hasInternet])
	
	function goBack() {
		route('/remotesupport');
	}

	if (isLoading) {
		return <div class="container container-center"><Loading /></div>
	}

	return <hotspotView_ sessionSrc={sessionSrc} goBack={goBack} />
}

export default hotspotView;
