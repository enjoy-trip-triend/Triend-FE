import axios from 'axios'

const SERVICE_KEY = import.meta.env.VITE_KTO_SERVICE_KEY // ✅ .env에 저장해둔 인증키 사용

export async function searchImage(keyword, size = 3) {
  console.log('검색 키워드: ', keyword)
  try {
    const res = await axios.get(
      'https://apis.data.go.kr/B551011/PhotoGalleryService1/gallerySearchList1',
      {
        params: {
          serviceKey: SERVICE_KEY,
          numOfRows: size,
          pageNo: 1,
          MobileOS: 'ETC',
          MobileApp: 'Triend',
          _type: 'json',
          keyword: keyword, // ✅ 키워드 검색
        },
      },
    )

    const items = res.data?.response?.body?.items?.item || []
    console.log(items)
    // ✅ 필요한 데이터만 정리해서 반환 (이미지 URL만 뽑기)
    return items
      .map((item) => item.galWebImageUrl)
      .filter(Boolean)
      .slice(0, size)
  } catch (err) {
    console.warn('[관광공사 이미지 검색 실패]', err)
    return []
  }
}
