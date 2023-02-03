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
      url_regex: /(https?:\/\/(www\.)?github\.com\/w3f\/(Open-)?Grants-Program\/(blob|tree)\/master\/(applications|maintenance)\/)([-a-zA-Z0-9():_.~! ]|%[0-9a-fA-F]{2})+.md/g,
      filename_regex: /(?<=\/)([-a-zA-Z0-9():_.~! ]|%[0-9a-fA-F]{2})+.md/g
    },
    {
      name: 'milestone_number',
      regex: /(?<=\*\*(Milestone|Delivery) Number:\*\* ).*/g
    },
  ]

  let errors = []
  let isMaintenance = false

  regexList.map(function (reg) {
    try {
      switch (reg.name) {
        case 'application_document':
          let application_document = content.match(reg.regex)[0]
          application_document = application_document.match(reg.url_regex)[0]
          isMaintenance = application_document.includes('maintenance')
          application_document = application_document.match(reg.filename_regex)[0]
          if (application_document) {
            core.setOutput(reg.name, application_document)
            core.setOutput('is_maintenance', isMaintenance)
          } else {
            errors.push(reg.name)
          }
          break

        case 'milestone_number':
          const milestone_number = content.match(reg.regex)[0]
          if (isNaN(milestone_number)) {
            errors.push(reg.name)
          } else {
            core.setOutput(reg.name, milestone_number)
          }
          break

        default:
          const result = content.match(reg.regex)[0]
          core.setOutput(reg.name, result)
      }
    } catch {
      errors.push(reg.name)
    }
  })
  
  if (errors.length > 0) {
    const error_string = `Match not found for: ${errors.join(', ')}`
    core.setFailed(error_string)
  }
}

main().catch(err => core.setFailed(err.message))
