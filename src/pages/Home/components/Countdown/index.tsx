import { differenceInSeconds } from 'date-fns'
import { useEffect, useContext } from 'react'
import { CyclesContext } from '../../../../contexts/CyclesContext'
import { CountdownContainer, Separator } from './styles'

export function Countdown() {
  /* busca dentro de Home o CyclesContext que esta exportando */
  const {
    activeCycle,
    activeCycleId,
    markCurrentCycleAsFinished,
    amountSecondsPassed,
    setSecondsPassed,
  } = useContext(CyclesContext)

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
          new Date(activeCycle.startDate),
        )

        // se chegou ao final completa o ciclo
        if (secondsDifference >= totalSeconds) {
          markCurrentCycleAsFinished()
          // state == cycles
          /* markCurrentCycleAsFinishe e o que vale:
          setCycles((state) =>
            state.map((cycle) => {
              if (cycle.id === activeCycleId) {
                return { ...cycle, finishedDate: new Date() }
              } else {
                return cycle
              }
            }),
          ) */

          setSecondsPassed(totalSeconds)

          clearInterval(interval)
        } else {
          setSecondsPassed(secondsDifference)
        }
      }, 1000)
    }

    // dentro do useEffect podemos ter um retorno que sempre vai ser uma função
    return () => {
      clearInterval(interval)
    }
  }, [
    activeCycle,
    totalSeconds,
    activeCycleId,
    setSecondsPassed,
    markCurrentCycleAsFinished,
  ])

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

  return (
    <CountdownContainer>
      <span>{minutes[0]}</span>
      <span>{minutes[1]}</span>
      <Separator>:</Separator>
      <span>{seconds[0]}</span>
      <span>{seconds[1]}</span>
    </CountdownContainer>
  )
}
