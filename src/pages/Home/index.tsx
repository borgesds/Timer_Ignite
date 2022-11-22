import { HandPalm, Play } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { createContext, useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'
import {
  HomeContainer,
  StartCountdownButton,
  StopCountdownButton,
} from './styles'
import { NewCycleForm } from './components/NewCycleForm'
import { Countdown } from './components/Countdown'

/* 

controlled ou uncrontrolled,
para o formulario vamos usar uma biblioteca:
react hook form

 */

type NewCycleFormData = zod.infer<typeof newCycleFormValidationSchema>

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptedDate?: Date
  finishedDate?: Date
}

interface CyclesContextType {
  activeCycle: Cycle | undefined
  activeCycleId: string | null
}

export const CyclesContext = createContext({} as CyclesContextType)

/* EXPORT */
export function Home() {
  const [cycles, setCycles] = useState<Cycle[]>([])

  /* qual ciclo está ativo */
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)

  /* vamos achar o id para rodar */
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  /* puxar os inputs */
  function handleCreateNewCycle(data: NewCycleFormData) {
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
    setCycles((state) => [...state, newCycle])

    // ciclo ativo
    setActiveCycleId(id)

    /* aqui vai resetar os segundos para zero se criar
     um novo projeto em quanto tiver rodando contador */
    setAmountSecondsPassed(0)

    // limpa os campos e volta para defaultValues
    reset()
  }

  /* voltar para 0 o contador assim que interromper */
  function handleInterruptCycle() {
    // Retornar de dentro do ciclo se foi alterado ou não
    // state == cycles
    setCycles((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return { ...cycle, interruptedDate: new Date() }
        } else {
          return cycle
        }
      }),
    )

    // aqui dizemos que não temos nenhum ciclo ativo
    setActiveCycleId(null)
  }



  // podemos observar o campo task em tempo real
  // o task aqui e o que esta em {...register('task')}
  const task = watch('task')

  // criar uma variavel para que quando digitar no input ative o botão
  // essa variavel é simplesmente para deixar o codigo mais legivel
  const isSubmitDisabled = !task

  return (
    <HomeContainer>
      <form action="" onSubmit={handleSubmit(handleCreateNewCycle)}>
        <CyclesContext.Provider value={{ activeCycle, activeCycleId }}>
          <NewCycleForm />

          <Countdown/>
        </CyclesContext.Provider>

        {/* vamos atualizar o botão se ele tiver ativo ou não */}
        {activeCycleId ? (
          <StopCountdownButton onClick={handleInterruptCycle} type="button">
            <HandPalm size={24} />
            Interromper
          </StopCountdownButton>
        ) : (
          <StartCountdownButton type="submit" disabled={isSubmitDisabled}>
            <Play size={24} />
            Começar
          </StartCountdownButton>
        )}
      </form>
    </HomeContainer>
  )
}
