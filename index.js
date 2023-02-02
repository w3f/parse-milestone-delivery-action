'use strict'

const core = require('@actions/core')
const { promises: fs } = require('fs')

const main = async () => {
  const path = core.getInput('path')
  const content = await fs.readFile(path, 'utf8')

  const regexList = [
    {
      name: 'application_document',
      regex: /(?<=\*\*Application Document:\*\* ).*/g,
    },
    {
      name: 'milestone_number',
      regex: /(?<=\*\*Milestone Number:\*\* ).*/g,
    },
  ]

  let not_found = []
  let isMaintenance = false

  regexList.map(function (reg) {
    try {
      switch (reg.name) {
        case 'application_document':
          let application_document = content.match(reg.regex)[0]
          const application_document_regex = /(https?:\/\/(www\.)?github\.com\/w3f\/(Open-)?Grants-Program\/(blob|tree)\/master\/(applications|maintenance)\/)([-a-zA-Z0-9():_.~! ]|%[0-9a-fA-F]{2})+.md/g
          if (application_document.match(application_document_regex)) {
            isMaintenance = application_document.includes('maintenance')
            application_document = application_document.split('/').pop()
            core.setOutput(reg.name, application_document)
          } else {
            not_found.push(reg.name)
          }
          break

        case 'milestone_number':
          if (isMaintenance) {
            core.setOutput(reg.name, 0)
          } else {
            const milestone_number = content.match(reg.regex)[0]
            core.setOutput(reg.name, milestone_number)
          }
          break

        default:
          const result = content.match(reg.regex)[0]
          core.setOutput(reg.name, result)
      }
    } catch {
      not_found.push(reg.name)
    }
  })
  
  if (not_found.length > 0) {
    const error_string = `Match not found for: ${not_found.join(', ')}`
    core.setFailed(error_string)
  }
}

main().catch(err => core.setFailed(err.message))
