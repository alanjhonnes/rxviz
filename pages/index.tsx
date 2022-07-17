import React, { useEffect, useRef } from 'react';
import RxViz from '../components/RxViz';
import Head from 'next/head';
import {
  // Classes base
  Observable, Subject,
  // operadores de criação de Observables
  fromEvent,
  interval,
  of,
  combineLatest,
  forkJoin
} from 'rxjs';
import {
  // Operadores "pipeable", para serem utilizados dentro da função "pipe"
  mergeMap,
  switchMap,
  take,
  groupBy,
  map,
  mapTo,
  delay,
  share,
  filter,
  debounceTime,
  throttleTime,
  retry,
  reduce,
  scan,
  withLatestFrom,
  tap
} from 'rxjs/operators';

// Função do componente do React
export default function Index() {

  // função para simular uma requisição com possibilidade de dar algum erro.
  function simulateRequest(errorChance = 0.5, requestTime: number = 500) {
    return of([1, 2, 3])
      .pipe(
        delay(requestTime),
        tap(() => {
          if (Math.random() >= 1 - errorChance) {
            throw new Error("Erro")
          }
        })
      )
  }

  const inputRef = useRef<HTMLInputElement>(null);

  // Abaixo estão alguns observables já configurados para podermos manipular com operadores.

  // Esse observable emite um valor incremental a cada segundo, começando em 0
  const count$ = interval(1000).pipe(share());
  // Emite um mouse event sempre que a tela é clicada
  const click$ = new Subject<MouseEvent>();
  // Emite uma tupla com as coordenadas [x, y] do mouse sempre que ele se mover
  const mouseMove$ = new Subject<[x: number, y: number]>();
  // Emite o caractere digitado no campo de input
  const key$ = new Subject<string>()
  // Emite todo o texto do campo de input sempre que ele muda
  const input$ = new Subject<string>()


  useEffect(() => {
    // Abaixo adicionamos os listeners para emitir os eventos respectivos nos Subjects por meio do next()
    // Não é necessário alterar nada aqui nessa parte
    document.addEventListener('click', (e) => {
      click$.next(e)
    })
    document.addEventListener('mousemove', (e) => {
      mouseMove$.next([e.clientX, e.clientY])
    })
    inputRef.current?.addEventListener('keydown', (e) => {
      key$.next(e.key)
    })
    inputRef.current?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      input$.next(target.value)
    })

  })

  // Representa o tempo máximo representado na tela, ajuste para mais ou menos se preferir. Padrão de 30 segundos.
  const TIME = 30000

  //************************************************/
  //  SETAR ESSAS TRÊS CONSTANTES PARA REALIZAR OS TESTES
  const input1$ = count$
    .pipe(
      map(x => x * 2)
    );
  const input2$ = mouseMove$
    .pipe(
      throttleTime(300)
    );
  const output$ = count$
    .pipe(
      mergeMap((valor) => {
        return simulateRequest(valor / 10, 1000 * valor)
      })
    );

    // Array de observables que será renderizado na tela
  const observables: Observable<any>[] = [
    count$,
    click$,
    mouseMove$,
    key$,
    input$,
    input1$,
    input2$,
    output$,
  ]






  /************************************************/

  return (

    <div className="container" style={{ margin: "15px" }}>
      <Head>
        <title>RxViz - Devschool</title>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono|Montserrat:700"
          rel="stylesheet"
        />
        <style>{`body { margin: 0; }`}</style>
      </Head>
      <input id='input' ref={inputRef} />
      {observables.map((obs$) => <RxViz
        timeWindow={TIME}
        observable$={obs$}
      />)}
    </div>
  )
}

