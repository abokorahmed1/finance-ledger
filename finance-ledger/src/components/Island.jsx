export default function Island({ label, value, sub, color = 'cyan-400', icon }) {
  return (
    <div className="island flex-1 min-w-[140px]">
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className={`text-${color}`}>{icon}</span>}
        <span className="label !mb-0">{label}</span>
      </div>
      <p className={`text-2xl font-bold text-${color} leading-none`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
