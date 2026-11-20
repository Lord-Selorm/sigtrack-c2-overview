import { ChevronLeft, ChevronRight } from 'lucide-react'

export type SectionType = 'operations' | 'logging' | 'reports' | 'sitrep' | 'sos'

export interface SectionNavigatorProps {
  currentSection: SectionType
  onSectionChange: (section: SectionType) => void
}

const SECTIONS: { id: SectionType; label: string }[] = [
  { id: 'operations', label: 'OPERATIONS' },
  { id: 'logging', label: 'INCIDENT LOGS' },
  { id: 'reports', label: 'REPORTS' },
  { id: 'sitrep', label: 'SITREP' },
  { id: 'sos', label: 'SOS HISTORY' },
]

export function SectionNavigator({ currentSection, onSectionChange }: SectionNavigatorProps) {
  const currentIndex = SECTIONS.findIndex((s) => s.id === currentSection)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < SECTIONS.length - 1

  const handlePrev = () => {
    if (canGoPrev) {
      onSectionChange(SECTIONS[currentIndex - 1].id)
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      onSectionChange(SECTIONS[currentIndex + 1].id)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
      {/* Prev Button */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={!canGoPrev}
        className={`p-2 rounded-lg transition-all ${
          canGoPrev
            ? 'hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            : 'text-[var(--text-muted)] cursor-not-allowed opacity-50'
        }`}
        aria-label="Previous section"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[var(--bg-primary)] rounded-lg p-1 overflow-x-auto max-w-full">
        {SECTIONS.map((section) => {
          const isActive = section.id === currentSection
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              className={`px-3 sm:px-4 py-1.5 rounded-md text-[11px] font-bold font-mono transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--accent-blue)] text-white shadow'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {section.label}
            </button>
          )
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={!canGoNext}
        className={`p-2 rounded-lg transition-all ${
          canGoNext
            ? 'hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            : 'text-[var(--text-muted)] cursor-not-allowed opacity-50'
        }`}
        aria-label="Next section"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
