import { useMemo, useState, useEffect } from 'react'
import {
  Check,
  ChevronRight,
  GraduationCap,
  Info,
  Trash2,
  Palette,
  X,
  Save,
  ShoppingBag,
  Search,
} from 'lucide-react'
import { COURSES, MANDATORY, CURRICULUM_DOC_NOTICE } from './courseData.js'

/** 안내문 「수능·탐구 이수 트랙」·계열별 권장 선택 흐름에 맞춘 추천 칩 */
const TRACK_CHIPS = [
  { id: 'all', label: '전체' },
  { id: 'track_kor_soc', label: '인문·국어·사회 심화' },
  { id: 'track_stem', label: '자연·수학·과학 탐구' },
  { id: 'track_eng', label: '공학·정보·AI' },
  { id: 'track_med', label: '의예·생명·보건' },
  { id: 'track_bus', label: '상경·경제·경영' },
]

const TAB_LABELS = {
  '2-1': '2학년 1학기',
  '2-2': '2학년 2학기',
  '3-1': '3학년 1학기',
  '3-2': '3학년 2학기',
}

/** 안내문 「수능 과목 및 수능 대비 과목」표의 4학점 선택 궤적 → 추천은 해당 학기 탭에서만 */
const SUNUNG_PRIMARY_TAB = {
  문학: '2-1',
  '화법과 언어': '2-2',
  '독서와 작문': '3-1',
  '독서 토론과 글쓰기': '3-2',
  대수: '2-1',
  미적분Ⅰ: '2-2',
  '수학 과제 탐구': '3-1',
  '전문 수학': '3-2',
  영어Ⅰ: '2-1',
  영어Ⅱ: '2-2',
  '영어 독해와 작문': '3-1',
  '심화 영어': '3-2',
}

const SUNUNG_KOREAN = new Set(['문학', '화법과 언어', '독서와 작문', '독서 토론과 글쓰기'])
const SUNUNG_MATH = new Set(['대수', '미적분Ⅰ', '수학 과제 탐구', '전문 수학'])
const SUNUNG_ENGLISH = new Set(['영어Ⅰ', '영어Ⅱ', '영어 독해와 작문', '심화 영어'])

const BLUE_REQUIRED_BY_TAB = {
  '2-1': ['문학', '대수', '영어Ⅰ', '확률과 통계'],
  '2-2': ['화법과 언어', '미적분Ⅰ', '영어Ⅱ'],
  /** 안내문 표1 파란(필수): 3-1 국어만(영어는 선택), 3-2는 표2 내 3학점 필수 */
  '3-1': ['독서와 작문'],
  '3-2': ['윤리 문제 탐구', '과학의 역사와 문화'],
}

const AREA_ORDER = [
  '국어',
  '수학',
  '영어',
  '사회',
  '과학',
  '체육',
  '예술',
  '정보/기술',
  '제2외국어/한문',
  '교양',
  '기타',
]

const ENCYCLOPEDIA_AREA_OPTIONS = [{ id: 'all', label: '전체' }, ...AREA_ORDER.map((a) => ({ id: a, label: a }))]

const REC_CAREER_LABELS = {
  human: '인문·국어·사회',
  engineering: '공학·정보',
  medical: '의예·생명',
  business: '상경',
  all: '공통',
}

function careerLineFromRec(rec) {
  if (!rec || !rec.length) return '다양한 진로와 연계해 설계할 수 있는 과목입니다.'
  const parts = [...new Set(rec.map((r) => REC_CAREER_LABELS[r] || r))].filter(Boolean)
  return `${parts.join(' · ')} 계열 흐름과 잘 맞물리는 선택지로 안내됩니다.`
}

function tabKey(course) {
  return `${course.grade}-${course.sem}`
}

/** 편성표·안내문의 계열·이수 트랙(국영수·탐구)에 맞춰 과목에 태그 부여 */
function courseTrackIds(course) {
  const n = course.name
  const ids = new Set()
  if (
    /** '과학의 역사와 문화' 등은 역사 과목이 아님 — 인문·사회 칩에서 제외 */
    !/과학의 역사/.test(n) &&
    /(문학|독서|화법|매체|국어|의사소통|토론|글쓰기|영상|언어생활|한문|철학|심리|종교|논술|윤리|사회|지리|세계사|정치|법과|경제|인문|역사|도시|동아시아|여행지리|사회문제|기후변화와 지속가능|지속가능한 세계|한국지리)/.test(
      n,
    )
  ) {
    ids.add('track_kor_soc')
  }
  if (
    /** '데이터/정보 …과학'은 정보 교과 명칭 — 탐구(STEM) 태그에서는 제외 */
    !/(데이터 과학|정보 과학|정보과학)/.test(n) &&
    /(물리|화학|생명|지구|과학|역학|양자|유전|세포|에너지|천문|행성|실험|전자기|물질|지구시스템|행성우주|과학의 역사|기후변화와환경|화학 반응|생물의)/.test(
      n,
    )
  ) {
    ids.add('track_stem')
  }
  if (
    /(대수|미적분|기하|확률|통계|수학|이산|경제 수학|수학과|인공지능 수학|직무 수학|전문 수학|실용 통계|수학 과제|수학과제)/.test(n)
  ) {
    ids.add('track_stem')
  }
  if (/(영어Ⅰ|영어Ⅱ|영어 독해|심화 영어|미디어 영어|세계 문화와 영어|실생활 영어|직무 영어)/.test(n)) {
    ids.add('track_stem')
  }
  if (
    /(정보|인공지능|프로그래밍|데이터|공학|기술|가정|로봇|영상 제작|창의공학|창의 공학|정보과학|정보 과학|데이터 과학)/.test(n) ||
    /** 공학·정보 진로 연계 탐색: 기초 수리·실험 과학까지 같은 칩에서 추천(2학년 1학기에 정보 단일 과목 보완) */
    /(확률과 통계|물리학|화학|생명과학|지구과학|역학과 에너지|물질과 에너지|세포와 물질대사|지구시스템과학|전자기와 양자|화학 반응의 세계|실험)/.test(
      n,
    )
  ) {
    ids.add('track_eng')
  }
  if (/(보건|생명|세포|유전|의학|화학 반응|생물의|지구과학 실험|생명과학 실험)/.test(n)) {
    ids.add('track_med')
  }
  if (/(경제|금융|경영|스포츠 행정|법과 사회|실용 통계|인간과 경제)/.test(n)) {
    ids.add('track_bus')
  }
  return [...ids]
}

function matchesTrack(course, trackId) {
  if (trackId === 'all') return true
  return courseTrackIds(course).includes(trackId)
}

/** 수능 4학점 궤적 과목은 안내문에 적힌 학기 탭에서만 추천 배지 표시 */
function matchesSunungTab(course, activeTab, trackId) {
  const slot = SUNUNG_PRIMARY_TAB[course.name]
  if (!slot) return true
  if (trackId === 'track_kor_soc' && SUNUNG_KOREAN.has(course.name)) return activeTab === slot
  if (trackId === 'track_stem' && SUNUNG_MATH.has(course.name)) return activeTab === slot
  if (trackId === 'track_stem' && SUNUNG_ENGLISH.has(course.name)) return activeTab === slot
  return true
}

function getMaxThreeCredits(grade, sem) {
  if (grade === 3 && sem === 2) return 3
  return 4
}

function termOrder(grade, sem) {
  return grade * 10 + sem
}

function hasCourseByName(courses, name, maxOrder) {
  return courses.some((c) => c.name === name && termOrder(c.grade, c.sem) <= maxOrder)
}

/** 학교 필수 중 생활·교양(정보·탐구 등) 이수로 안내하는 항목 — 게이지에 반영 */
function countLiberalMandatoryCredits(mandatoryKeys) {
  const liberalMandatoryNames = new Set(['주제 탐구(R&E) 기초', '주제 탐구(R&E) 심화'])
  return mandatoryKeys.reduce((sum, key) => {
    for (const m of MANDATORY[key] || []) {
      if (liberalMandatoryNames.has(m.name)) sum += m.credits
    }
    return sum
  }, 0)
}

function getAreaLabel(name) {
  // '중국어'·'한국어' 등에 포함된 '국어', '인문학' 속 '문학' 오탐 방지 — 국어·영어보다 먼저
  if (/(중국어|일본어|한문|한자|중국 문화|일본 문화)/.test(name)) return '제2외국어/한문'
  if (/(영어|영미 문학)/.test(name)) return '영어'
  const isKoreanLangArea =
    (/문학/.test(name) && !/인문학/.test(name)) ||
    /독서|화법|의사소통|매체/.test(name) ||
    (/국어/.test(name) && !/중국어|한국어/.test(name))
  if (isKoreanLangArea) return '국어'
  if (/(대수|미적분|기하|확률|수학|통계)/.test(name)) return '수학'
  /** 과학 교과 선택·융합(이름 속 ‘역사’가 사회 키워드에 잡히는 것 방지) */
  if (/과학의 역사/.test(name)) return '과학'
  if (
    /(세계사|정치|법과|경제|윤리|사회|지리|한국지리|동아시아|인문학|사회문제|지속가능한 세계|역사|도시|여행지리|현대사회|현대 세계|현대세계)/.test(
      name,
    )
  )
    return '사회'
  /** 정보/기술 브랜치를 과학 브랜치보다 위에 둠 — '데이터 과학'·'정보 과학'·'정보과학'이 '…과학' 패턴에 잡히지 않도록 */
  if (/(정보|인공지능|데이터|프로그래밍|공학|기술·가정|정보과학|정보 과학|로봇|영상 제작|창의공학|창의 공학)/.test(name)) return '정보/기술'
  if (
    /(물리|화학|생명|지구|우주|역학|전자기|과학|세포|물질|에너지|대사|양자|유전|천문|행성|실험|지구시스템|행성우주|반응의 세계|생물의|기후변화와 환경)/.test(
      name,
    )
  )
    return '과학'
  if (/(체육|스포츠|운동)/.test(name)) return '체육'
  if (/(연극|미술|음악|시창|드로잉|조형|색채|디자인)/.test(name)) return '예술'
  if (/(교육의 이해|진로와 직업|보건|생태와 환경|철학|심리|논술|경제활동|삶과 종교)/.test(name))
    return '교양'
  return '기타'
}

function validateAdd(course, cart) {
  const currentOrder = termOrder(course.grade, course.sem)

  if (cart.some((c) => c.name === course.name)) {
    return { ok: false, message: '동일 과목명은 중복 이수할 수 없습니다. (참고사항 반영)' }
  }

  const sameTerm = cart.filter((c) => c.grade === course.grade && c.sem === course.sem)
  if (sameTerm.some((c) => c.id === course.id)) {
    return { ok: false, message: '이미 장바구니에 담긴 과목입니다.' }
  }

  const artCount = sameTerm.filter((c) => c.type === 'art').length + (course.type === 'art' ? 1 : 0)
  if (artCount > 1) {
    return { ok: false, message: '🎨 예술 교과는 학기당 최대 1과목까지 선택할 수 있습니다.' }
  }

  const fourCount = sameTerm.filter((c) => c.type === 4).length + (course.type === 4 ? 1 : 0)
  if (fourCount > 3) {
    return { ok: false, message: '📘 4학점 선택군은 학기당 최대 3과목까지 선택할 수 있습니다.' }
  }

  const maxThree = getMaxThreeCredits(course.grade, course.sem)
  const threeCount = sameTerm.filter((c) => c.type === 3).length + (course.type === 3 ? 1 : 0)
  if (threeCount > maxThree) {
    const suffix =
      course.grade === 3 && course.sem === 2
        ? ' (3학년 2학기는 3학점군 최대 3과목)'
        : ''
    return {
      ok: false,
      message: `🔬 3학점 선택군은 이 학기에 최대 ${maxThree}과목까지 선택할 수 있습니다.${suffix}`,
    }
  }

  return { ok: true }
}

function sortCart(courses) {
  return [...courses].sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade
    if (a.sem !== b.sem) return a.sem - b.sem
    return a.name.localeCompare(b.name, 'ko')
  })
}

const MAIN_TABS = [
  { id: 'guide', emoji: '📘', label: '가이드' },
  { id: 'encyclopedia', emoji: '🔍', label: '과목 안내' },
  { id: 'simulator', emoji: '🎮', label: '시뮬레이션' },
]

function AppTopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3.5 sm:px-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
          <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">사상고등학교</p>
          <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">고교학점제 플래너</h1>
        </div>
      </div>
    </header>
  )
}

function MainTabNav({ value, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/95 shadow-[0_-6px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      aria-label="주요 탭"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 pt-2">
        {MAIN_TABS.map((tab) => {
          const active = value === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 transition-all duration-300 ease-in-out ${
                active
                  ? 'bg-indigo-50 text-indigo-700 shadow-inner shadow-indigo-100/80'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <span className="text-xl leading-none" aria-hidden>
                {tab.emoji}
              </span>
              <span className={`text-[11px] font-bold ${active ? 'text-indigo-700' : 'text-slate-500'}`}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function GuideTabContent({ onGoSimulator }) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-sm font-semibold text-indigo-600">사상고등학교</p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">핵심 규칙</h2>
      <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-slate-500">
        안내문·편성표 기준으로 정리했습니다. 하단 <strong className="font-bold text-slate-800">시뮬레이션</strong>에서 연도를 고른 뒤
        설계를 시작하세요.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md shadow-slate-200/40 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
          <p className="text-xs font-bold text-indigo-600">생활·교양</p>
          <p className="mt-2 text-3xl font-extrabold tabular-nums text-slate-900">16</p>
          <p className="mt-1 text-sm font-bold text-slate-800">학점 이수</p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
            기술·가정, 정보, 제2외국어, 교양 영역에서 졸업 전까지 총 16학점을 채워야 합니다. 시뮬레이터 대시보드에서 진행률을 확인할 수 있습니다.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md shadow-slate-200/40 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
          <p className="text-xs font-bold text-indigo-600">학기당 선택</p>
          <p className="mt-2 text-lg font-extrabold leading-snug text-slate-900">4학점 3과목 + 3학점 4과목</p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
            2학년·3학년 1학기 기준(3학년 2학기는 3학점군 최대 3과목). 예술은 학기당 1과목까지입니다.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md shadow-slate-200/40 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-bold text-indigo-600">선수 과목</p>
          <p className="mt-2 text-lg font-extrabold text-slate-900">위계를 먼저 확인</p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
            예: 미적분Ⅰ은 대수 이수 후가 원칙입니다. 시뮬레이터에서 선수가 없으면 안내 후에도 담을지 선택할 수 있습니다.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md shadow-slate-200/40 sm:col-span-2 lg:col-span-3">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-indigo-600">졸업 이수</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">교과 174 + 창체 18 = 192학점</p>
              <p className="mt-2 text-sm font-medium text-slate-500">사상고 안내 기준(자율교육과정 주간 등 반영 시 195학점 안내도 참고).</p>
            </div>
            <div className="flex gap-3 text-center">
              <div className="rounded-2xl bg-slate-50 px-5 py-3">
                <p className="text-2xl font-extrabold text-indigo-600">81</p>
                <p className="text-xs font-semibold text-slate-500">국·수·영 상한(참고)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-3xl border border-slate-100 bg-white p-6 shadow-md sm:p-8">
        <h3 className="text-base font-extrabold text-slate-900">한 줄 요약</h3>
        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
          {CURRICULUM_DOC_NOTICE.bullets[0]}
        </p>
        <p className="mt-4 text-xs font-medium text-slate-400">{CURRICULUM_DOC_NOTICE.revisionLabel}</p>
      </div>

      <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onGoSimulator}
          className="inline-flex items-center justify-center gap-2 rounded-3xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-xl"
        >
          시뮬레이션으로 이동
          <ChevronRight className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium text-slate-500">하단 탭에서 🎮 시뮬레이션을 눌러도 됩니다.</p>
      </div>

      <p className="mt-14 text-center text-xs font-medium text-slate-400">
        자료: 과목 선택 안내문·교육과정 편성표 등. 저작권은 사상고등학교에 있습니다.
      </p>
    </div>
  )
}

function SectionHeader({ icon: Icon, emoji, title, subtitle }) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
      {Icon ? (
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" strokeWidth={1.75} />
      ) : (
        <span className="text-xl leading-none">{emoji}</span>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-extrabold tracking-tight text-slate-900">{title}</h3>
        {subtitle ? <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  )
}

const LIBERAL_CAP = 16

function SimulatorDashboard({
  mandatoryKeys,
  sortedCart,
  removeFromCart,
  requiredCourseIdSet,
  totalCredits,
  mandatoryTotalCredits,
  selectedCredits,
  liberalCredits,
  liberalPct,
  liberalDone,
  onSave,
  cartListMaxClass = 'max-h-56',
}) {
  return (
    <div className="space-y-6">
      <details className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-md shadow-slate-200/40 open:shadow-lg">
        <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-extrabold text-slate-900 marker:hidden [&::-webkit-details-marker]:hidden">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Info className="h-4 w-4" strokeWidth={2} />
          </span>
          교육과정 요약 (편성표·안내문)
          <span className="ml-auto text-xs font-semibold text-indigo-600">펼치기</span>
        </summary>
        <ul className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-xs font-medium leading-relaxed text-slate-500">
          {CURRICULUM_DOC_NOTICE.bullets.map((line, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="shrink-0 font-bold text-indigo-500">·</span>
              <span>{line}</span>
            </li>
          ))}
          <li className="flex gap-3">
            <span className="shrink-0 font-bold text-indigo-500">·</span>
            <span>
              동일 과목명 중복 이수 금지, 선수과목(req)은 위계 경고 후에도 담기를 선택할 수 있습니다.
            </span>
          </li>
        </ul>
      </details>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md shadow-slate-200/40">
        <h2 className="mb-5 flex items-center gap-3 text-sm font-extrabold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50">
            <Palette className="h-4 w-4 text-indigo-600" />
          </span>
          학교 필수 과목
        </h2>
        {mandatoryKeys.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-medium leading-relaxed text-slate-500">
            시뮬레이션에서 입학 연도(2026·2025)를 선택하면 학기별 필수 항목이 여기에 표시됩니다.
          </p>
        ) : (
          <div className="space-y-5">
            {mandatoryKeys.map((key) => (
              <div key={key}>
                <p className="mb-2 text-xs font-bold text-indigo-600">{TAB_LABELS[key]}</p>
                <ul className="space-y-2 rounded-2xl bg-slate-50/90 p-4">
                  {(MANDATORY[key] || []).map((m) => (
                    <li key={m.name} className="flex justify-between gap-3 text-xs">
                      <span className="inline-flex min-w-0 items-center gap-2 font-semibold text-slate-800">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="truncate">{m.name}</span>
                      </span>
                      <span className="shrink-0 font-medium text-slate-500">
                        {m.credits > 0 ? `${m.credits}학점` : '편성표 참고'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md shadow-slate-200/40">
        <h2 className="mb-5 text-sm font-extrabold text-slate-900">내가 담은 과목</h2>
        {sortedCart.length === 0 ? (
          <p className="text-sm font-medium text-slate-500">과목을 선택해 보세요.</p>
        ) : (
          <ul className={`space-y-3 overflow-y-auto pr-1 ${cartListMaxClass}`}>
            {sortedCart.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-3 text-xs shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{c.name}</p>
                  <p className="mt-0.5 font-medium text-slate-500">
                    {TAB_LABELS[tabKey(c)]} · {c.credits}학점
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(c.id)}
                  disabled={requiredCourseIdSet.has(c.id)}
                  className={`rounded-xl p-2 transition-all duration-300 ease-in-out ${
                    requiredCourseIdSet.has(c.id)
                      ? 'cursor-not-allowed text-slate-300'
                      : 'text-slate-400 hover:bg-red-50 hover:text-red-600 hover:shadow-sm'
                  }`}
                  aria-label={`${c.name} 제거`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-3xl border border-indigo-500/10 bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-xl shadow-indigo-500/25">
        <p className="text-xs font-semibold tracking-wide text-indigo-100/90">선택 누적 학점</p>
        <p className="mt-2 text-3xl font-extrabold tabular-nums tracking-tight">{totalCredits}</p>
        <p className="mt-3 text-sm font-medium leading-relaxed text-indigo-100/90">
          필수 {mandatoryTotalCredits} + 선택 {selectedCredits}
        </p>

        <div className="mt-6 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-white">
            <span>생활·교양 영역 필수 이수 현황</span>
            <span className="tabular-nums text-indigo-50">
              {liberalCredits}/{LIBERAL_CAP}학점
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-indigo-950/30">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                liberalDone ? 'bg-emerald-400 shadow-sm shadow-emerald-500/40' : 'bg-indigo-300 shadow-sm shadow-indigo-300/50'
              }`}
              style={{ width: `${liberalPct}%` }}
              role="progressbar"
              aria-valuenow={Math.round(liberalPct)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="mt-2 text-xs font-medium leading-snug text-indigo-100/80">
            기술·가정·정보·제2외국어·교양 등(isLiberal) 및 주제 탐구(R&E) 반영
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-bold text-indigo-700 shadow-lg shadow-indigo-950/10 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-xl"
        >
          <Save className="h-4 w-4" />
          최종 시간표 저장
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [mainTab, setMainTab] = useState('guide')
  const [mode, setMode] = useState(null)
  const [track, setTrack] = useState('all')
  const [activeTab, setActiveTab] = useState('2-1')
  const [cart, setCart] = useState([])
  const [modal, setModal] = useState(null)
  const [cartSheetOpen, setCartSheetOpen] = useState(false)
  const [prereqModal, setPrereqModal] = useState(null)
  const [encyclopediaArea, setEncyclopediaArea] = useState('all')
  const [encyclopediaSearch, setEncyclopediaSearch] = useState('')
  const [encyclopediaCourse, setEncyclopediaCourse] = useState(null)

  const tabs = useMemo(() => {
    if (!mode) return []
    return mode === 'grade1' ? ['2-1', '2-2', '3-1', '3-2'] : ['3-1', '3-2']
  }, [mode])

  useEffect(() => {
    if (!tabs.length) return
    if (!tabs.includes(activeTab)) setActiveTab(tabs[0])
  }, [tabs, activeTab])

  const [tg, ts] = useMemo(() => {
    const [g, s] = activeTab.split('-').map(Number)
    return [g, s]
  }, [activeTab])

  const termCourses = useMemo(() => {
    if (!mode) return []
    return COURSES.filter((c) => c.grade === tg && c.sem === ts)
  }, [mode, tg, ts])

  const encyclopediaFiltered = useMemo(() => {
    let list = [...COURSES]
    if (encyclopediaArea !== 'all') {
      list = list.filter((c) => getAreaLabel(c.name) === encyclopediaArea)
    }
    const q = encyclopediaSearch.trim()
    if (q) {
      list = list.filter((c) => c.name.includes(q) || c.id.toLowerCase().includes(q.toLowerCase()))
    }
    list.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    return list
  }, [encyclopediaArea, encyclopediaSearch])

  const requiredCourses = useMemo(
    () =>
      COURSES.filter((course) => {
        const key = tabKey(course)
        return tabs.includes(key) && (BLUE_REQUIRED_BY_TAB[key] || []).includes(course.name)
      }),
    [tabs],
  )

  const requiredCourseIdSet = useMemo(
    () => new Set(requiredCourses.map((c) => c.id)),
    [requiredCourses],
  )

  const coursesByArea = useMemo(() => {
    const map = {}
    for (const course of termCourses) {
      const area = getAreaLabel(course.name)
      if (!map[area]) map[area] = []
      map[area].push(course)
    }

    return AREA_ORDER.filter((area) => map[area]?.length).map((area) => ({
      area,
      courses: map[area].sort((a, b) => {
        const typeRank = (t) => (t === 'art' ? 0 : t === 4 ? 1 : 2)
        if (typeRank(a.type) !== typeRank(b.type)) return typeRank(a.type) - typeRank(b.type)
        return a.name.localeCompare(b.name, 'ko')
      }),
    }))
  }, [termCourses])

  const mandatoryKeys = tabs
  const mandatoryTotalCredits = useMemo(
    () =>
      mandatoryKeys.reduce((sum, key) => {
        const list = MANDATORY[key] || []
        return sum + list.reduce((s, m) => s + m.credits, 0)
      }, 0),
    [mandatoryKeys],
  )

  const selectedCourses = useMemo(() => {
    const byId = new Map()
    for (const c of requiredCourses) byId.set(c.id, c)
    for (const c of cart) byId.set(c.id, c)
    return [...byId.values()]
  }, [requiredCourses, cart])

  const selectedCredits = useMemo(() => selectedCourses.reduce((s, c) => s + c.credits, 0), [selectedCourses])
  const totalCredits = mandatoryTotalCredits + selectedCredits

  const liberalCredits = useMemo(() => {
    const fromElective = selectedCourses.filter((c) => c.isLiberal).reduce((s, c) => s + c.credits, 0)
    return fromElective + countLiberalMandatoryCredits(mandatoryKeys)
  }, [selectedCourses, mandatoryKeys])

  const liberalPct = useMemo(
    () => Math.min(100, (liberalCredits / LIBERAL_CAP) * 100),
    [liberalCredits],
  )
  const liberalDone = liberalCredits >= LIBERAL_CAP

  const sortedCart = useMemo(() => sortCart(selectedCourses), [selectedCourses])

  useEffect(() => {
    if (!prereqModal && !cartSheetOpen && !encyclopediaCourse) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [prereqModal, cartSheetOpen, encyclopediaCourse])

  const startSimulator = (nextMode) => {
    setMode(nextMode)
    setTrack('all')
    setModal(null)
    setCartSheetOpen(false)
    setPrereqModal(null)
    setActiveTab(nextMode === 'grade1' ? '2-1' : '3-1')
    setMainTab('simulator')
  }

  const addCourseToCart = (course) => {
    setCart((prev) => [...prev, course])
  }

  const toggleCourse = (course) => {
    if (requiredCourseIdSet.has(course.id)) {
      setModal({ message: '이 과목은 안내문 파란색 필수 과목으로 기본 선택(해제 불가)입니다.' })
      return
    }
    const inCart = cart.some((c) => c.id === course.id)
    if (inCart) {
      setCart((prev) => prev.filter((c) => c.id !== course.id))
      return
    }
    const result = validateAdd(course, selectedCourses)
    if (!result.ok) {
      setModal({ message: result.message })
      return
    }
    const reqs = course.req && course.req.length ? course.req : []
    const currentOrder = termOrder(course.grade, course.sem)
    const missingPrereqs = reqs.filter((name) => !hasCourseByName(selectedCourses, name, currentOrder))
    if (missingPrereqs.length > 0) {
      setPrereqModal({ course, missing: missingPrereqs })
      return
    }
    addCourseToCart(course)
  }

  /** 과목 안내 패널에서 담기 — 성공·취소 시 패널 닫기, 선수과목은 모달 유지 */
  const addFromEncyclopediaPanel = (course) => {
    if (requiredCourseIdSet.has(course.id)) {
      setModal({ message: '이 과목은 안내문 파란색 필수 과목으로 기본 선택(해제 불가)입니다.' })
      return
    }
    if (cart.some((c) => c.id === course.id)) {
      setCart((prev) => prev.filter((c) => c.id !== course.id))
      setEncyclopediaCourse(null)
      return
    }
    const result = validateAdd(course, selectedCourses)
    if (!result.ok) {
      setModal({ message: result.message })
      return
    }
    const reqs = course.req && course.req.length ? course.req : []
    const currentOrder = termOrder(course.grade, course.sem)
    const missingPrereqs = reqs.filter((name) => !hasCourseByName(selectedCourses, name, currentOrder))
    if (missingPrereqs.length > 0) {
      setPrereqModal({ course, missing: missingPrereqs })
      return
    }
    addCourseToCart(course)
    setEncyclopediaCourse(null)
    setMainTab('simulator')
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSave = () => {
    setModal({
      message:
        cart.length === 0
          ? '담긴 선택 과목이 없습니다. 계속하시겠습니까? (데모 저장)'
          : `총 ${totalCredits}학점 기준으로 시간표가 저장되었습니다. (시뮬레이션)`,
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <AppTopBar />

      <div key={mainTab} className="animate-fade-in">
        {mainTab === 'guide' ? (
          <GuideTabContent onGoSimulator={() => setMainTab('simulator')} />
        ) : null}

        {mainTab === 'encyclopedia' ? (
          <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">과목 안내</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
              개설 과목을 분야·검색으로 찾고, 상세에서 바로 담을 수 있습니다. 장바구니는 시뮬레이션 탭과 실시간으로 같습니다.
            </p>
            <div className="relative mt-5">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={encyclopediaSearch}
                onChange={(e) => setEncyclopediaSearch(e.target.value)}
                placeholder="과목명 또는 코드 검색"
                className="w-full rounded-2xl border border-slate-100 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {ENCYCLOPEDIA_AREA_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEncyclopediaArea(opt.id)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ease-in-out ${
                    encyclopediaArea === opt.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 hover:ring-indigo-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <ul className="mt-6 max-h-[60vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[min(70vh,36rem)]">
              {encyclopediaFiltered.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm font-medium text-slate-500">
                  조건에 맞는 과목이 없습니다. 검색어나 분야 필터를 바꿔 보세요.
                </li>
              ) : null}
              {encyclopediaFiltered.map((course) => (
                <li key={course.id}>
                  <button
                    type="button"
                    onClick={() => setEncyclopediaCourse(course)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 text-left shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="font-bold text-slate-900">{course.name}</span>
                    <span className="shrink-0 text-xs font-medium text-slate-500">
                      {getAreaLabel(course.name)} · {course.credits}학점
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {mainTab === 'simulator' ? (
          <div
            className={`mx-auto flex max-w-7xl flex-col gap-8 px-5 pt-6 lg:flex-row lg:gap-10 sm:px-8 ${
              mode ? 'pb-36 lg:pb-8' : 'pb-6 lg:pb-8'
            }`}
          >
            <main className="w-full flex-[0_0_100%] lg:flex-[0_0_70%] lg:max-w-[70%]">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md shadow-slate-200/50 sm:p-8 lg:p-10">
                {!mode ? (
                  <div className="py-4">
                    <h2 className="text-xl font-extrabold text-slate-900">입학 연도</h2>
                    <p className="mt-2 text-sm font-medium text-slate-500">먼저 연도를 고르면 학기 탭과 필수 반영이 켜집니다.</p>
                    <div className="mt-8 flex flex-col gap-4 sm:max-w-md">
                      <button
                        type="button"
                        onClick={() => startSimulator('grade1')}
                        className="group flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg"
                      >
                        <p className="text-lg font-extrabold text-slate-900">2026년도 입학생</p>
                        <ChevronRight className="h-6 w-6 text-indigo-500 transition group-hover:translate-x-1" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startSimulator('grade2')}
                        className="group flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg"
                      >
                        <p className="text-lg font-extrabold text-slate-900">2025년도 입학생</p>
                        <ChevronRight className="h-6 w-6 text-indigo-500 transition group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex flex-wrap gap-3">
                      {TRACK_CHIPS.map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => setTrack(chip.id)}
                          className={`rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all duration-300 ease-in-out sm:text-sm ${
                            track === chip.id
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 hover:-translate-y-0.5 hover:shadow-lg'
                              : 'border border-transparent bg-slate-100/90 text-slate-500 shadow-sm hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:text-slate-800 hover:shadow-md'
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-100 pb-2">
                      {tabs.map((tk) => (
                        <button
                          key={tk}
                          type="button"
                          onClick={() => setActiveTab(tk)}
                          className={`rounded-2xl px-4 py-3 text-xs font-bold transition-all duration-300 ease-in-out sm:text-sm ${
                            activeTab === tk
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                              : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'
                          }`}
                        >
                          {TAB_LABELS[tk]}
                        </button>
                      ))}
                    </div>

                    <p className="mb-8 text-sm font-medium text-slate-500">
                      {mode === 'grade1' ? '2026년도 입학생' : '2025년도 입학생'} ·{' '}
                      <span className="font-bold text-indigo-600">{TAB_LABELS[activeTab]}</span>
                    </p>

                    <div className="space-y-12 sm:space-y-14">
              {coursesByArea.map(({ area, courses }) => (
                <section key={area}>
                  <SectionHeader
                    emoji="📚"
                    title={`${area} 분야`}
                    subtitle="계열·학기 조건에 맞을 때만 추천 배지가 표시됩니다."
                  />
                  <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
                    {courses.map((course) => {
                      const inCart = cart.some((c) => c.id === course.id)
                      const isFixedRequired = requiredCourseIdSet.has(course.id)
                      const isSelected = inCart || isFixedRequired
                      const addCheck = validateAdd(course, selectedCourses)
                      const isRecommended =
                        track !== 'all' &&
                        matchesTrack(course, track) &&
                        matchesSunungTab(course, activeTab, track) &&
                        !isSelected &&
                        addCheck.ok
                      const groupLabel =
                        course.type === 'art'
                          ? '예술(택1)'
                          : course.type === 4
                            ? '4학점군(택3)'
                            : tg === 3 && ts === 2
                              ? '3학점군(택3)'
                              : '3학점군(택4)'

                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => toggleCourse(course)}
                          className={`relative flex flex-col rounded-3xl border p-5 text-left transition-all duration-300 ease-in-out sm:p-6 ${
                            isSelected
                              ? 'border-indigo-200 bg-indigo-50/90 shadow-lg shadow-indigo-200/50 ring-2 ring-indigo-500/30 hover:-translate-y-1 hover:shadow-xl'
                              : isRecommended
                                ? 'border-indigo-100 bg-indigo-50/50 shadow-md shadow-indigo-100/60 ring-1 ring-indigo-100 hover:-translate-y-1 hover:shadow-lg hover:ring-indigo-200'
                                : 'border-slate-100 bg-white shadow-md shadow-slate-200/40 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/30'
                          }`}
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                                course.type === 'art'
                                  ? 'bg-violet-100 text-violet-700'
                                  : course.type === 4
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {groupLabel}
                            </span>
                            {isFixedRequired ? (
                              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-extrabold text-indigo-800">
                                파란 필수
                              </span>
                            ) : isRecommended ? (
                              <span className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-[10px] font-extrabold text-indigo-700 ring-1 ring-indigo-200/60">
                                추천
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-bold leading-snug text-slate-900">{course.name}</span>
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-in-out ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                                  : 'border border-slate-200 bg-slate-50 text-slate-400'
                              }`}
                            >
                              <Check className="h-4 w-4" strokeWidth={2.5} />
                            </span>
                          </div>
                          <span className="mt-3 text-xs font-medium text-slate-500">
                            {course.credits}학점 · {course.id}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              ))}
                    </div>
                  </>
                )}
              </div>
            </main>

            <aside className="hidden w-full lg:block lg:flex-[0_0_30%] lg:max-w-[30%]">
          <div className="sticky top-[5.25rem]">
            <SimulatorDashboard
              mandatoryKeys={mandatoryKeys}
              sortedCart={sortedCart}
              removeFromCart={removeFromCart}
              requiredCourseIdSet={requiredCourseIdSet}
              totalCredits={totalCredits}
              mandatoryTotalCredits={mandatoryTotalCredits}
              selectedCredits={selectedCredits}
              liberalCredits={liberalCredits}
              liberalPct={liberalPct}
              liberalDone={liberalDone}
              onSave={handleSave}
            />
            </div>
            </aside>
          </div>
        ) : null}
      </div>

      <MainTabNav value={mainTab} onChange={setMainTab} />

      {mainTab === 'simulator' && mode ? (
        <div
          className="fixed bottom-[4.75rem] left-0 right-0 z-40 flex items-center justify-between gap-4 border-t border-slate-100 bg-white/95 px-5 py-3.5 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          <p className="min-w-0 text-sm font-medium text-slate-500">
            현재 선택:{' '}
            <span className="font-extrabold tabular-nums text-indigo-600">{totalCredits}</span>
            학점
          </p>
          <button
            type="button"
            onClick={() => setCartSheetOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl"
          >
            <ShoppingBag className="h-4 w-4" />
            장바구니 보기
          </button>
        </div>
      ) : null}

      {cartSheetOpen ? (
        <div className="fixed inset-0 z-[58] lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45"
            aria-label="장바구니 닫기"
            onClick={() => setCartSheetOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-3xl border border-slate-100 bg-white px-6 pt-5 shadow-2xl shadow-slate-300/50"
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-sheet-title"
          >
            <div className="mx-auto mb-4 h-1.5 w-14 shrink-0 rounded-full bg-slate-200" />
            <h2 id="cart-sheet-title" className="mb-5 text-base font-extrabold text-slate-900">
              장바구니
            </h2>
            <SimulatorDashboard
              mandatoryKeys={mandatoryKeys}
              sortedCart={sortedCart}
              removeFromCart={removeFromCart}
              requiredCourseIdSet={requiredCourseIdSet}
              totalCredits={totalCredits}
              mandatoryTotalCredits={mandatoryTotalCredits}
              selectedCredits={selectedCredits}
              liberalCredits={liberalCredits}
              liberalPct={liberalPct}
              liberalDone={liberalDone}
              onSave={() => {
                handleSave()
                setCartSheetOpen(false)
              }}
              cartListMaxClass="max-h-[40vh]"
            />
          </div>
        </div>
      ) : null}

      {encyclopediaCourse ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[55] bg-slate-900/40 backdrop-blur-sm"
            aria-label="상세 닫기"
            onClick={() => setEncyclopediaCourse(null)}
          />
          <div className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-lg animate-slide-in-right flex-col border-l border-slate-100 bg-white shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-bold text-indigo-600">{getAreaLabel(encyclopediaCourse.name)}</p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">{encyclopediaCourse.name}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {TAB_LABELS[tabKey(encyclopediaCourse)]} · {encyclopediaCourse.credits}학점 · {encyclopediaCourse.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEncyclopediaCourse(null)}
                className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <h3 className="text-sm font-extrabold text-slate-900">핵심 내용</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                안내문·편성표 개설 목록에 포함된 선택 과목입니다. 심화·수능 연계는 학기·계열 설계에 따라 달라질 수 있습니다.
              </p>
              <h3 className="mt-6 text-sm font-extrabold text-slate-900">진로 맵</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                {careerLineFromRec(encyclopediaCourse.rec)}
              </p>
              {encyclopediaCourse.req?.length ? (
                <>
                  <h3 className="mt-6 text-sm font-extrabold text-slate-900">선수 과목</h3>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {encyclopediaCourse.req.join(', ')} 이수 후 권장됩니다.
                  </p>
                </>
              ) : null}
              {encyclopediaCourse.isLiberal ? (
                <p className="mt-4 inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                  생활·교양 16학점 반영 과목
                </p>
              ) : null}
              <h3 className="mt-6 text-sm font-extrabold text-slate-900">선배들의 한마디</h3>
              <p className="mt-2 rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-3 text-sm font-medium italic leading-relaxed text-slate-500">
                &ldquo;{encyclopediaCourse.name}&rdquo;은(는) 설계만 잘해도 후배 기록이 쌓일 거예요. (데모 문구)
              </p>
            </div>
            <div className="shrink-0 border-t border-slate-100 bg-white p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.04)]">
              <button
                type="button"
                onClick={() => addFromEncyclopediaPanel(encyclopediaCourse)}
                disabled={requiredCourseIdSet.has(encyclopediaCourse.id)}
                className={`w-full rounded-2xl py-3.5 text-sm font-bold transition-all duration-300 ease-in-out ${
                  requiredCourseIdSet.has(encyclopediaCourse.id)
                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                    : cart.some((c) => c.id === encyclopediaCourse.id)
                      ? 'border-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700'
                }`}
              >
                {requiredCourseIdSet.has(encyclopediaCourse.id)
                  ? '파란 필수(연도 선택 시 자동 반영)'
                  : cart.some((c) => c.id === encyclopediaCourse.id)
                    ? '장바구니에서 빼기'
                    : '이 과목 담기'}
              </button>
            </div>
          </div>
        </>
      ) : null}

      {modal ? (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-900/45 p-5 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-300/40">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="text-xl font-extrabold tracking-tight text-slate-900">알림</h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-2xl p-2 text-slate-400 transition-all duration-300 ease-in-out hover:bg-slate-100 hover:text-slate-700"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-base font-medium leading-relaxed text-slate-500">{modal.message}</p>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {prereqModal ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-5 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prereq-dialog-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-300/40">
            <h3 id="prereq-dialog-title" className="text-xl font-extrabold tracking-tight text-slate-900">
              선수 과목 안내
            </h3>
            <p className="mt-4 text-base font-medium leading-relaxed text-slate-500">
              앗! {prereqModal.course.name}을(를) 수강하려면 {prereqModal.missing.join(', ')}을(를) 먼저 듣는 것을 강력히 권장합니다.
              그래도 담으시겠습니까?
            </p>
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPrereqModal(null)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
              >
                취소하기
              </button>
              <button
                type="button"
                onClick={() => {
                  addCourseToCart(prereqModal.course)
                  setPrereqModal(null)
                  setEncyclopediaCourse(null)
                  setMainTab('simulator')
                }}
                className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl"
              >
                그래도 담기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
