// UK tax year runs 6 April – 5 April
// Q1: Apr–Jun, Q2: Jul–Sep, Q3: Oct–Dec, Q4: Jan–Mar

export function getTaxYear(date = new Date()) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = d.getMonth() // 0-indexed
  const day = d.getDate()
  if (m > 3 || (m === 3 && day >= 6)) return y
  return y - 1
}

export function getTaxYearLabel(startYear) {
  return `${startYear}/${(startYear + 1).toString().slice(2)}`
}

export function getQuarterDates(startYear, quarter) {
  const ranges = {
    Q1: [`${startYear}-04-06`, `${startYear}-07-05`],
    Q2: [`${startYear}-07-06`, `${startYear}-10-05`],
    Q3: [`${startYear}-10-06`, `${startYear + 1}-01-05`],
    Q4: [`${startYear + 1}-01-06`, `${startYear + 1}-04-05`],
    ALL: [`${startYear}-04-06`, `${startYear + 1}-04-05`]
  }
  return ranges[quarter] || ranges.ALL
}

export function filterByQuarter(items, startYear, quarter, dateField = 'date') {
  const [from, to] = getQuarterDates(startYear, quarter)
  return items.filter(i => {
    const d = i[dateField]
    return d >= from && d <= to
  })
}
