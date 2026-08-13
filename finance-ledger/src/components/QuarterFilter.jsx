const quarters = ['ALL', 'Q1', 'Q2', 'Q3', 'Q4']

export default function QuarterFilter({ active, onChange }) {
  return (
    <div className="flex gap-1.5">
      {quarters.map(q => (
        <button key={q} onClick={() => onChange(q)}
                className={`tab ${active === q ? 'tab-on' : 'tab-off'}`}>
          {q === 'ALL' ? 'Year' : q}
        </button>
      ))}
    </div>
  )
}
