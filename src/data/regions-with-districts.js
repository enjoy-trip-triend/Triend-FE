// src/data/provinces-with-districts.js
// 대한민국 광역시·특별시·자치시 및 도(道)별 시·군 목록
export const provinces = [
  // 광역시·특별시·자치시
  { code: '11', name: '서울특별시', districts: [] },
  { code: '26', name: '부산광역시', districts: [] },
  { code: '27', name: '대구광역시', districts: [] },
  { code: '28', name: '인천광역시', districts: [] },
  { code: '29', name: '광주광역시', districts: [] },
  { code: '30', name: '대전광역시', districts: [] },
  { code: '31', name: '울산광역시', districts: [] },
  { code: '36', name: '세종특별자치시', districts: [] },

  // 경기도
  {
    code: '41', name: '경기도', districts: [
      { code: '41111', name: '수원시 장안구' },
      { code: '41113', name: '수원시 권선구' },
      { code: '41115', name: '수원시 팔달구' },
      { code: '41117', name: '수원시 영통구' },
      { code: '41130', name: '성남시 수정구' },
      { code: '41131', name: '성남시 중원구' },
      { code: '41133', name: '성남시 분당구' },
      { code: '41150', name: '의정부시' },
      { code: '41170', name: '안양시 만안구' },
      { code: '41173', name: '안양시 동안구' },
      { code: '41190', name: '부천시' },
      { code: '41210', name: '광명시' },
      { code: '41220', name: '평택시' },
      { code: '41230', name: '동두천시' },
      { code: '41250', name: '안산시 상록구' },
      { code: '41253', name: '안산시 단원구' },
      { code: '41280', name: '고양시 덕양구' },
      { code: '41285', name: '고양시 일산동구' },
      { code: '41287', name: '고양시 일산서구' },
      { code: '41310', name: '과천시' },
      { code: '41360', name: '구리시' },
      { code: '41370', name: '남양주시' },
      { code: '41390', name: '오산시' },
      { code: '41410', name: '시흥시' },
      { code: '41430', name: '군포시' },
      { code: '41450', name: '의왕시' },
      { code: '41460', name: '하남시' },
      { code: '41480', name: '용인시 처인구' },
      { code: '41482', name: '용인시 기흥구' },
      { code: '41484', name: '용인시 수지구' },
      { code: '41500', name: '파주시' },
      { code: '41550', name: '이천시' },
      { code: '41570', name: '안성시' },
      { code: '41610', name: '김포시' },
      { code: '41630', name: '화성시' },
      { code: '41650', name: '광주시' },
      { code: '41670', name: '양주시' },
      { code: '41690', name: '포천시' },
      { code: '41710', name: '여주시' },
      { code: '41730', name: '연천군' },
      { code: '41750', name: '가평군' },
      { code: '41770', name: '양평군' }
    ]
  },

  // 강원도
  {
    code: '42', name: '강원도', districts: [
      { code: '42110', name: '춘천시' },
      { code: '42130', name: '원주시' },
      { code: '42150', name: '강릉시' },
      { code: '42170', name: '동해시' },
      { code: '42190', name: '태백시' },
      { code: '42210', name: '속초시' },
      { code: '42230', name: '삼척시' },
      { code: '42710', name: '홍천군' },
      { code: '42720', name: '횡성군' },
      { code: '42730', name: '영월군' },
      { code: '42740', name: '평창군' },
      { code: '42750', name: '정선군' },
      { code: '42760', name: '철원군' },
      { code: '42770', name: '화천군' },
      { code: '42780', name: '양구군' },
      { code: '42790', name: '인제군' },
      { code: '42800', name: '고성군' },
      { code: '42810', name: '양양군' }
    ]
  },

  // 충청북도
  {
    code: '43', name: '충청북도', districts: [
      { code: '43110', name: '청주시 상당구' },
      { code: '43112', name: '청주시 흥덕구' },
      { code: '43113', name: '청주시 서원구' },
      { code: '43114', name: '청주시 청원구' },
      { code: '43120', name: '충주시' },
      { code: '43130', name: '제천시' },
      { code: '43170', name: '증평군' },
      { code: '43190', name: '진천군' },
      { code: '43200', name: '음성군' },
      { code: '43220', name: '괴산군' },
      { code: '43230', name: '보은군' },
      { code: '43250', name: '옥천군' },
      { code: '43270', name: '영동군' },
      { code: '43280', name: '단양군' }
    ]
  },

  // 충청남도
  {
    code: '44', name: '충청남도', districts: [
      { code: '44131', name: '천안시 동남구' },
      { code: '44133', name: '천안시 서북구' },
      { code: '44150', name: '공주시' },
      { code: '44160', name: '보령시' },
      { code: '44170', name: '아산시' },
      { code: '44180', name: '서산시' },
      { code: '44190', name: '논산시' },
      { code: '44200', name: '계룡시' },
      { code: '44210', name: '당진시' },
      { code: '44230', name: '금산군' },
      { code: '44250', name: '부여군' },
      { code: '44260', name: '서천군' },
      { code: '44280', name: '청양군' },
      { code: '44300', name: '홍성군' },
      { code: '44320', name: '예산군' },
      { code: '44330', name: '태안군' }
    ]
  },

  // 전라북도
  {
    code: '45', name: '전라북도', districts: [
      { code: '45110', name: '전주시 완산구' },
      { code: '45112', name: '전주시 덕진구' },
      { code: '45130', name: '군산시' },
      { code: '45150', name: '익산시' },
      { code: '45170', name: '정읍시' },
      { code: '45190', name: '남원시' },
      { code: '45210', name: '김제시' },
      { code: '45230', name: '완주군' },
      { code: '45250', name: '진안군' },
      { code: '45270', name: '무주군' },
      { code: '45290', name: '장수군' },
      { code: '45310', name: '임실군' },
      { code: '45330', name: '순창군' },
      { code: '45350', name: '고창군' },
      { code: '45370', name: '부안군' }
    ]
  },

  // 전라남도
  {
    code: '46',
    name: '전라남도',
    districts: [
      { code: '46110', name: '목포시' },
      { code: '46130', name: '여수시' },
      { code: '46150', name: '순천시' },
      { code: '46170', name: '나주시' },
      { code: '46210', name: '광양시' },
      { code: '46230', name: '담양군' },
      { code: '46250', name: '곡성군' },
      { code: '46270', name: '구례군' },
      { code: '46290', name: '고흥군' },
      { code: '46310', name: '보성군' },
      { code: '46330', name: '화순군' },
      { code: '46350', name: '장흥군' },
      { code: '46370', name: '강진군' },
      { code: '46390', name: '해남군' },
      { code: '46410', name: '영암군' },
      { code: '46430', name: '무안군' },
      { code: '46450', name: '함평군' },
      { code: '46470', name: '영광군' },
      { code: '46490', name: '장성군' },
      { code: '46510', name: '완도군' },
      { code: '46530', name: '진도군' },
      { code: '46550', name: '신안군' }
    ]
  },
    {
    code: '47',
    name: '경상북도',
    districts: [
      { code: '27170', name: '포항시 남구' },
      { code: '27140', name: '포항시 북구' },
      { code: '27200', name: '경주시' },
      { code: '27230', name: '김천시' },
      { code: '27260', name: '안동시' },
      { code: '27110', name: '구미시' },
      { code: '27290', name: '영주시' },
      { code: '27290', name: '영천시' },
      { code: '27310', name: '경산시' },
      { code: '27720', name: '군위군' },
      { code: '27730', name: '의성군' },
      { code: '27810', name: '청송군' },
      { code: '27820', name: '영양군' },
      { code: '27830', name: '영덕군' },
      { code: '27840', name: '청도군' },
      { code: '27700', name: '고령군' },
      { code: '27650', name: '성주군' },
      { code: '27610', name: '칠곡군' },
      { code: '27930', name: '봉화군' },
      { code: '27940', name: '울진군' },
      { code: '27950', name: '울릉군' }
    ]
  },
  {
    code: '48',
    name: '경상남도',
    districts: [
      { code: '48111', name: '창원시 의창구' },
      { code: '48113', name: '창원시 성산구' },
      { code: '48115', name: '창원시 마산합포구' },
      { code: '48117', name: '창원시 마산회원구' },
      { code: '48119', name: '창원시 진해구' },
      { code: '48221', name: '진주시' },
      { code: '48231', name: '통영시' },
      { code: '48241', name: '사천시' },
      { code: '48261', name: '김해시' },
      { code: '48310', name: '밀양시' },
      { code: '48330', name: '거제시' },
      { code: '48350', name: '양산시' },
      { code: '48290', name: '의령군' },
      { code: '48280', name: '함안군' },
      { code: '48410', name: '창녕군' },
      { code: '48430', name: '고성군' },
      { code: '48450', name: '남해군' },
      { code: '48470', name: '하동군' },
      { code: '48490', name: '산청군' },
      { code: '48510', name: '함양군' },
      { code: '48530', name: '거창군' },
      { code: '48550', name: '합천군' }
    ]
  }
]
