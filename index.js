'use strict'

const core = require('@actions/core')
const { promises: fs } = require('fs')

const main = async () => {
  const path = core.getInput('path')
  const content = await fs.readFile(path, 'utf8')

  const regexList = [
    /(?<=\*\*PR Link:\*\* ).*/g,
    /(?<=\*\*Milestone Number:\*\* ).*/g,
  ]

  const outputs = [
    'pr_link',
    'milestone_number',
  ]

  regexList.map(function (reg, i) {
    try {
      const result = content.match(reg)[0]
      core.setOutput(outputs[i], result)
    } catch {
      core.error(`Match not found for: ${outputs[i]}`)
    }
  })
}

main().catch(err => core.setFailed(err.message))
