import { HandPalm, Play } from 'phosphor-react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { createContext, useState } from 'react'
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
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountSecondsPassed: number
  markCurrentCycleAsFinished: () => void // é uma função e n tem retorno
  setSecondsPassed: (seconds: number) => void
}

/* Exporta o que tive no CyclesContextType */
export const CyclesContext = createContext({} as CyclesContextType)

/* validar os inputs para liberar o botão */
const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, 'Informe a tarefa'),
  minutesAmount: zod
    .number()
    .min(5, 'O intervalo deve ser no mínimo 5 minutos.')
    .max(60, 'O intervalo não pode ser maior que 60 minutos.'),
})

type NewCycleFormData = zod.infer<typeof newCycleFormValidationSchema>

/* EXPORT */
export function Home() {
  const [cycles, setCycles] = useState<Cycle[]>([])

  /* qual ciclo está ativo */
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)

  /* armazenar a quantidade de segundos que se passou */
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  const newCycleForm = useForm<NewCycleFormData>({
    resolver: zodResolver(newCycleFormValidationSchema),
    /* passar um valor inicial para os inputs */
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })

  const { handleSubmit, watch, reset } = newCycleForm

  /* vamos achar o id para rodar  */
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  /* mandando a função armazenar a 
  quantidade de segundos que se passou para o Countdown */
  function setSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  /* Marcar um ciclo como finalizado, sera mandada para Countdown */
  function markCurrentCycleAsFinished() {
    setCycles((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return { ...cycle, finishedDate: new Date() }
        } else {
          return cycle
        }
      }),
    )
  }

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
        {/* o value esta mandando as funções para Countdown e NewCycleForm */}
        <CyclesContext.Provider
          value={{
            activeCycle,
            activeCycleId,
            markCurrentCycleAsFinished,
            amountSecondsPassed,
            setSecondsPassed,
          }}
        >
          <FormProvider {...newCycleForm}>
            <NewCycleForm />
          </FormProvider>

          <Countdown />
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
