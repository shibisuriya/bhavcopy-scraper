import { createJob } from './createJob.js'
import { findJobByDate } from './findJobByDate.js'

const jobRepository = { createJob, findJobByDate }

export { jobRepository }
