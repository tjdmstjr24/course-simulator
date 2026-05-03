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

const CAREER_CHIPS = [
  { id: 'all', label: '전체' },
  { id: 'engineering', label: '공학/IT' },
  { id: 'medical', label: '의학/생명' },
  { id: 'human', label: '인문/사회' },
  { id: 'business', label: '상경/경영' },
]

const TAB_LABELS = {
  '2-1': '2학년 1학기',
  '2-2': '2학년 2학기',
  '3-1': '3학년 1학기',
  '3-2': '3학년 2학기',
}

function tabKey(course) {
  return `${course.grade}-${course.sem}`
}

function matchesCareer(course, careerId) {
  if (careerId === 'all') return true
  return course.rec.includes('all') || course.rec.includes(careerId)
}

function getMaxThreeCredits(grade, sem) {
  if (grade === 3 && sem === 2) return 3
  return 4
}

function validateAdd(course, cart) {
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
  const [career, setCareer] = useState('all')
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

  const termCourses = useMemo(
    () => COURSES.filter((c) => c.grade === tg && c.sem === ts),
    [tg, ts],
  )

  const artCourses = termCourses.filter((c) => c.type === 'art')
  const fourCourses = termCourses.filter((c) => c.type === 4)
  const threeCourses = termCourses.filter((c) => c.type === 3)

  const mandatoryKeys = tabs
  const mandatoryTotalCredits = useMemo(
    () =>
      mandatoryKeys.reduce((sum, key) => {
        const list = MANDATORY[key] || []
        return sum + list.reduce((s, m) => s + m.credits, 0)
      }, 0),
    [mandatoryKeys],
  )

  const selectedCredits = useMemo(() => cart.reduce((s, c) => s + c.credits, 0), [cart])
  const totalCredits = mandatoryTotalCredits + selectedCredits

  const sortedCart = useMemo(() => sortCart(cart), [cart])

  const startSimulator = (nextMode) => {
    setMode(nextMode)
    setCareer('all')
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
    const inCart = cart.some((c) => c.id === course.id)
    if (inCart) {
      setCart((prev) => prev.filter((c) => c.id !== course.id))
      return
    }
    const result = validateAdd(course, cart)
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
                <p className="text-lg font-semibold text-slate-900">현 1학년 전용</p>
                <p className="mt-1 text-sm text-slate-500">
                  2·3학년 선택 과목 설계 · 2-1 ~ 3-2 탭 (2학년 24학점·3학년 2학기 21학점 등 안내문과 동일 규칙)
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
            자료: 과목 선택 안내문·1학년 교육과정편성표(2026.4.23) 및 선택과목 체크리스트. 저작권은 사상고등학교에 있습니다.
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
              {CAREER_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setCareer(chip.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                    career === chip.id
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
              {mode === 'grade1' ? '현 1학년 · 이후 학년 설계' : '현 2학년 · 3학년 설계'} ·{' '}
              <span className="font-medium text-indigo-700">{TAB_LABELS[activeTab]}</span>
              <span className="mt-1 block text-[11px] text-slate-400">
                개설 목록: 체크리스트(Ver 5.28) + 2025·2026학년도 편성표·안내문(0423) 반영. 동일 과목명이라도 학년도별 운영이 다를 수 있습니다.
              </span>
            </p>

            <div className="space-y-8">
              {artCourses.length > 0 ? (
                <section>
                  <SectionHeader
                    emoji="🎨"
                    title="예술 선택 (택1)"
                    subtitle="2학년 학기당 1과목 · 편성표(0423)에는 반별 교차 이수 등 별도 규정이 있을 수 있음"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {artCourses.map((course) => {
                      const inCart = cart.some((c) => c.id === course.id)
                      const highlight = matchesCareer(course, career)
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => toggleCourse(course)}
                          className={`relative flex flex-col rounded-xl border p-4 text-left transition duration-200 ${
                            inCart
                              ? 'border-indigo-500 bg-indigo-50/80 shadow-md ring-2 ring-indigo-200'
                              : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md'
                          } ${!highlight ? 'opacity-45 hover:opacity-80' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-slate-900">{course.name}</span>
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                                inCart
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
              ) : null}

              <section>
                <SectionHeader
                  emoji="📘"
                  title="4학점 선택군 (택3)"
                  subtitle="학기당 최대 3과목"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {fourCourses.map((course) => {
                    const inCart = cart.some((c) => c.id === course.id)
                    const highlight = matchesCareer(course, career)
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => toggleCourse(course)}
                        className={`relative flex flex-col rounded-xl border p-4 text-left transition duration-200 ${
                          inCart
                            ? 'border-indigo-500 bg-indigo-50/80 shadow-md ring-2 ring-indigo-200'
                            : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md'
                        } ${!highlight ? 'opacity-45 hover:opacity-80' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-slate-900">{course.name}</span>
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                              inCart
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

              <section>
                <SectionHeader
                  emoji="🔬"
                  title="3학점 선택군 (택4)"
                  subtitle={
                    tg === 3 && ts === 2
                      ? '3학년 2학기: 최대 3과목'
                      : '일반: 학기당 최대 4과목'
                  }
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {threeCourses.map((course) => {
                    const inCart = cart.some((c) => c.id === course.id)
                    const highlight = matchesCareer(course, career)
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => toggleCourse(course)}
                        className={`relative flex flex-col rounded-xl border p-4 text-left transition duration-200 ${
                          inCart
                            ? 'border-indigo-500 bg-indigo-50/80 shadow-md ring-2 ring-indigo-200'
                            : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md'
                        } ${!highlight ? 'opacity-45 hover:opacity-80' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-slate-900">{course.name}</span>
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                              inCart
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
                          <span>{m.name}</span>
                          <span className="text-slate-500">{m.credits}학점</span>
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
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
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
