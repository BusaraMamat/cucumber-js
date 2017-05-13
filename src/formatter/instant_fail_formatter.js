import _ from 'lodash'
import {formatIssue, formatSummary} from './helpers'
import Hook from '../models/hook'
import Status from '../status'
import SummaryFormatter from './summary_formatter'
import ProgressBar from 'progress'

const statusToReport = [
  Status.AMBIGUOUS,
  Status.FAILED,
  Status.PENDING,
  Status.UNDEFINED
]

export default class InstantFailFormatter extends SummaryFormatter {
  constructor(options) {
    super(options)
    this.issueCount = 0
  }

  handleBeforeFeatures(features) {
    const numberOfSteps = _.sumBy(features, (feature) => {
      return _.sumBy(feature.scenarios, (scenario) => {
        return scenario.steps.length
      })
    })
    this.progressBar = new ProgressBar(':current/:total steps [:bar] ', {
      clear: true,
      incomplete: ' ',
      stream: this.stream,
      total: numberOfSteps,
      width: this.stream.columns || 80
    })
  }

  handleStepResult(stepResult) {
    if (!(stepResult instanceof Hook)) {
      this.progressBar.tick()
    }
    if (_.includes(statusToReport, stepResult.status)) {
      this.issueCount += 1
      this.progressBar.interrupt(formatIssue({
        colorFns: this.colorFns,
        cwd: this.cwd,
        number: this.issueCount,
        snippetBuilder: this.snippetBuilder,
        stepResult
      }))
    }
  }

  handleFeaturesResult(featuresResult) {
    this.progressBar.terminate()
    this.log(formatSummary({
      colorFns: this.colorFns,
      featuresResult
    }))
  }
}
