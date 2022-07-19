'use strict'

const core = require('@actions/core')
const { promises: fs } = require('fs')

const main = async () => {
  const path = core.getInput('path')
  const content = await fs.readFile(path, 'utf8')

  const regexList = [
    /(?<=\*\*Application Document:\*\*.*https?:\/\/(www\.)?github\.com\/w3f\/(Open-)?Grants-Program\/(blob|tree)\/master\/applications\/)([-a-zA-Z0-9():_.~! ]|%[0-9a-fA-F]{2})+.md/g,
    /(?<=\*\*Milestone Number:\*\* ).*/g,
  ]
  
  const outputs = [
    'application_document',
    'milestone_number',
  ]

  var results = []
  regexList.map(function (reg, i) {
    try {
      results.push(content.match(reg)[0])
    } catch {
      core.setFailed(`Match not found for: ${outputs[i]}`)
    }
  })
  
  results[0] = decodeURIComponent(results[0])
  results.map(function (result, i) {
    core.setOutput(outputs[i], result)
  })
}

main().catch(err => core.setFailed(err.message))
