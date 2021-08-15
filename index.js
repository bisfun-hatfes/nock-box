import readline from 'readline'

let reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

run()
  .catch(console.error)

async function run() {
  console.log('Nock Box 1.0.0 — A minimalist interpreter.')
  let keepGoing = true
  while (keepGoing) {
    let input = await getInput()
    keepGoing = inputHandler(input)
  }

  reader.close()
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

  let structured = merge(parseInput(input))
  if (structured.length === 2) {
    let subject = structured[0]
    let formula = structured[1]
    // console.log('Subject:')
    // console.log(subject)
    // console.log('Formula:')
    // console.log(formula)
    // console.log(structured)
    let result = nock(subject, formula)
    console.log(result)
  }
  return true
}

function parseInput(input) {
  try {
    return JSON.parse(input
    .split('.').join('')
    .split(/  +/g).join(' ')
    .split('[ ').join('[')
    .split(' ]').join(']')
    .split(' ').join(','))
  } catch {
    throw new Error('Invalid nock.')
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
  let op = formula[0]
  switch(op) {
    case 0:
      return slot(subject, formula)
    case 1:
      return constant(subject, formula)
    case 3:
      return cell(subject, formula)
    default:
      return
  }
}

// nock 0
function slot(subject, formula) {
  let [_, slot] = formula
  return grabSlot(subject, slot)

  function grabSlot(subject, slot) {
    console.log(slot)
    console.log(subject)
    if (slot <= 0) {
      throw new Error('Invalid slot.')
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
      throw new Error('Invalid slot.')
    }
  }
}

// nock 1
function constant(subject, formula) {
  let [_, val] = formula
  return val
}

// nock 3
function cell(subject, formula) {
  let [_, testFormula] = formula
  let val = nock(subject, testFormula)
  return typeof val === 'number' ? 1 : 0
}