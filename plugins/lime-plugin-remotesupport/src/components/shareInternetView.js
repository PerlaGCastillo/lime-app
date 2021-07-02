import {h} from 'preact'; 
import I18n from 'i18n-js';
import { useState } from 'preact/hooks';
import { useHasInternet } from './remoteSupportQueries';
import { route } from 'preact-router';
import style from './style.less';
import { hasInternet } from './remoteSupportApi';

//TODO refactor: dirty implementation
const hasInternetStatus = ({hasInternet}) => {
	const [hasInternet, setHasInternet] = useState('');
	const verify = useCallback(() => {
		setHasInternet(navigator.onLine ? "online" : "offline")
	}, [hasInternet]);

	const [showHelp, setShowHelp] = useState('');
	
	function toogleHelp(e) {
		e.preventDefault();
		setShowHelp(prevValue => !prevValue);
	}

	return (
		<div className="container container-padded">
		<p>{I18n.t('Share internet with a mobile phone')}</p>
					<p>{I18n.t('To share internet to the node with a mobile phone follow these steps:')}</p>
					<ol>
						<li>{I18n.t('Get an additional mobile phone to the one you are using with a mobile data connection.')}</li>
						<li>{I18n.t('With this second mobile phone create a hotspot to share internet to the router with this data:  user : internet, password: internet')}</li>
						<li>{I18n.t('Click on "Verify" to check out that your node can connect to the mobile hotspot.')}</li>
					</ol>
			<a href="#" onClick={toogleHelp}>{I18n.t("I don't know how to configure my WiFi zone")}</a>
			{showHelp &&
				<div>
					<h4>{I18n.t('Set up HotSpot network for iOs')}</h4>
					<p>{I18n.t('Config > Share internet > Let others to connect > WiFi password > password: internet')}</p>
					<h4>{I18n.t('Set up HotSpot network for Android')}</h4>
					<p>{I18n.t('To Create a hotspot network, look up for some of the following options in your phone: Shared connection, WiFi Zone, tether to network, HotSpot, Access Point')}</p>
				</div>
			}
			{hasInternet &&
				<div>
					<button onClick={verify} route={"/remoteSupport"}> {I18n.t('Verify')}</button>
					<p>{I18n.t('Wi-Fi Hotspot successfully connected')}</p>
				</div>
			}
			{!hasInternet &&
				<div>
					<button onClick={verify}> {I18n.t('Verify')}</button>
					{I18n.t('The node can´t connect to the hotspot network')}
				</div>
			}
		</div>
	);
};

export default hasInternetStatus;

