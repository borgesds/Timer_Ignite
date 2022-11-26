import { createContext, ReactNode, useState, useReducer } from 'react'

interface CreateCycleData {
  task: string
  minutesAmount: number
}

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptedDate?: Date
  finishedDate?: Date
}

/* Tudo que vai ser usado no createContext */
interface CyclesContextType {
  cycles: Cycle[]
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountSecondsPassed: number
  markCurrentCycleAsFinished: () => void // é uma função e n tem retorno
  setSecondsPassed: (seconds: number) => void
  createNewCycle: (data: CreateCycleData) => void
  interruptCurrentCycle: () => void
}

/* Exporta o que tive no CyclesContextType */
export const CyclesContext = createContext({} as CyclesContextType)

interface CyclesContextProviderProps {
  children: ReactNode // Retorna qualquer html ou jsx valido
}

interface CyclesState {
  cycles: Cycle[]
  activeCycleId: string | null
}

export function CyclesContextProvider({
  children,
}: CyclesContextProviderProps) {
  const [cyclesState, dispatch] = useReducer(
    (state: CyclesState, action: any) => {
      if (action.type === 'ADD_NEW_CYCLE') {
        return {
          ...state,
          cycles: [...state.cycles, action.payload.newCycle],
          // pega o Id do newCycle e coloca como Id ativo
          activeCycleId: action.payload.newCycle.id,
        }
      }

      if (action.type === 'INTERRUPT_CURRENT_CYCLE') {
        return {
          ...state,
          cycles: state.cycles.map((cycle) => {
            if (cycle.id === state.activeCycleId) {
              return { ...cycle, interruptedDate: new Date() }
            } else {
              return cycle
            }
          }),
          activeCycleId: null,
        }
      }
      return state
    },
    {
      cycles: [],
      activeCycleId: null,
    },
  )

  /* qual ciclo está ativo, 
     foi substituído por const {cycles, activeCycleId} = cyclesState */
  // const [activeCycleId, setActiveCycleId] = useState<string | null>(null)

  /* armazenar a quantidade de segundos que se passou */
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  const { cycles, activeCycleId } = cyclesState

  /* vamos achar o id para rodar  */
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  /* mandando a função armazenar a 
    quantidade de segundos que se passou para o Countdown */
  function setSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  /* Marcar um ciclo como finalizado, sera mandada para Countdown */
  function markCurrentCycleAsFinished() {
    dispatch({
      type: 'MARK_CURRENT_CYCLE_AS_FINISHED',
      payload: {
        activeCycleId,
      },
    })
    // setCycles((state) =>
    //   state.map((cycle) => {
    //     if (cycle.id === activeCycleId) {
    //       return { ...cycle, finishedDate: new Date() }
    //     } else {
    //       return cycle
    //     }
    //   }),
    // )
  }

  /* puxar os inputs */
  function createNewCycle(data: CreateCycleData) {
    const id = String(new Date().getTime())

    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    /* 
    setCycle([...cycle, newCycle]) representa:
    pegue o stado atual do cycle armazenado e
    adicione o proximo input 
    */
    dispatch({
      type: 'ADD_NEW_CYCLE',
      payload: {
        newCycle,
      },
    })
    // setCycles((state) => [...state, newCycle])

    // ciclo ativo
    // foi para dentro do useReducer la em cima
    // setActiveCycleId(id)

    /* aqui vai resetar os segundos para zero se criar
    um novo projeto em quanto tiver rodando contador */
    setAmountSecondsPassed(0)
  }

  /* voltar para 0 o contador assim que interromper */
  function interruptCurrentCycle() {
    dispatch({
      type: 'INTERRUPT_CURRENT_CYCLE',
      payload: {
        activeCycleId,
      },
    })
    // Retornar de dentro do ciclo se foi alterado ou não
    // state == cycles
    // setCycles((state) =>
    //   state.map((cycle) => {
    //     if (cycle.id === activeCycleId) {
    //       return { ...cycle, interruptedDate: new Date() }
    //     } else {
    //       return cycle
    //     }
    //   }),
    // )

    // aqui dizemos que não temos nenhum ciclo ativo
    // foi para dentro do useReducer la em cima
    // setActiveCycleId(null)
  }

  return (
    /* o value esta mandando as funções para 
    Countdown, NewCycleForm e History */
    <CyclesContext.Provider
      value={{
        cycles,
        activeCycle,
        activeCycleId,
        markCurrentCycleAsFinished,
        amountSecondsPassed,
        setSecondsPassed,
        createNewCycle,
        interruptCurrentCycle,
      }}
    >
      {/* esta buscando dentro do app a Route como filho */}
      {children}
    </CyclesContext.Provider>
  )
}
