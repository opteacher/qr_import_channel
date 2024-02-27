import { Ref } from 'vue'
import {
  addEquation,
  Descriptor,
  isDetermined,
  individualSlicesInStore,
  isEqual,
  newStore,
  Slice,
  SliceStore,
  unmarshalDescriptor,
  unmarshalSlice,
  determinedPercentage,
  determinedSliceIndices
} from './FileUtils'

const DATA_RATE_BUFFER_MAX_SECONDS = 5

type DataRateSample = {
  receivedAt: number
  bytes: number
}

const purgeDataRateBuffer = (buffer: DataRateSample[], maxSeconds: number): DataRateSample[] => {
  const now = Date.now()
  return buffer.filter(s => now - s.receivedAt < maxSeconds * 1000)
}

export const calculateBitsPerSecond = (buffer: DataRateSample[]): number => {
  const sorted = purgeDataRateBuffer(buffer, DATA_RATE_BUFFER_MAX_SECONDS).sort(
    (a, b) => a.receivedAt - b.receivedAt
  )
  const start = sorted[0]?.receivedAt
  const end = sorted[sorted.length - 1]?.receivedAt
  if (start && end) {
    return (buffer.map(s => s.bytes).reduce((a, b) => a + b) / DATA_RATE_BUFFER_MAX_SECONDS) * 8
  } else {
    return 0
  }
}

export interface sliceReducerState {
  store: SliceStore
  descriptor?: Descriptor
  rawDataRateBuffer: DataRateSample[]
  dataRateBuffer: DataRateSample[]
  lastIdentifiersAdded: number[]
  lastSliceReceivedOn: number
  addDataCount: number
}

interface sliceReducerActionDescriptor {
  type: 'SET_DESCRIPTOR'
  descriptor: Descriptor
}

interface sliceReducerActionData {
  type: 'ADD_DATA'
  slice: Slice
}

interface sliceReducerActionCalcDrate {
  type: 'CALC_DRATE'
}

const sliceReducer = (
  state: sliceReducerState,
  action: sliceReducerActionData | sliceReducerActionDescriptor | sliceReducerActionCalcDrate
) => {
  switch (action.type) {
    case 'SET_DESCRIPTOR':
      if (state.descriptor === undefined || state.descriptor.name !== action.descriptor.name) {
        return {
          descriptor: action.descriptor,
          store: newStore(action.descriptor.totalSlices),
          dataRateBuffer: [],
          rawDataRateBuffer: [],
          lastSliceReceivedOn: 0,
          lastIdentifiersAdded: [],
          addDataCount: 0
        }
      } else {
        return state
      }
    case 'CALC_DRATE': {
      return {
        ...state,
        dataRateBuffer: purgeDataRateBuffer(state.dataRateBuffer, DATA_RATE_BUFFER_MAX_SECONDS),
        rawDataRateBuffer: purgeDataRateBuffer(
          state.rawDataRateBuffer,
          DATA_RATE_BUFFER_MAX_SECONDS
        )
      }
    }
    case 'ADD_DATA': {
      if (state.descriptor === undefined) {
        return state
      } else {
        if (state.descriptor && !isEqual(action.slice.identifiers, state.lastIdentifiersAdded)) {
          addEquation(state.store, action.slice)
        }
        state.rawDataRateBuffer.push({
          receivedAt: Date.now(),
          bytes: action.slice.payload.length
        })

        return {
          descriptor: state.descriptor,
          store: state.store,
          dataRateBuffer: purgeDataRateBuffer(state.dataRateBuffer, DATA_RATE_BUFFER_MAX_SECONDS),
          rawDataRateBuffer: purgeDataRateBuffer(
            state.rawDataRateBuffer,
            DATA_RATE_BUFFER_MAX_SECONDS
          ),
          lastSliceReceivedOn: Date.now(),
          lastIdentifiersAdded: action.slice.identifiers,
          addDataCount: state.addDataCount + 1
        }
      }
    }
    default:
      throw Error('Should not be reached')
  }
}

export interface DecoderResult {
  ready: () => boolean
  descriptor?: Descriptor
  availableSlices: () => number[]
  determinedPercentage: () => number
  determinedSlices: () => number[]
  callbackFunction: (data: string) => void
  rawDataRateInBitsPerSeconds: number
  totalSlices: number
  lastSliceReceivedOn?: number
}

export const useDecoder = (state: Ref<sliceReducerState>): DecoderResult => {
  const callbackFunction = (data: string) => {
    if (!data) {
      return
    }
    try {
      const slice = unmarshalSlice(data)
      state.value = sliceReducer(state.value, {
        type: 'ADD_DATA',
        slice: slice
      })
    } catch (err) {}
    try {
      const unmarshaledDescriptor = unmarshalDescriptor(data)
      state.value = sliceReducer(state.value, { type: 'SET_DESCRIPTOR', descriptor: unmarshaledDescriptor })
      console.log(state)
    } catch (err) {}
  }

  const rawDataRate = calculateBitsPerSecond(state.value.rawDataRateBuffer)

  setInterval(() => {
    sliceReducer(state.value, { type: 'CALC_DRATE' })
  }, 1000)

  return {
    ready: () => (state.value.descriptor ? isDetermined(state.value.store) : false),
    descriptor: state.value.descriptor,
    availableSlices: () => individualSlicesInStore(state.value.store),
    totalSlices: state.value.store.length,
    determinedPercentage: () => determinedPercentage(state.value.store),
    determinedSlices: () => determinedSliceIndices(state.value.store),
    callbackFunction: callbackFunction,
    rawDataRateInBitsPerSeconds: rawDataRate,
    lastSliceReceivedOn: state.value.lastSliceReceivedOn === 0 ? undefined : state.value.lastSliceReceivedOn
  }
}
