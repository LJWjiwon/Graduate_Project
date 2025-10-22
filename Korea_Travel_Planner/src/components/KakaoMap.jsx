import React, { useEffect, useRef, useState, useCallback } from 'react';
import './KakaoMap.css'; 
import { KAKAO_APP_KEY } from '../api/config.js';

const Map = ({ onAddPlace }) => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    const placesService = useRef(null);
    const infowindow = useRef(null);
    
    // [신규] Geocoder(주소 변환) 서비스를 위한 ref
    const geocoder = useRef(null); 

    const [keyword, setKeyword] = useState('');
    const [places, setPlaces] = useState([]);
    const [markers, setMarkers] = useState([]);

    // [useCallback 적용]
    const handleShowDetail = useCallback((place) => {
        if (place.place_url) {
            window.open(place.place_url, '_blank');
        } else {
            alert('상세보기 URL이 제공되지 않는 장소입니다.');
        }
    }, []);

    // [useCallback 적용] '장소 추가' 버튼 클릭 시
    const handleAddPlace = useCallback((place) => {
        // alert(`'${place.place_name}' 장소를 추가합니다.`); // <-- 이 줄은 주석 처리
        // console.log('추가할 장소:', place);
        
        // [수정] 부모로부터 받은 onAddPlace 함수가 있는지 확인하고 호출
        if (onAddPlace) {
            onAddPlace(place);
        } else {
            // prop이 전달되지 않았을 경우의 예외 처리
            console.error("onAddPlace prop이 전달되지 않았습니다.");
            alert("장소를 추가할 수 없습니다.");
        }

    }, [onAddPlace]); // <-- [수정] 의존성 배열에 onAddPlace 추가

    // [useCallback 적용] 인포윈도우 (이름, 주소, 번호, 버튼 모두 포함)
    // (이전 코드의 createAddressInfoWindowContent 함수는 삭제)
    const createInfoWindowContent = useCallback((place) => {
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

        if (place.place_url) {
            const btnDetail = document.createElement('button');
            btnDetail.className = 'infowindow-btn btn-detail';
            btnDetail.innerHTML = '상세보기';
            btnDetail.onclick = () => handleShowDetail(place); 
            buttons.appendChild(btnDetail);
        }

        const btnAdd = document.createElement('button');
        btnAdd.className = 'infowindow-btn btn-add';
        btnAdd.innerHTML = '장소 추가';
        btnAdd.onclick = () => handleAddPlace(place); 
        buttons.appendChild(btnAdd);

        if (!place.place_url) {
            buttons.style.justifyContent = 'flex-end';
        }

        wrapper.appendChild(buttons);

        return wrapper;
    }, [handleShowDetail, handleAddPlace]);


    // [수정] useEffect
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
                    geocoder.current = new window.kakao.maps.services.Geocoder(); 
                    infowindow.current = new window.kakao.maps.InfoWindow({ 
                        zIndex: 1,
                        disableAutoPan: true 
                    });

                    // --- [핵심 수정] 지도 클릭 이벤트 (2단계 검색) ---
                    window.kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
                        
                        const latLng = mouseEvent.latLng; 
                        infowindow.current.close();
                        setPlaces([]); 

                        // 1단계: 좌표 -> 주소 변환
                        geocoder.current.coord2Address(latLng.getLng(), latLng.getLat(), (result, status) => {
                            
                            // 1단계 실패 시
                            if (status !== window.kakao.maps.services.Status.OK) {
                                alert('클릭한 위치의 주소 정보를 가져올 수 없습니다.');
                                setMarkers(current => { // 마커 클리어
                                    current.forEach(m => m.setMap(null));
                                    return [];
                                });
                                return;
                            }
                            
                            // 1단계 성공 -> 주소 획득
                            const addressName = result[0].road_address 
                                ? result[0].road_address.address_name 
                                : result[0].address.address_name;

                            // 2단계: 주소 -> 장소 검색 (Places 서비스)
                            placesService.current.keywordSearch(addressName, (data, status) => {
                                
                                // 2단계 실패 시
                                if (status !== window.kakao.maps.services.Status.OK || data.length === 0) {
                                    alert('클릭한 위치의 장소 정보를 찾지 못했습니다.');
                                    setMarkers(current => { // 마커 클리어
                                        current.forEach(m => m.setMap(null));
                                        return [];
                                    });
                                    return;
                                }

                                // 2단계 성공 -> 'place' 객체 획득!
                                const place = data[0]; 

                                // 새 마커 생성
                                const newMarker = new window.kakao.maps.Marker({
                                    position: latLng, // 클릭한 위치에 마커 생성
                                    map: map
                                });

                                // [수정] 'place' 객체로 '풀 버전' 인포윈도우 생성
                                const content = createInfoWindowContent(place);
                                infowindow.current.setContent(content);
                                infowindow.current.open(map, newMarker);

                                // 마커에 클릭 이벤트 추가
                                window.kakao.maps.event.addListener(newMarker, 'click', function() {
                                    infowindow.current.setContent(content);
                                    infowindow.current.open(map, newMarker);
                                });

                                // 마커 state 업데이트
                                setMarkers(current => {
                                    current.forEach(m => m.setMap(null));
                                    return [newMarker];
                                });
                                map.panTo(latLng);
                            });
                        });
                    });
                    // ---------------------------------------------

                    setTimeout(() => {
                        map.relayout();
                    }, 0);
                }
            });
        };

        loadKakaoMapScript();
    }, [createInfoWindowContent]); // <-- createInfoWindowContent를 의존성 배열에 추가 (ESLint 경고 및 버그 수정)


    // [useCallback 적용] handleSearch
    const handleSearch = useCallback((e) => {
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

                    window.kakao.maps.event.addListener(marker, 'click', () => {
                        
                        setMarkers(currentMarkers => {
                            currentMarkers.forEach(m => m.setMap(null));
                            marker.setMap(mapInstance.current);
                            return [marker]; 
                        });
                        
                        // [수정] createInfoWindowContent 호출 (버그 수정)
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
    }, [keyword, markers, createInfoWindowContent]); // 의존성 배열


    // [useCallback 적용] handlePlaceClick (검색 목록 클릭)
    const handlePlaceClick = useCallback((place) => {
        const map = mapInstance.current;
        const position = new window.kakao.maps.LatLng(place.y, place.x);

        markers.forEach(marker => marker.setMap(null));

        const newMarker = new window.kakao.maps.Marker({
            map: map,
            position: position,
        });

        setMarkers([newMarker]);
        map.setCenter(position);
        map.setLevel(4); 

        // [수정] createInfoWindowContent 호출 (버그 수정)
        const content = createInfoWindowContent(place); 
        infowindow.current.setContent(content);
        infowindow.current.open(map, newMarker);

        window.kakao.maps.event.addListener(newMarker, 'click', () => {
             const content = createInfoWindowContent(place);
             infowindow.current.setContent(content);
             infowindow.current.open(map, newMarker);
             map.panTo(position);
        });

        setPlaces([]);
    }, [markers, createInfoWindowContent]); // 의존성 배열

    // JSX (반환값)
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