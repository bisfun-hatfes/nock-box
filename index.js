import { O_NONBLOCK } from 'constants'
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
    nock(subect, formula)
  }
  console.log(structured)
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
    console.error('Invalid nock.')
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
      slot(subject, formula)
  }
}

function slot(subject, formula) {

}