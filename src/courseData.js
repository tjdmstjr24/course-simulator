/**
 * 개설 과목·시기: 「과목 선택 안내문」(2025·2026학년도 신입생) 표1·표2의 개설 목록·필수(파란) 표기와 정합. 2학년은 편성표 학생자율 블록 병행.
 * type: 'art' | 4 | 3
 */
export const CURRICULUM_DOC_NOTICE = {
  revisionLabel: '자료 기준: 과목 선택 안내문(2025·2026학년도 신입생) + 편성표(0423)',
  bullets: [
    '1학년은 공통·학교지정 과목을 이수하고, 시뮬레이터에서는 안내문 표2에 맞춰 2학년·3학년 선택 과목을 학기별로 설계합니다.',
    '교과 이수 174학점 + 창의적 체험활동 18학점 = 192학점. 사상고 졸업 인정은 학교자율적 교육과정 주간 등을 포함해 195학점 안내됨.',
    '국어·수학·영어 교과 합계는 최대 81학점까지(안내문·편성표 참고과목 상 한도).',
    '2학년 각 학기: 4학점 선택군 3과목 + 3학점 선택군 4과목(합 24학점). 3학년 1학기 동일 / 2학기는 3학점군 최대 3과목(합 21학점).',
    '실제 개설·반 편성·예술·제2외국어 교차 이수는 학년도별 편성표 및 교과위 결정에 따름.',
  ],
}

export const COURSES = [
  // 2-1 — 안내문 표1(4학점)·표2(3학점 4과목) 개설 목록 (1학년이 고를 2학년 1학기)
  { id: '21-4-01', grade: 2, sem: 1, type: 4, name: '문학', credits: 4, rec: ['human', 'all'] },
  { id: '21-4-02', grade: 2, sem: 1, type: 4, name: '대수', credits: 4, rec: ['engineering', 'business', 'all'] },
  { id: '21-4-03', grade: 2, sem: 1, type: 4, name: '영어Ⅰ', credits: 4, rec: ['all'] },
  { id: '21-3-01', grade: 2, sem: 1, type: 3, name: '확률과 통계', credits: 3, rec: ['engineering', 'business', 'all'] },
  { id: '21-3-02', grade: 2, sem: 1, type: 3, name: '세계사', credits: 3, rec: ['human', 'all'] },
  { id: '21-3-03', grade: 2, sem: 1, type: 3, name: '현대사회와 윤리', credits: 3, rec: ['human', 'all'] },
  { id: '21-3-04', grade: 2, sem: 1, type: 3, name: '사회와 문화', credits: 3, rec: ['human', 'all'] },
  { id: '21-3-05', grade: 2, sem: 1, type: 3, name: '여행지리', credits: 3, rec: ['human', 'all'] },
  { id: '21-3-06', grade: 2, sem: 1, type: 3, name: '물리학', credits: 3, rec: ['engineering', 'medical', 'all'] },
  { id: '21-3-07', grade: 2, sem: 1, type: 3, name: '화학', credits: 3, rec: ['medical', 'engineering', 'all'] },
  { id: '21-3-08', grade: 2, sem: 1, type: 3, name: '생명과학', credits: 3, rec: ['medical', 'all'] },
  { id: '21-3-09', grade: 2, sem: 1, type: 3, name: '지구과학', credits: 3, rec: ['engineering', 'medical', 'all'] },
  { id: '21-3-10', grade: 2, sem: 1, type: 3, name: '프로그래밍', credits: 3, rec: ['engineering', 'all'], isLiberal: true },
  { id: '21-3-11', grade: 2, sem: 1, type: 3, name: '일본어Ⅰ', credits: 3, rec: ['human', 'all'], isLiberal: true },
  { id: '21-a-1', grade: 2, sem: 1, type: 'art', name: '음악 감상과 비평', credits: 3, rec: ['all'] },
  { id: '21-a-2', grade: 2, sem: 1, type: 'art', name: '미술 감상과 비평', credits: 3, rec: ['all'] },

  // 2-2 — 안내문 표1·표2 (1학년이 고를 2학년 2학기)
  { id: '22-4-01', grade: 2, sem: 2, type: 4, name: '화법과 언어', credits: 4, rec: ['human', 'all'] },
  { id: '22-4-02', grade: 2, sem: 2, type: 4, name: '미적분Ⅰ', credits: 4, rec: ['engineering', 'medical', 'all'], req: ['대수'] },
  { id: '22-4-03', grade: 2, sem: 2, type: 4, name: '영어Ⅱ', credits: 4, rec: ['all'] },
  { id: '22-3-01', grade: 2, sem: 2, type: 3, name: '기하', credits: 3, rec: ['engineering', 'medical', 'all'] },
  { id: '22-3-02', grade: 2, sem: 2, type: 3, name: '윤리와 사상', credits: 3, rec: ['human', 'all'] },
  { id: '22-3-03', grade: 2, sem: 2, type: 3, name: '경제', credits: 3, rec: ['business', 'human', 'all'] },
  { id: '22-3-04', grade: 2, sem: 2, type: 3, name: '정치', credits: 3, rec: ['human', 'business', 'all'] },
  { id: '22-3-05', grade: 2, sem: 2, type: 3, name: '세계시민과 지리', credits: 3, rec: ['human', 'all'] },
  { id: '22-3-06', grade: 2, sem: 2, type: 3, name: '역사로 탐구하는 현대 세계', credits: 3, rec: ['human', 'all'] },
  { id: '22-3-07', grade: 2, sem: 2, type: 3, name: '역학과 에너지', credits: 3, rec: ['engineering', 'medical', 'all'] },
  { id: '22-3-08', grade: 2, sem: 2, type: 3, name: '물질과 에너지', credits: 3, rec: ['engineering', 'medical', 'all'] },
  { id: '22-3-09', grade: 2, sem: 2, type: 3, name: '세포와 물질대사', credits: 3, rec: ['medical', 'all'] },
  { id: '22-3-11', grade: 2, sem: 2, type: 3, name: '지구시스템과학', credits: 3, rec: ['engineering', 'medical', 'all'] },
  { id: '22-3-12', grade: 2, sem: 2, type: 3, name: '인공지능 기초', credits: 3, rec: ['engineering', 'all'], isLiberal: true },
  { id: '22-3-13', grade: 2, sem: 2, type: 3, name: '교육의 이해', credits: 3, rec: ['human', 'all'], isLiberal: true },
  { id: '22-a-1', grade: 2, sem: 2, type: 'art', name: '음악 연주와 창작', credits: 3, rec: ['all'] },
  { id: '22-a-2', grade: 2, sem: 2, type: 'art', name: '미술 창작', credits: 3, rec: ['all'] },

  // 3-1 — 안내문 표1: 4학점 수능·대비(국·수·영). 파란 필수는 App.jsx BLUE_REQUIRED_BY_TAB
  { id: '31-4-01', grade: 3, sem: 1, type: 4, name: '독서와 작문', credits: 4, rec: ['human', 'all'] },
  { id: '31-4-02', grade: 3, sem: 1, type: 4, name: '수학 과제 탐구', credits: 4, rec: ['engineering', 'all'] },
  { id: '31-4-03', grade: 3, sem: 1, type: 4, name: '영어 독해와 작문', credits: 4, rec: ['all'] },

  // 3-1 — 안내문 표2: 3학점 선택(4과목) 개설 목록
  { id: '31-3-01', grade: 3, sem: 1, type: 3, name: '문학과 영상', credits: 3, rec: ['human', 'all'] },
  { id: '31-3-02', grade: 3, sem: 1, type: 3, name: '미적분Ⅱ', credits: 3, rec: ['engineering', 'medical', 'all'], req: ['대수', '미적분Ⅰ'] },
  { id: '31-3-03', grade: 3, sem: 1, type: 3, name: '실용 통계', credits: 3, rec: ['engineering', 'business', 'all'] },
  { id: '31-3-04', grade: 3, sem: 1, type: 3, name: '영미 문학 읽기', credits: 3, rec: ['human', 'all'] },
  { id: '31-3-05', grade: 3, sem: 1, type: 3, name: '운동과 건강', credits: 3, rec: ['all'] },
  { id: '31-3-06', grade: 3, sem: 1, type: 3, name: '동아시아 역사 기행', credits: 3, rec: ['human', 'all'] },
  { id: '31-3-07', grade: 3, sem: 1, type: 3, name: '인문학과 윤리', credits: 3, rec: ['human', 'all'] },
  { id: '31-3-08', grade: 3, sem: 1, type: 3, name: '법과 사회', credits: 3, rec: ['human', 'business', 'all'] },
  { id: '31-3-09', grade: 3, sem: 1, type: 3, name: '한국지리 탐구', credits: 3, rec: ['human', 'all'] },
  { id: '31-3-10', grade: 3, sem: 1, type: 3, name: '사회문제 탐구', credits: 3, rec: ['human', 'all'] },
  { id: '31-3-11', grade: 3, sem: 1, type: 3, name: '기후변화와 지속가능한 세계', credits: 3, rec: ['human', 'medical', 'all'] },
  { id: '31-3-12', grade: 3, sem: 1, type: 3, name: '전자기와 양자', credits: 3, rec: ['engineering', 'medical', 'all'] },
  { id: '31-3-13', grade: 3, sem: 1, type: 3, name: '화학 반응의 세계', credits: 3, rec: ['medical', 'engineering', 'all'] },
  { id: '31-3-14', grade: 3, sem: 1, type: 3, name: '생물의 유전', credits: 3, rec: ['medical', 'all'] },
  { id: '31-3-15', grade: 3, sem: 1, type: 3, name: '행성우주과학', credits: 3, rec: ['engineering', 'medical', 'all'] },
  { id: '31-3-16', grade: 3, sem: 1, type: 3, name: '기후변화와 환경생태', credits: 3, rec: ['medical', 'human', 'all'] },
  { id: '31-3-17', grade: 3, sem: 1, type: 3, name: '데이터 과학', credits: 3, rec: ['engineering', 'all'], isLiberal: true },
  { id: '31-3-18', grade: 3, sem: 1, type: 3, name: '일본어 독해와 작문 Ⅰ', credits: 3, rec: ['human', 'all'], isLiberal: true },
  { id: '31-3-19', grade: 3, sem: 1, type: 3, name: '교육의 이해', credits: 3, rec: ['human', 'all'], isLiberal: true },
  { id: '31-3-20', grade: 3, sem: 1, type: 3, name: '보건', credits: 3, rec: ['medical', 'all'], isLiberal: true },
  { id: '31-3-21', grade: 3, sem: 1, type: 3, name: '생태와 환경', credits: 3, rec: ['human', 'medical', 'all'], isLiberal: true },

  // 3-2 — 안내문 표1: 4학점 수능·대비(국·수·영)
  { id: '32-4-01', grade: 3, sem: 2, type: 4, name: '독서 토론과 글쓰기', credits: 4, rec: ['human', 'all'] },
  { id: '32-4-02', grade: 3, sem: 2, type: 4, name: '전문 수학', credits: 4, rec: ['engineering', 'medical', 'all'] },
  { id: '32-4-03', grade: 3, sem: 2, type: 4, name: '심화 영어', credits: 4, rec: ['all'] },

  // 3-2 — 안내문 표2: 3학점 선택(3과목) + 필수(파란)
  { id: '32-3-01', grade: 3, sem: 2, type: 3, name: '윤리 문제 탐구', credits: 3, rec: ['human', 'all'] },
  { id: '32-3-02', grade: 3, sem: 2, type: 3, name: '과학의 역사와 문화', credits: 3, rec: ['human', 'medical', 'all'] },
  { id: '32-3-03', grade: 3, sem: 2, type: 3, name: '실용 통계', credits: 3, rec: ['engineering', 'business', 'all'] },
  { id: '32-3-04', grade: 3, sem: 2, type: 3, name: '영미 문학 읽기', credits: 3, rec: ['human', 'all'] },
  { id: '32-3-05', grade: 3, sem: 2, type: 3, name: '기초 체육 전공 실기', credits: 3, rec: ['all'] },
  { id: '32-3-06', grade: 3, sem: 2, type: 3, name: '물리학 실험', credits: 3, rec: ['engineering', 'medical', 'all'] },
  { id: '32-3-07', grade: 3, sem: 2, type: 3, name: '화학 실험', credits: 3, rec: ['medical', 'engineering', 'all'] },
  { id: '32-3-08', grade: 3, sem: 2, type: 3, name: '생명과학 실험', credits: 3, rec: ['medical', 'all'] },
  { id: '32-3-09', grade: 3, sem: 2, type: 3, name: '지구과학 실험', credits: 3, rec: ['engineering', 'medical', 'all'] },
  { id: '32-3-10', grade: 3, sem: 2, type: 3, name: '정보 과학', credits: 3, rec: ['engineering', 'all'], isLiberal: true },
  { id: '32-3-11', grade: 3, sem: 2, type: 3, name: '일본어 문화', credits: 3, rec: ['human', 'all'], isLiberal: true },
  { id: '32-3-12', grade: 3, sem: 2, type: 3, name: '인간과 철학', credits: 3, rec: ['human', 'all'], isLiberal: true },
  { id: '32-3-13', grade: 3, sem: 2, type: 3, name: '논술', credits: 3, rec: ['human', 'all'], isLiberal: true },
  { id: '32-3-14', grade: 3, sem: 2, type: 3, name: '인간과 심리', credits: 3, rec: ['medical', 'human', 'all'], isLiberal: true },
]

export const MANDATORY = {
  '2-1': [
    { name: '스포츠 생활1', credits: 2 },
    { name: '주제 탐구(R&E) 기초', credits: 1 },
  ],
  '2-2': [
    { name: '스포츠 생활2', credits: 2 },
    { name: '주제 탐구(R&E) 심화', credits: 1 },
  ],
  '3-1': [{ name: '스포츠 문화', credits: 1 }],
  '3-2': [{ name: '스포츠 과학', credits: 1 }],
}
