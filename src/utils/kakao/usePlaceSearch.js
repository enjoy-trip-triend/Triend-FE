import { ref, reactive, createApp, h } from 'vue'
import PlaceInfoWindow from '@/components/common/PlaceInfoWindow.vue'
import { useMemberStore } from '@/stores/member'

export function usePlaceSearch(map, onPlannerClick, router) {
  const memberStore = useMemberStore()

  const markers = reactive([])
  const overlaysMap = reactive({})
  const currentOverlay = ref(null)
  const currentMarker = ref(null)
  const geocoder = new window.kakao.maps.services.Geocoder()
  const places = ref([])

  async function registerHotPlace({ kakaoId, lat, lon, locationName, address }) {
    if (!memberStore.isLoggedIn) {
      alert('로그인 후 이용 가능한 기능입니다.')
      router.push({ name: 'LoginView' })
      return
    }
    window.openMyPlaceModal?.({ kakaoId, lat, lon, locationName, address })
  }

  function clearMarkers() {
    markers.forEach((m) => m.setMap(null))
    markers.splice(0, markers.length)
    Object.values(overlaysMap).forEach((o) => o.setMap(null))
    for (const k in overlaysMap) delete overlaysMap[k]
    currentOverlay.value = null
    places.value = []
  }

  function createOverlay(place, marker) {
    // 이전에 있던 HTML 생성 로직 대신 Vue 컴포넌트로
    const container = document.createElement('div')
    const overlay = new window.kakao.maps.CustomOverlay({
      content: container,
      position: marker.getPosition(),
      xAnchor: 0.5,
      yAnchor: 1.3  // 마커 바로 위에 떠 있도록
    })

    // mount Vue 컴포넌트
    createApp({
      render: () =>
        h(PlaceInfoWindow, {
          place,
          onClose: () => {overlay.setMap(null), currentMarker.value?.setMap(null)},
          onHeart: () => registerHotPlace({
            kakaoId: place.id,
            lat: place.y,
            lon: place.x,
            locationName: place.place_name,
            address: place.road_address_name || place.address_name,
          }),
          onPlan:  () => onPlannerClick(
            place.place_url, place.place_name,
            place.road_address_name || place.address_name,
            place.x, place.y
          )
        })
    }).mount(container)

    return overlay
  }

  function displayMarker(place, index) {
    console.log('[usePlaceSearch] displayMarker 호출', { place, index, map })
    const imageSrc =
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png'
    const imageSize = new window.kakao.maps.Size(36, 37)
    const imgOptions = {
      spriteSize: new window.kakao.maps.Size(36, 691),
      spriteOrigin: new window.kakao.maps.Point(0, index * 46 + 10),
      offset: new window.kakao.maps.Point(13, 37),
    }
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions)

    const marker = new window.kakao.maps.Marker({
      map,
      position: new window.kakao.maps.LatLng(place.y, place.x),
      image: markerImage,
    })
    markers.push(marker)

    const overlay = createOverlay(place, marker, index)

    window.kakao.maps.event.addListener(marker, 'click', () => {
      if (currentOverlay.value) currentOverlay.value.setMap(null)

      // ✅ 줌인 추가
      map.setLevel(3)
      map.panTo(marker.getPosition())

      overlay.setMap(map)
      currentOverlay.value = overlay
    })

    overlaysMap[`overlay-${index}`] = overlay
    map.setCenter(new window.kakao.maps.LatLng(place.y, place.x))
  }

  function renderPlaceList() {
    const listEl = document.getElementById('placesList')
    if (!listEl) return
    listEl.innerHTML = ''
    const fragment = document.createDocumentFragment()
    places.value.forEach((place, index) => {
      const el = document.createElement('li')
      el.className = 'place-item'
      el.innerHTML = `
        <div style="display:flex; gap:10px; align-items:flex-start;">
          <span style="font-size:16px; font-weight:bold; color:#4a90e2;">${index + 1}</span>
          <div>
            <h5 style="margin: 0; font-size:15px; color:#333;">${place.place_name}</h5>
            <p style="margin: 2px 0; font-size:13px; color:#666;">${place.road_address_name || place.address_name || ''}</p>
            <p style="margin: 0; font-size:13px; color:#009688;">${place.phone || ''}</p>
          </div>
        </div>
      `
      el.style.padding = '10px 12px'
      el.style.borderBottom = '1px solid #eee'
      el.style.cursor = 'pointer'
      el.addEventListener('click', () => {
        const latlng = new window.kakao.maps.LatLng(place.y, place.x)
        map.panTo(latlng)
        if (currentOverlay.value) currentOverlay.value.setMap(null)
        const overlay = overlaysMap[`overlay-${index}`]
        overlay.setMap(map)
        currentOverlay.value = overlay
      })
      fragment.appendChild(el)
    })
    listEl.appendChild(fragment)
  }

  function searchPlaces(keyword) {
    if (!keyword.trim()) {
      alert('검색어를 입력해주세요!')
      return
    }
    clearMarkers() // 🔁 기존 마커 제거
    const ps = new window.kakao.maps.services.Places()
    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const bounds = new window.kakao.maps.LatLngBounds()
        places.value = data
        data.forEach((place, index) => {
          displayMarker(place, index)
          bounds.extend(new window.kakao.maps.LatLng(place.y, place.x))
        })
        map.setBounds(bounds)
        renderPlaceList()
      }
    })
  }

  function handleMapClick(mouseLatLng) {
    geocoder.coord2Address(
      mouseLatLng.getLng(),
      mouseLatLng.getLat(),
      (result, status) => {
        if (status !== window.kakao.maps.services.Status.OK) return

        // 기존 오버레이·마커 제거
        currentOverlay.value?.setMap(null)
        currentMarker.value?.setMap(null)

        // 새 마커 생성
        const marker = new window.kakao.maps.Marker({
          position: mouseLatLng,
          map,
        })
        currentMarker.value = marker
        map.panTo(marker.getPosition())

        // 주소·이름 추출
        const detailAddr = result[0].road_address
          ? result[0].road_address.address_name
          : result[0].address.address_name
        let buildingName = result[0].road_address
          ? result[0].road_address.building_name
          : detailAddr
        if (!buildingName) buildingName = detailAddr

        // 1) 클릭 위치에 대한 place 객체 기본값
        const placeBase = {
          id: null,
          place_name:  buildingName,
          place_url:   '',
          road_address_name: detailAddr,
          address_name:      detailAddr,
          category_name:     '',
          phone:             '',
          x: mouseLatLng.getLng(),
          y: mouseLatLng.getLat(),
        }

        // 2) Kakao Places API 로 진짜 place 정보 조회 (ID 포함)
        const ps = new window.kakao.maps.services.Places()
        ps.keywordSearch(buildingName, (data, st) => {
          const place = { ...placeBase }
          if (st === window.kakao.maps.services.Status.OK && data.length > 0) {
            const p = data[0]
            // 얻어온 데이터로 덮어쓰기
            place.id                 = p.id
            place.place_url          = p.place_url
            place.category_name      = p.category_name
            place.phone              = p.phone
            place.road_address_name  = p.road_address_name
            place.address_name       = p.address_name
            place.x                  = p.x
            place.y                  = p.y
          }

          // 3) createOverlay 에 넘겨주면 onHeart 에서 registerHotPlace 가 동작합니다.
          const overlay = createOverlay(place, marker)
          overlay.setMap(map)
          currentOverlay.value = overlay
          overlaysMap[`click-overlay-${Date.now()}`] = overlay
        })

      }
    )
  }

  function searchAddrFromCoords(coords, callback) {
    geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback)
  }

  return {
    searchPlaces,
    handleMapClick,
    searchAddrFromCoords,
    clearMarkers,
    places,
    displayMarker,
  }
}
