// Map.jsx

import React, { useEffect, useRef } from 'react';
import './KakaoMap.css'; 
// config.js 파일로부터 KAKAO_APP_KEY 변수를 가져옵니다.
import { KAKAO_APP_KEY } from '../api/config.js';

const Map = () => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        const loadKakaoMapScript = () => {
            if (window.kakao && window.kakao.maps) {
                renderMap();
                return;
            }
            const script = document.getElementById('kakao-maps-sdk');
            if (script) return;

            const newScript = document.createElement('script');
            newScript.id = 'kakao-maps-sdk';
            newScript.async = true;
            newScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
            document.head.appendChild(newScript);
            newScript.onload = () => renderMap();
        };

        const renderMap = () => {
            window.kakao.maps.load(() => {
                if (mapContainer.current && !mapInstance.current) {
                    const options = {
                        center: new window.kakao.maps.LatLng(33.450701, 126.570667),
                        level: 3,
                    };
                    const map = new window.kakao.maps.Map(mapContainer.current, options);
                    mapInstance.current = map;

                    // 지도의 크기를 div에 맞게 다시 설정합니다.
                    // 레이아웃 계산이 끝난 직후에 실행되도록 setTimeout을 사용합니다.
                    setTimeout(() => {
                        map.relayout();
                    }, 0);
                }
            });
        };

        loadKakaoMapScript();
    }, []);

    return (
        <div 
            id="map" 
            ref={mapContainer}
            className='map-placeholder'
        ></div>
    );
};

export default Map;