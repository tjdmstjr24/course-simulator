import { useMemo, useState, useEffect } from 'react'
import {
  BookOpen,
  Check,
  ChevronRight,
  GraduationCap,
  Home,
  Info,
  Trash2,
  Palette,
  X,
  Save,
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
  '독서토론과 글쓰기': '3-2',
  대수: '2-1',
  미적분Ⅰ: '2-2',
  '수학과제 탐구': '3-1',
  '전문 수학': '3-2',
  영어Ⅰ: '2-1',
  영어Ⅱ: '2-2',
  '영어 독해와 작문': '3-1',
  '심화 영어': '3-2',
}

const SUNUNG_KOREAN = new Set(['문학', '화법과 언어', '독서와 작문', '독서토론과 글쓰기'])
const SUNUNG_MATH = new Set(['대수', '미적분Ⅰ', '수학과제 탐구', '전문 수학'])
const SUNUNG_ENGLISH = new Set(['영어Ⅰ', '영어Ⅱ', '영어 독해와 작문', '심화 영어'])

const BLUE_REQUIRED_BY_TAB = {
  '2-1': ['문학', '대수', '영어Ⅰ', '확률과 통계'],
  '2-2': ['화법과 언어', '미적분Ⅰ', '영어Ⅱ'],
  '3-1': ['수학과제 탐구'],
  '3-2': ['윤리문제 탐구', '과학의 역사와 문화'],
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

function tabKey(course) {
  return `${course.grade}-${course.sem}`
}

/** 편성표·안내문의 계열·이수 트랙(국영수·탐구)에 맞춰 과목에 태그 부여 */
function courseTrackIds(course) {
  const n = course.name
  const ids = new Set()
  if (
    /(문학|독서|화법|매체|국어|의사소통|토론|글쓰기|영상|언어생활|한문|철학|심리|종교|논술|윤리|사회|지리|세계사|정치|법과|경제|인문|역사|도시|동아시아|여행지리|사회문제|기후변화와 지속가능|한국지리)/.test(
      n,
    )
  ) {
    ids.add('track_kor_soc')
  }
  if (
    /(물리|화학|생명|지구|과학|역학|양자|유전|세포|에너지|천문|행성|실험|전자기|물질|지구시스템|행성우주|과학의 역사|기후변화와환경|화학 반응|생물의)/.test(
      n,
    )
  ) {
    ids.add('track_stem')
  }
  if (
    /(대수|미적분|기하|확률|통계|수학|이산|경제 수학|수학과|인공지능 수학|직무 수학|전문 수학|실용 통계|수학과제)/.test(n)
  ) {
    ids.add('track_stem')
  }
  if (/(영어Ⅰ|영어Ⅱ|영어 독해|심화 영어|미디어 영어|세계 문화와 영어|실생활 영어|직무 영어)/.test(n)) {
    ids.add('track_stem')
  }
  if (/(정보|인공지능|프로그래밍|데이터|공학|기술|가정|로봇|영상 제작|창의공학|창의 공학|정보과학)/.test(n)) {
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
  if (/(세계사|정치|법과|경제|윤리|사회|지리|한국지리|동아시아|인문학)/.test(name)) return '사회'
  if (
    /(물리|화학|생명|지구|우주|역학|전자기|과학|세포|물질|에너지|대사|양자|유전|천문|행성|실험|지구시스템|행성우주|반응의 세계|생물의)/.test(
      name,
    )
  )
    return '과학'
  if (/(체육|스포츠|운동)/.test(name)) return '체육'
  if (/(연극|미술|음악|시창|드로잉|조형|색채|디자인)/.test(name)) return '예술'
  if (/(정보|인공지능|데이터|프로그래밍|공학|기술·가정|정보과학)/.test(name)) return '정보/기술'
  if (/(교육의 이해|진로와 직업|보건|생태와 환경|철학|심리|논술|경제활동|삶과 종교)/.test(name))
    return '교양'
  return '기타'
}

function validateAdd(course, cart) {
  const currentOrder = termOrder(course.grade, course.sem)

  if (cart.some((c) => c.name === course.name)) {
    return { ok: false, message: '동일 과목명은 중복 이수할 수 없습니다. (참고사항 반영)' }
  }

  if (course.name === '미적분Ⅰ' && !hasCourseByName([...cart, course], '대수', currentOrder)) {
    return {
      ok: false,
      message: '미적분Ⅰ은 대수 이수 후 선택이 원칙입니다. (동시 이수 허용 범위 내에서 대수를 함께 선택해 주세요)',
    }
  }

  if (course.name === '경제 수학' && !hasCourseByName([...cart, course], '대수', currentOrder)) {
    return {
      ok: false,
      message: '경제 수학은 대수 이수 후 선택이 원칙입니다. 대수를 먼저(또는 함께) 선택해 주세요.',
    }
  }

  if (
    course.name === '미적분Ⅱ' &&
    (!hasCourseByName([...cart, course], '대수', currentOrder) ||
      !hasCourseByName([...cart, course], '미적분Ⅰ', currentOrder))
  ) {
    return {
      ok: false,
      message:
        '미적분Ⅱ는 대수·미적분Ⅰ 이수 후 선택이 원칙입니다. (동시 이수 허용 범위 내에서 두 과목을 함께 선택 가능)',
    }
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

function SectionHeader({ icon: Icon, emoji, title, subtitle }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
      {Icon ? (
        <Icon className="h-5 w-5 text-indigo-600" strokeWidth={1.75} />
      ) : (
        <span className="text-lg leading-none">{emoji}</span>
      )}
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('home')
  const [mode, setMode] = useState(null)
  const [track, setTrack] = useState('all')
  const [activeTab, setActiveTab] = useState('2-1')
  const [cart, setCart] = useState([])
  const [modal, setModal] = useState(null)

  const tabs = useMemo(() => (mode === 'grade1' ? ['2-1', '2-2', '3-1', '3-2'] : ['3-1', '3-2']), [mode])

  useEffect(() => {
    if (!tabs.length) return
    if (!tabs.includes(activeTab)) setActiveTab(tabs[0])
  }, [tabs, activeTab])

  const [tg, ts] = useMemo(() => {
    const [g, s] = activeTab.split('-').map(Number)
    return [g, s]
  }, [activeTab])

  const termCourses = useMemo(() => COURSES.filter((c) => c.grade === tg && c.sem === ts), [tg, ts])

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

  const sortedCart = useMemo(() => sortCart(selectedCourses), [selectedCourses])

  const startSimulator = (nextMode) => {
    setMode(nextMode)
    setTrack('all')
    setCart([])
    setModal(null)
    setActiveTab(nextMode === 'grade1' ? '2-1' : '3-1')
    setView('simulator')
  }

  const goHome = () => {
    setView('home')
    setMode(null)
    setCart([])
    setModal(null)
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
    setCart((prev) => [...prev, course])
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

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <GraduationCap className="h-8 w-8" strokeWidth={1.75} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">사상고 수강신청 시뮬레이터</h1>
            <p className="mt-2 text-slate-600">
              학년·학기별 선택 제한을 반영한 연습용 플래너입니다.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-center text-xs leading-relaxed text-slate-500">
              {CURRICULUM_DOC_NOTICE.revisionLabel}
              <span className="mt-1 block">
                목록은 선택과목 체크리스트(Ver 5.28) 개설분과 편성표(0423)·안내문을 함께 참고해 두었습니다.
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => startSimulator('grade1')}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div>
                <p className="text-lg font-semibold text-slate-900">2025학년도 입학생(1학년) 전용</p>
                <p className="mt-1 text-sm text-slate-500">
                  2학년 1학기부터 3학년 2학기까지 선택 설계(1학년은 학교지정·공통 이수로 본 화면에서 선택하지 않음)
                </p>
              </div>
              <ChevronRight className="h-6 w-6 text-indigo-500 transition group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => startSimulator('grade2')}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div>
                <p className="text-lg font-semibold text-slate-900">현 2학년 전용</p>
                <p className="mt-1 text-sm text-slate-500">
                  3학년 과목 설계 · 3-1 · 3-2 탭 (3-2는 3학점군 최대 3과목)
                </p>
              </div>
              <ChevronRight className="h-6 w-6 text-indigo-500 transition group-hover:translate-x-0.5" />
            </button>
          </div>
          <p className="mt-10 text-center text-xs text-slate-400">
            자료: 과목 선택 안내문(2025학년도 신입생)·1학년 교육과정편성표(2025.4.23) 및 선택과목 체크리스트. 저작권은 사상고등학교에 있습니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <BookOpen className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="text-sm font-bold text-slate-900 sm:text-base">사상고 수강신청 시스템</span>
          </div>
          <button
            type="button"
            onClick={goHome}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800 sm:text-sm"
          >
            <Home className="h-4 w-4" />
            메인으로
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 lg:flex-row lg:gap-6 sm:px-6">
        <main className="w-full flex-[0_0_100%] lg:flex-[0_0_70%] lg:max-w-[70%]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-wrap gap-2">
              {TRACK_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setTrack(chip.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                    track === chip.id
                      ? 'bg-indigo-600 text-white shadow shadow-indigo-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-100 pb-1">
              {tabs.map((tk) => (
                <button
                  key={tk}
                  type="button"
                  onClick={() => setActiveTab(tk)}
                  className={`rounded-t-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                    activeTab === tk
                      ? 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-100'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {TAB_LABELS[tk]}
                </button>
              ))}
            </div>

            <p className="mb-4 text-xs text-slate-500">
              {mode === 'grade1' ? '2025 입학생 · 2~3학년 선택 경로' : '현 2학년 · 3학년 설계'} ·{' '}
              <span className="font-medium text-indigo-700">{TAB_LABELS[activeTab]}</span>
              <span className="mt-1 block text-[11px] text-slate-400">
                개설 목록: 체크리스트(Ver 5.28) + 2025학년도 1학년 편성표·안내문(0423) 반영. 동일 과목명이라도 학년도별 운영이 다를 수 있습니다.
              </span>
            </p>

            <div className="space-y-8">
              {coursesByArea.map(({ area, courses }) => (
                <section key={area}>
                  <SectionHeader
                    emoji="📚"
                    title={`${area} 분야`}
                    subtitle="계열 칩 선택 시, 이미 담았거나 담을 수 없는 과목·다른 학기에 두는 수능 궤적 과목은 추천이 뜨지 않습니다."
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
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
                          className={`relative flex flex-col rounded-xl border p-4 text-left transition duration-200 ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50/80 shadow-md ring-2 ring-indigo-200'
                              : isRecommended
                                ? 'border-amber-300 bg-amber-50/80 shadow-sm ring-1 ring-amber-200 hover:-translate-y-0.5 hover:shadow-md'
                                : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md'
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                course.type === 'art'
                                  ? 'bg-fuchsia-100 text-fuchsia-700'
                                  : course.type === 4
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {groupLabel}
                            </span>
                            {isFixedRequired ? (
                              <span className="rounded-full bg-sky-200 px-2 py-1 text-[10px] font-bold text-sky-800">
                                파란 필수
                              </span>
                            ) : isRecommended ? (
                              <span className="rounded-full bg-amber-200 px-2 py-1 text-[10px] font-bold text-amber-800">
                                추천
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-slate-900">{course.name}</span>
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-600 text-white'
                                  : 'border-slate-200 bg-slate-50 text-slate-400'
                              }`}
                            >
                              <Check className="h-4 w-4" strokeWidth={2.5} />
                            </span>
                          </div>
                          <span className="mt-2 text-xs text-slate-500">{course.credits}학점 · {course.id}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </main>

        <aside className="w-full flex-[0_0_100%] lg:flex-[0_0_30%] lg:max-w-[30%]">
          <div className="sticky top-[4.25rem] space-y-4">
            <details className="group rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 shadow-sm open:bg-indigo-50">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-indigo-900 marker:hidden [&::-webkit-details-marker]:hidden">
                <Info className="h-4 w-4 shrink-0 text-indigo-600" />
                교육과정 요약 (편성표·안내문)
                <span className="ml-auto text-xs font-normal text-indigo-600/90">펼치기</span>
              </summary>
              <ul className="mt-3 space-y-2 border-t border-indigo-100/80 pt-3 text-[11px] leading-relaxed text-slate-700">
                {CURRICULUM_DOC_NOTICE.bullets.map((line, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-indigo-500">·</span>
                    <span>{line}</span>
                  </li>
                ))}
                <li className="flex gap-2">
                  <span className="text-indigo-500">·</span>
                  <span>동일 과목명 중복 이수 금지, 선수과목 위계(대수/미적분) 규칙을 시뮬레이터 검증에 반영했습니다.</span>
                </li>
              </ul>
            </details>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <Palette className="h-4 w-4 text-indigo-600" />
                학교 필수 과목
              </h2>
              <div className="space-y-3">
                {mandatoryKeys.map((key) => (
                  <div key={key}>
                    <p className="mb-1 text-xs font-semibold text-indigo-700">{TAB_LABELS[key]}</p>
                    <ul className="space-y-1 rounded-lg bg-slate-50 p-2">
                      {(MANDATORY[key] || []).map((m) => (
                        <li key={m.name} className="flex justify-between text-xs text-slate-700">
                          <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                            {m.name}
                          </span>
                          <span className="text-slate-500">
                            {m.credits > 0 ? `${m.credits}학점` : '편성표 참고'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-bold text-slate-900">내가 담은 과목</h2>
              {sortedCart.length === 0 ? (
                <p className="text-xs text-slate-500">과목을 선택해 보세요.</p>
              ) : (
                <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {sortedCart.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-2 py-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{c.name}</p>
                        <p className="text-slate-500">
                          {TAB_LABELS[tabKey(c)]} · {c.credits}학점
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(c.id)}
                        disabled={requiredCourseIdSet.has(c.id)}
                        className={`rounded-md p-1.5 transition ${
                          requiredCourseIdSet.has(c.id)
                            ? 'cursor-not-allowed text-slate-300'
                            : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
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

            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 text-white shadow-lg shadow-indigo-200">
              <p className="text-xs font-medium text-indigo-100">선택 누적 학점</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{totalCredits}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-indigo-100/90">
                필수 {mandatoryTotalCredits} + 선택 {selectedCredits}
              </p>
              <button
                type="button"
                onClick={handleSave}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-indigo-700 shadow transition hover:bg-indigo-50"
              >
                <Save className="h-4 w-4" />
                최종 시간표 저장
              </button>
            </div>
          </div>
        </aside>
      </div>

      {modal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">알림</h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{modal.message}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
