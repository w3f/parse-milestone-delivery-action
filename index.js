'use strict'

const core = require('@actions/core')
const { promises: fs } = require('fs')

const main = async () => {
  const path = core.getInput('path')
  const content = await fs.readFile(path, 'utf8')

  const regexList = [
    /(?<=\*\*Application Document:\*\*.*https?:\/\/(www\.)?github\.com\/w3f\/(Open-)?Grants-Program\/(blob|tree)\/master\/applications\/)([-a-zA-Z0-9():_.~!]|%[0-9a-fA-F]{2})+.md/g,
    /(?<=\*\*Milestone Number:\*\* ).*/g,
  ]

  const outputs = [
    'application_document',
    'milestone_number',
  ]

  regexList.map(function (reg, i) {
    try {
      const result = content.match(reg)[0]
      core.setOutput(outputs[i], result)
    } catch {
      core.setFailed(`Match not found for: ${outputs[i]}`)
    }
  })
}

main().catch(err => core.setFailed(err.message))
