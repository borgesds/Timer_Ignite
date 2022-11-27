import { differenceInSeconds } from 'date-fns'
import {
  createContext,
  ReactNode,
  useState,
  useReducer,
  useEffect,
} from 'react'
import {
  addNewCycleAction,
  interruptCurrentCycleAction,
  markCurrentCycleAsFinishedAction,
} from '../reducers/cycles/actions'
import { Cycle, cyclesReducer } from '../reducers/cycles/reducer'

interface CreateCycleData {
  task: string
  minutesAmount: number
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

export function CyclesContextProvider({
  children,
}: CyclesContextProviderProps) {
  const [cyclesState, dispatch] = useReducer(
    cyclesReducer,
    {
      cycles: [],
      activeCycleId: null,
    },
    () => {
      const storeStateAsJSON = localStorage.getItem(
        '@ignite-timer:cycles-state-1.0.0',
      )

      if (storeStateAsJSON) {
        return JSON.parse(storeStateAsJSON)
      }
    },
  )

  /* qual ciclo está ativo, 
     foi substituído por const {cycles, activeCycleId} = cyclesState */
  // const [activeCycleId, setActiveCycleId] = useState<string | null>(null)

  const { cycles, activeCycleId } = cyclesState

  /* vamos achar o id para rodar  */
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  /* armazenar a quantidade de segundos que se passou */
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
    if (activeCycle) {
      return differenceInSeconds(new Date(), new Date(activeCycle.startDate))
    }

    return 0
  })

  /* salvar no local storage a aplicação */
  useEffect(() => {
    const stateJSON = JSON.stringify(cyclesState)

    localStorage.setItem('@ignite-timer:cycles-state-1.0.0', stateJSON)
  }, [cyclesState])

  /* mandando a função armazenar a 
    quantidade de segundos que se passou para o Countdown */
  function setSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  /* Marcar um ciclo como finalizado, sera mandada para Countdown */
  function markCurrentCycleAsFinished() {
    dispatch(markCurrentCycleAsFinishedAction())
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
    dispatch(addNewCycleAction(newCycle))
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
    dispatch(interruptCurrentCycleAction())
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
