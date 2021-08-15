import readline from 'readline'
import equal from 'deep-equal'

const DEBUG_MODE = process.argv && ['-d', '--debug'].includes(process.argv[2])

let reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

run()
  .catch(console.error)
  .finally(reader.close.bind(reader))

async function run() {
  console.log('Nock Box 1.0.0 — A minimalist interpreter.')
  let keepGoing = true
  while (keepGoing) {
    try {
      let input = await getInput()
      keepGoing = inputHandler(input)
    } catch (err) {
      logError(err)
    }
  }
}

function getInput() {
  return new Promise((resolve) => {
    reader.question(':> ', (line) => {
      resolve(line)
    })
  })
}
 
function inputHandler(input) {
  if (['exit', '|exit'].includes(input.trim()))
    return false

  let parsed = parseInput(input)
  if (parsed.length === 0) {
    toss('Invalid nock.')
  } else if (parsed.length === 1) {
    toss('Logical bottom.')
  }

  let parsedAndMerged = merge(parsed)
  if (parsedAndMerged.length === 2) {
    let subject = structured[0]
    let formula = structured[1]

    let result = nock(subject, formula)
    console.log(result)
  }
  return true
}

function parseInput(input) {
  let preProcessed = input.trim()
  try {
    return JSON.parse(preProcessed
    .split('.').join('')
    .split(/  +/g).join(' ')
    .split('[ ').join('[')
    .split(' ]').join(']')
    .split(' ').join(','))
  } catch {
    toss('Invalid nock.')
  }
}

function merge(data) {
  if (!Array.isArray(data))
    return data
  if (data.length === 1)
    return merge(data[0])
  
  return [merge(data[0]), merge(data.slice(1))]
}

function nock(subject, formula) {
  if (!formula)
    toss(`Invalid formula: ${formula}`)
  let op = formula[0]
  if (typeof op !== 'number')
    return [nock(subject, formula[0]), nock(subject, formula[1])]

  try {
    switch(op) {
      case 0:
        return slot(subject, formula)
      case 1:
        return constant(subject, formula)
      case 2:
        return evaluate(subject, formula)
      case 3:
        return cell(subject, formula)
      case 4:
        return increment(subject, formula)
      case 5:
        return equality(subject, formula)
      case 6:
        return condition(subject, formula)
      case 7:
        return compose(subject, formula)
      case 8:
        return extend(subject, formula)
      case 9:
        return invoke(subject, formula)
      case 11:
        return hint(subject, formula)
      default:
        toss(`Invalid nock op: ${op}`)
    }
  } catch (err) {
    if (err.inApp === true) throw err
    toss(`Poorly formed nock ${op} formula`)
  }
}

// nock 0
function slot(subject, formula) {
  let [_, slot] = formula
  return grabSlot(subject, slot)

  function grabSlot(subject, slot) {
    if (slot <= 0) {
      toss('Invalid slot.')
    }

    if (slot === 1)
      return subject
    if (slot === 2)
      return subject[0]
    if (slot === 3)
      return subject[1]

    try {
      return grabSlot(
        grabSlot(subject, Math.round(slot / 2)),
        2 + (slot % 2)
      )
    } catch {
      toss('Invalid slot.')
    }
  }
}

// nock 1
function constant(subject, formula) {
  let [_, val] = formula
  return val
}

// nock 2
function evaluate(subject, formula) {
  let [subFormulaA, subFormulaB] = formula[1]
  let newSubject = nock(subject, subFormulaA)
  let newFormula = nock(subject, subFormulaB)

  return nock(newSubject, newFormula)
}

// nock 3
function cell(subject, formula) {
  let [_, subFormula] = formula
  let val = nock(subject, subFormula)
  return typeof val === 'number' ? 1 : 0
}

// nock 4
function increment(subject, formula) {
  let [_, subFormula] = formula
  let val = nock(subject, subFormula)
  if (typeof val !== 'number')
    toss('Cannot increment cell.')
  return val + 1
}

// nock 5
function equality(subject, formula) {
  let [subFormulaA, subFormulaB] = formula[1]
  let a = nock(subject, subFormulaA)
  let b = nock(subject, subFormulaB)
  return equal(a, b) ? 0 : 1
}

// nock 6
function condition(subject, formula) {
  let conditionFormula = formula[1][0]
  let [subFormulaA, subFormulaB] = formula[1][1]

  return nock(subject, conditionFormula) === 0
    ? nock(subject, subFormulaA)
    : nock(subject, subFormulaB)
}

// nock 7
function compose(subject, formula) {
  let [subFormulaA, subFormulaB] = formula[1]
  let newSubject = nock(subject, subFormulaA)
  return nock(newSubject, subFormulaB)
}

// nock 8
function extend(subject, formula) {
  let [subFormulaA, subFormulaB] = formula[1]
  let val = nock(subject, subFormulaA)
  let newSubject = [val, subject]
  return nock(newSubject, subFormulaB)
}

// nock 9
function invoke(subject, formula) {
  let [newFormulaSlot, subFormula] = formula[1]
  let newSubject = nock(subject, subFormula)
  let newFormula = nock(newSubject, [0, newFormulaSlot])
  return nock(newSubject, newFormula)
}

// nock 11
function hint(subject, formula) {
  let [hint, subFormula] = formula[1]
  // something something, hint optimization
  return nock(subject, subFormula)
}

// util
function toss(message) {
  let err = new Error(message)
  err.inApp = true

  throw err
}

function logError(err) {
  console.error(DEBUG_MODE ? err : err.message)
}