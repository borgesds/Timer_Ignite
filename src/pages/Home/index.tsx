import { HandPalm, Play } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'
import {
  CountdownContainer,
  FormContainer,
  HomeContainer,
  Separator,
  StartCountdownButton,
  TaskInput,
  MinutesAmountInput,
  StopCountdownButton,
} from './styles'

/* 

controlled ou uncrontrolled,
para o formulario vamos usar uma biblioteca:
react hook form

 */

/* validar os inputs para liberar o botão */
const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, 'Informe a tarefa'),
  minutesAmount: zod
    .number()
    .min(5, 'O intervalo deve ser no mínimo 5 minutos.')
    .max(60, 'O intervalo não pode ser maior que 60 minutos.'),
})

/* TS */
/* interface NewCycleFormData {
  task: string
  minutesAmount: number
} */

type NewCycleFormData = zod.infer<typeof newCycleFormValidationSchema>

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptedDate?: Date
  finishedDate?: Date
}

/* EXPORT */
export function Home() {
  const [cycles, setCycle] = useState<Cycle[]>([])
  /* qual ciclo está ativo */
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  /* armazenar a quantidade de segundos que se passou */
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  const { register, handleSubmit, watch, reset } = useForm<NewCycleFormData>({
    resolver: zodResolver(newCycleFormValidationSchema),
    /* passar um valor inicial para os inputs */
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })

  /* vamos achar o id para rodar */
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  /* total dos segundos do contador */
  const totalSeconds = activeCycle ? activeCycle.minutesAmount * 60 : 0

  /* 
    CONTADOR
    achar a diferença dos segundos,
    e ativar o contador
  */
  useEffect(() => {
    let interval: number

    if (activeCycle) {
      interval = setInterval(() => {
        const secondsDifference = differenceInSeconds(
          new Date(),
          activeCycle.startDate,
        )

        // se chegou ao final completa o ciclo
        if (secondsDifference >= totalSeconds) {
          // state == cycles
          setCycle((state) =>
            state.map((cycle) => {
              if (cycle.id === activeCycleId) {
                return { ...cycle, finishedDate: new Date() }
              } else {
                return cycle
              }
            }),
          )

          setAmountSecondsPassed(totalSeconds)

          clearInterval(interval)
        } else {
          setAmountSecondsPassed(secondsDifference)
        }
      }, 1000)
    }

    // dentro do useEffect podemos ter um retorno que sempre vai ser uma função
    return () => {
      clearInterval(interval)
    }
  }, [activeCycle, totalSeconds, activeCycleId])

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
    setCycle((state) => [...state, newCycle])

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
    setCycle((state) =>
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

  /* conta do total de segundos menos o que se passou */
  const currentSeconds = activeCycle ? totalSeconds - amountSecondsPassed : 0

  /* converter para minutos */
  const minutesAmount = Math.floor(currentSeconds / 60)

  /* converter os segundos restantes */
  const secondsAmount = currentSeconds % 60

  /* para tem 0 quando tiver so um carácter no contador */
  const minutes = String(minutesAmount).padStart(2, '0')
  const seconds = String(secondsAmount).padStart(2, '0')

  /* vamos atualizar o titulo da janela com o contador */
  useEffect(() => {
    if (activeCycle) {
      document.title = `Tarefa termina em ${minutes}:${seconds}`
    } else {
      document.title = `CronoS`
    }
  }, [minutes, seconds, activeCycle])

  // podemos observar o campo task em tempo real
  // o task aqui e o que esta em {...register('task')}
  const task = watch('task')

  // criar uma variavel para que quando digitar no input ative o botão
  // essa variavel é simplesmente para deixar o codigo mais legivel
  const isSubmitDisabled = !task

  return (
    <HomeContainer>
      <form action="" onSubmit={handleSubmit(handleCreateNewCycle)}>
        <FormContainer>
          <label htmlFor="task">Vou trabalhar em</label>
          <TaskInput
            id="task"
            list="task-suggestions"
            placeholder="Dê um nome para o seu projeto"
            disabled={!!activeCycle}
            {...register('task')}
          />

          {/* lista de sugestão para aparecer no input */}
          <datalist id="task-suggestions">
            <option value="Projeto 1" />
            <option value="Projeto 2" />
            <option value="Projeto 3" />
          </datalist>

          <label htmlFor="minutesAmount">Durante</label>
          <MinutesAmountInput
            type="number"
            id="minutesAmount"
            placeholder="00"
            step={5}
            min={5}
            max={60}
            disabled={!!activeCycle}
            {...register('minutesAmount', { valueAsNumber: true })}
          />

          <span>minutos.</span>
        </FormContainer>

        <CountdownContainer>
          <span>{minutes[0]}</span>
          <span>{minutes[1]}</span>
          <Separator>:</Separator>
          <span>{seconds[0]}</span>
          <span>{seconds[1]}</span>
        </CountdownContainer>

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
