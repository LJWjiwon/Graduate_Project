import React, { useEffect, useRef, useState } from 'react';
import './KakaoMap.css'; 
import { KAKAO_APP_KEY } from '../api/config.js';

const Map = () => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    
    const [keyword, setKeyword] = useState('');
    const [places, setPlaces] = useState([]);
    const [markers, setMarkers] = useState([]);
    const placesService = useRef(null);
    const infowindow = useRef(null);

    // '상세보기' 버튼 클릭 시
    const handleShowDetail = (place) => {
        if (place.place_url) {
            window.open(place.place_url, '_blank');
        } else {
            alert('상세보기 URL이 제공되지 않는 장소입니다.');
        }
    };

    // '장소 추가' 버튼 클릭 시
    const handleAddPlace = (place) => {
        alert(`'${place.place_name}' 장소를 추가합니다.`);
        console.log('추가할 장소:', place);
    };

    // 인포윈도우 컨텐츠(DOM) 생성 함수
    const createInfoWindowContent = (place) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'infowindow-wrap'; 

        const title = document.createElement('div');
        title.className = 'infowindow-title';
        title.innerHTML = place.place_name;
        wrapper.appendChild(title);

        const address = document.createElement('div');
        address.className = 'infowindow-address';
        address.innerHTML = place.road_address_name || place.address_name;
        wrapper.appendChild(address);

        const tel = document.createElement('div');
        tel.className = 'infowindow-tel';
        tel.innerHTML = place.phone || '전화번호 없음';
        wrapper.appendChild(tel);

        const buttons = document.createElement('div');
        buttons.className = 'infowindow-buttons';

        const btnDetail = document.createElement('button');
        btnDetail.className = 'infowindow-btn btn-detail';
        btnDetail.innerHTML = '상세보기';
        btnDetail.onclick = () => handleShowDetail(place); 
        buttons.appendChild(btnDetail);

        const btnAdd = document.createElement('button');
        btnAdd.className = 'infowindow-btn btn-add';
        btnAdd.innerHTML = '장소 추가';
        btnAdd.onclick = () => handleAddPlace(place); 
        buttons.appendChild(btnAdd);

        wrapper.appendChild(buttons);

        return wrapper;
    };


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
            newScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false`;
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

                    placesService.current = new window.kakao.maps.services.Places();
                    infowindow.current = new window.kakao.maps.InfoWindow({ 
                        zIndex: 1,
                        disableAutoPan: true 
                    });

                    // 지도 클릭 시 인포윈도우 닫기
                    window.kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
                        infowindow.current.close();
                    });

                    setTimeout(() => {
                        map.relayout();
                    }, 0);
                }
            });
        };

        loadKakaoMapScript();
    }, []); // <-- 의존성 배열은 비어있는 것이 맞습니다.

    //handleSearch (마커 클릭 이벤트 핸들러 수정) ---
    const handleSearch = (e) => {
        e.preventDefault();
        if (!keyword.trim()) {
            alert('키워드를 입력해주세요.');
            return;
        }
        if (!placesService.current || !mapInstance.current) {
            alert('지도 서비스가 준비되지 않았습니다.');
            return;
        }

        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);
        infowindow.current.close();

        placesService.current.keywordSearch(keyword, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setPlaces(data);
                const bounds = new window.kakao.maps.LatLngBounds();
                const newMarkers = [];

                data.forEach(place => {
                    const position = new window.kakao.maps.LatLng(place.y, place.x);
                    const marker = new window.kakao.maps.Marker({
                        map: mapInstance.current,
                        position: position,
                    });

                    // --- 마커 클릭 이벤트 ---
                    window.kakao.maps.event.addListener(marker, 'click', () => {
                        
                        setMarkers(currentMarkers => {
                            currentMarkers.forEach(m => m.setMap(null));
                            marker.setMap(mapInstance.current);
                            return [marker]; 
                        });
                        
                        const content = createInfoWindowContent(place);
                        infowindow.current.setContent(content);
                        infowindow.current.open(mapInstance.current, marker);
                        
                        mapInstance.current.panTo(position);
                        
                        setPlaces([]);
                    });

                    newMarkers.push(marker);
                    bounds.extend(position);
                });

                setMarkers(newMarkers); 
                mapInstance.current.setBounds(bounds);
            } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                alert('검색 결과가 없습니다.');
                setPlaces([]);
            } else {
                alert('검색 중 오류가 발생했습니다.');
                setPlaces([]);
            }
        });
    };

    // --- [수정됨] handlePlaceClick (검색 목록 아이템 클릭 시) ---
    const handlePlaceClick = (place) => {
        const map = mapInstance.current;
        const position = new window.kakao.maps.LatLng(place.y, place.x);

        // 1. 현재 state에 있는 모든 마커를 지도에서 즉시 제거
        markers.forEach(marker => marker.setMap(null));

        // 2. 클릭한 장소에 대한 '새로운' 마커를 생성합니다.
        const newMarker = new window.kakao.maps.Marker({
            map: map,
            position: position,
        });

        // 3. React state를 이 '새로운' 마커 하나만 갖도록 업데이트합니다.
        setMarkers([newMarker]);

        // 4. 지도 이동 및 확대
        map.setCenter(position);
        map.setLevel(3); // (원하시는 확대 레벨로 설정)

        // 5. '새로운' 마커에 커스텀 인포윈도우를 띄웁니다.
        const content = createInfoWindowContent(place); 
        infowindow.current.setContent(content);
        infowindow.current.open(map, newMarker);

        // 6. 이 '새로운' 마커에도 '마커 클릭 이벤트'를 추가해줍니다.
        window.kakao.maps.event.addListener(newMarker, 'click', () => {
             // 다른 마커가 없으므로, 그냥 인포윈도우만 띄웁니다.
             const content = createInfoWindowContent(place);
             infowindow.current.setContent(content);
             infowindow.current.open(map, newMarker);
             map.panTo(position);
        });

        // 7. 검색 목록을 숨깁니다.
        setPlaces([]);
    };

    return (
        <div className="map-search-wrapper">
            <div className="search-form-container">
                <form onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        value={keyword} 
                        onChange={(e) => setKeyword(e.target.value)} 
                        placeholder="장소, 주소 검색" 
                    />
                    <button type="submit">검색</button>
                </form>
            </div>
            
            <div 
                id="map" 
                ref={mapContainer}
                className='map-placeholder'
            ></div>

            {places.length > 0 && (
                <div className="search-results-container">
                    <ul id="placesList">
                        {places.map((place, index) => (
                            <li key={index} onClick={() => handlePlaceClick(place)} className="place-item">
                                <div className="info">
                                    <span className="place-name">{place.place_name}</span>
                                    {place.road_address_name ? (
                                        <span className="address">{place.road_address_name}</span>
                                    ) : (
                                        <span className="address">{place.address_name}</span>
                                    )}
                                    <span className="tel">{place.phone}</span>
                                </div> 
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Map;