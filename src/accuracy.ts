
// MEDIUM error 

// import logger from './logger'
// import colors from 'colors/safe'
const solves: Record<string, { 'find it': boolean, 'fix it': boolean, attempts: { 'find it': number, 'fix it': number } }> = {}

type Phase = 'find it' | 'fix it'

export const storeFindItVerdict = (challengeKey: string, verdict: boolean) => {
  storeVerdict(challengeKey, 'find it', verdict)
}

export const storeFixItVerdict = (challengeKey: string, verdict: boolean) => {
  storeVerdict(challengeKey, 'fix it', verdict)
}

// export const calculateFindItAccuracy = (challengeKey: string) => {
//   return calculateAccuracy(challengeKey, 'find it')
// }

// export const calculateFixItAccuracy = (challengeKey: string) => {
//   return calculateAccuracy(challengeKey, 'fix it')
// }

// export const totalFindItAccuracy = () => {
//   return totalAccuracy('find it')
// }

// export const totalFixItAccuracy = () => {
//   return totalAccuracy('fix it')
// }

// export const getFindItAttempts = (challengeKey: string) => {
//   return solves[challengeKey] ? solves[challengeKey].attempts['find it'] : 0
// }

function storeVerdict (challengeKey: string, phase: Phase, verdict: boolean) {
    if (!solves[challengeKey]) {
      solves[challengeKey] = { 'find it': false, 'fix it': false, attempts: { 'find it': 0, 'fix it': 0 } }
    }
    if (!solves[challengeKey][phase]) {
      solves[challengeKey][phase] = verdict
      solves[challengeKey].attempts[phase]++
    }
  }