/**
 * Changoku Internationalization (i18n) Dictionary & Step Translator
 * Supports Chilean Spanish ('es') and English ('en')
 */

export const TRANSLATIONS = {
  es: {
    langCode: 'es',
    langLabel: '🇨🇱 Español (Chile)',
    appTitle: 'Changoku',
    appSubtitle: 'Labs',
    btnThemeLight: '☀️ Día',
    btnThemeDark: '🌙 Noche',
    toastThemeLight: '☀️ Modo Día (Alto Contraste) activado',
    toastThemeDark: '🌙 Modo Noche activado',

    // Navigation Tabs
    tabPlay: 'Jugar y Practicar',
    tabVisualizer: 'Visualizador de Técnicas',
    tabTheory: 'Teoría y Matemáticas',

    // Play Board Actions
    btnErase: '⌫ Borrar',
    btnNotes: '✎ Notas a Lápiz',
    btnAutoCand: '⚡ Auto-Notas',
    btnHint: '💡 Pista',
    btnCheckErrors: '🔍 Revisar',
    btnUndo: '↩ Deshacer',
    btnRedo: '↪ Rehacer',
    btnSolve: '✓ Resolver',

    // Generator & Controls
    generatorTitle: '🎲 Nuevo Juego Libre (Al Tiro)',
    diffEasy: 'Fácil',
    diffMedium: 'Medio',
    diffHard: 'Difícil',
    diffExpert: 'Experto',
    btnNewGame: 'Nuevo Juego',
    btnImport: 'Importar',
    btnExport: 'Exportar / Debug',

    // Daily Challenge & Streak
    dailyTitle: '📅 Desafío Diario',
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesFull: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    streakFormat: (s) => `🔥 Racha: ${s} ${s === 1 ? 'día' : 'días'}`,
    btnPlayDaily: '📅 Jugar Desafío de Hoy',
    btnPlayingDaily: '📅 Jugando Desafío de Hoy',
    btnCompletedDaily: '✅ Desafío de Hoy Completado',
    btnShareResult: '📲 Compartir',
    dailyLoadedBanner: (dayName, diff, clues) => `📅 Desafío Diario (${dayName} • ${diff}) cargado con ${clues} pistas. ¡Todo el mundo juega este mismo tablero hoy!`,
    toastDailyLoaded: (dayName, diff) => `📅 Desafío del ${dayName} (${diff}) listo`,
    toastJokerUsed: (used, streak, rem) =>
      `🃏 ¡Comodín aplicado (${used})! Salvaste tu racha de ${streak} días (te ${rem === 1 ? 'queda 1 comodín' : `quedan ${rem} comodines`}).`,
    toastShareCopied: '📲 ¡Resultado copiado para WhatsApp!',
    shareTextFormat: ({ isDaily, dateStr, dayName, diffLabel, timeStr, hintsUsed, streak }) => [
      isDaily
        ? `🧩 *Changoku Diario #${dateStr}* (${dayName} • ${diffLabel})`
        : `🧩 *Changoku* (${diffLabel})`,
      `✅ ¡Completado sin errores!`,
      `⏱️ Tiempo: ${timeStr} • 💡 Pistas: ${hintsUsed}`,
      `🔥 Racha diaria: ${streak} ${streak === 1 ? 'día' : 'días'}`
    ].join('\n'),

    // Status & Hints
    statusTitle: 'ℹ️ Estado del Tablero',
    statsFormat: (filled, conflicts, timeStr) => `Completados: ${filled}/81 • Conflictos: ${conflicts}${timeStr ? ` • ⏱️ ${timeStr}` : ''}`,
    defaultHintBanner: 'Toca <strong>"💡 Pista"</strong> para ver el siguiente paso lógico explicado paso a paso, o activa <strong>"⚡ Auto-Notas"</strong> para ver los candidatos.',
    newGameLoadedBanner: (diff, clues) => `Nuevo Changoku nivel ${diff} listo con ${clues} pistas iniciales. ¡Mucho éxito!`,

    // Keyboard & Touch Guide
    controlsTitle: '📱 Cómo Jugar',
    controlsList: [
      '• <strong>Toca una casilla</strong> y luego elige un número del <strong>1 al 9</strong>.',
      '• <strong>✎ Notas a Lápiz</strong>: Anota numeritos candidatos chiquititos en la casilla.',
      '• <strong>💡 Pista</strong>: Te explica qué número poner y por qué.',
      '• <strong>🔍 Revisar</strong>: Revisa si vas bien o si algún número se chispoteó.'
    ],

    // Toasts & Alerts
    toastCompleted: '🎉 ¡Seca! ¡Completaste el Changoku perfecto!',
    toastNoteOn: '✎ Modo Notas a Lápiz ACTIVADO',
    toastNoteOff: '✎ Modo Notas a Lápiz DESACTIVADO',
    toastAutoCandOn: '⚡ Auto-notas activadas',
    toastAutoCandOff: '⚡ Auto-notas ocultadas',
    toastNoErrors: '✓ ¡Impecable! Todos los números que pusiste van súper bien.',
    toastErrorsFound: (count) => `⚠️ Ojo: hay ${count} ${count === 1 ? 'número incorrecto marcado' : 'números incorrectos marcados'} en rojo.`,
    confirmSolve: '¿Quieres resolver todo el tablero automáticamente?',
    toastSolved: '✓ ¡Tablero resuelto!',
    toastGenerating: 'Generando un nuevo Changoku al tiro...',
    toastReady: (diff, clues) => `¡Listo! Nivel ${diff} (${clues} pistas)`,
    promptImport: 'Pega un código de Sudoku de 81 caracteres (. o 0 para vacíos):',
    toastImported: '¡Tablero cargado al tiro!',
    toastTransferred: '¡Tablero de estudio pasado al modo Jugar!',
    toast17Loaded: '¡Sudoku mínimo de 17 pistas cargado para jugar!',
    toastCopiedInitial: '¡Código inicial copiado!',
    toastCopiedCurrent: '¡Estado actual copiado!',

    // Export Modal
    modalTitle: '📋 Exportar y Diagnóstico del Tablero',
    modalInitialLabel: 'Tablero Inicial (81 caracteres):',
    modalCurrentLabel: 'Estado Actual (con tus números):',
    modalDiagLabel: 'Diagnóstico del Solucionador:',
    btnCopy: 'Copiar',

    // Visualizer UI
    visGroupBasic: 'Deducciones Básicas',
    visGroupIntersections: 'Intersecciones',
    visGroupSubsets: 'Subconjuntos (Pares y Tríos)',
    visGroupFish: 'Patrones Pez (Fish)',
    visGroupWings: 'Patrones Ala (Wings)',
    legendBase: 'Celdas Base',
    legendPivot: 'Pivote',
    legendWing: 'Alas',
    legendTarget: 'Celdas Afectadas',
    legendElim: 'Candidato Eliminado',
    labelCoreRule: 'Regla Clave:',
    labelDeductionStep: 'Paso Lógico en este Tablero:',
    btnApplyDeduction: 'Aplicar Deducción',
    btnAppliedDeduction: '✓ Deducción Aplicada',
    btnResetScenario: 'Reiniciar Ejemplo',
    btnTransferPlay: 'Jugar este Tablero ↗',
    appliedSuccessHtml: '<span style="color: var(--success); font-weight: bold;">✓ ¡Deducción Aplicada!</span> El cambio lógico se aplicó en el tablero.',

    // Difficulties map
    difficultyNames: {
      'Very Easy': 'Muy Fácil',
      'Easy': 'Fácil',
      'Medium': 'Medio',
      'Hard': 'Difícil',
      'Expert / Master': 'Experto / Maestro',
      'Master': 'Maestro',
      'Basic': 'Básico'
    },

    // Elaborated Technique Catalog in Spanish
    techniques: {
      naked_single: {
        sidebarName: 'Sencillo Desnudo',
        name: 'Sencillo Desnudo (Naked Single)',
        category: 'Básico',
        difficulty: 'Muy Fácil',
        rule: 'Si en una casilla solo queda un único número candidato posible (porque los otros 8 números ya están presentes en su misma fila, columna o bloque 3×3), ese número DEBE ir ahí sí o sí.',
        summary: 'Una casilla tiene un solo candidato posible.'
      },
      hidden_single: {
        sidebarName: 'Sencillo Oculto',
        name: 'Sencillo Oculto (Hidden Single)',
        category: 'Básico',
        difficulty: 'Fácil',
        rule: 'Si dentro de una fila, columna o bloque 3×3 hay un número que solo puede ir en una única casilla, debe colocarse ahí aunque esa casilla tenga otras notas a lápiz.',
        summary: 'Un número solo tiene un lugar posible dentro de toda una fila, columna o bloque.'
      },
      pointing_pair: {
        sidebarName: 'Candidatos Apuntadores',
        name: 'Candidatos Apuntadores (Pointing)',
        category: 'Intersecciones',
        difficulty: 'Medio',
        rule: 'Si dentro de un bloque 3×3 un candidato aparece únicamente alineado en una misma fila o columna, ese número irá obligatoriamente en esa intersección y se puede borrar del resto de esa fila o columna fuera del bloque.',
        summary: 'En un bloque 3×3, un candidato está alineado en una sola fila o columna.'
      },
      box_line_reduction: {
        sidebarName: 'Reducción Línea-Bloque',
        name: 'Reducción Línea-Bloque (Claiming)',
        category: 'Intersecciones',
        difficulty: 'Medio',
        rule: 'Si a lo largo de una fila o columna todas las casillas donde puede ir un número caen dentro de un mismo bloque 3×3, esa línea "reclama" el número para ese bloque y se puede borrar ese candidato del resto del bloque.',
        summary: 'En una fila o columna, un candidato aparece únicamente dentro de un bloque 3×3.'
      },
      naked_pair: {
        sidebarName: 'Par Desnudo',
        name: 'Par Desnudo (Naked Pair)',
        category: 'Subconjuntos',
        difficulty: 'Medio',
        rule: 'Si dos casillas de la misma fila, columna o bloque tienen exactamente los mismos dos candidatos {A, B} y ningún otro, esos dos números ocuparán sí o sí esas dos casillas. Puedes borrar A y B del resto de esa unidad.',
        summary: 'Dos casillas comparten únicamente los mismos dos candidatos {A, B}.'
      },
      hidden_pair: {
        sidebarName: 'Par Oculto',
        name: 'Par Oculto (Hidden Pair)',
        category: 'Subconjuntos',
        difficulty: 'Medio',
        rule: 'Si dos números {A, B} aparecen como candidatos únicamente en las mismas dos casillas de una fila, columna o bloque (escondidos junto a otras notas), A y B deben ir en esas dos casillas y puedes borrar todos los demás candidatos sobrantes en ellas.',
        summary: 'Dos números candidatos solo existen en dos casillas de toda una unidad.'
      },
      naked_triple: {
        sidebarName: 'Trío Desnudo',
        name: 'Trío Desnudo (Naked Triple)',
        category: 'Subconjuntos',
        difficulty: 'Difícil',
        rule: 'Si tres casillas de una misma fila, columna o bloque contienen únicamente candidatos de un grupo de tres números {A, B, C} (por ejemplo AB, BC y AC), esos tres números quedan bloqueados ahí y se eliminan del resto de la unidad.',
        summary: 'Tres casillas se reparten tres candidatos {A, B, C}.'
      },
      hidden_triple: {
        sidebarName: 'Trío Oculto',
        name: 'Trío Oculto (Hidden Triple)',
        category: 'Subconjuntos',
        difficulty: 'Difícil',
        rule: 'Si tres números {A, B, C} solo pueden ir en tres casillas dentro de una fila, columna o bloque, esas tres casillas están reservadas para {A, B, C} y cualquier otro candidato distinto dentro de ellas se puede eliminar.',
        summary: 'Tres dígitos candidatos aparecen solo en tres casillas de una unidad.'
      },
      x_wing: {
        sidebarName: 'X-Wing',
        name: 'X-Wing (Cruz en Rectángulo)',
        category: 'Peces',
        difficulty: 'Difícil',
        rule: 'Cuando un candidato aparece exactamente en 2 casillas en dos filas distintas y ambas caen en las mismas 2 columnas (formando un rectángulo), el número irá obligatoriamente en esquinas opuestas. Se elimina ese candidato del resto de ambas columnas (o filas).',
        summary: 'Un candidato forma un rectángulo perfecto en 2 filas y 2 columnas.'
      },
      swordfish: {
        sidebarName: 'Swordfish',
        name: 'Swordfish (Pez Espada 3×3)',
        category: 'Peces',
        difficulty: 'Maestro',
        rule: 'Es la versión 3×3 del X-Wing: si a través de 3 filas un candidato aparece únicamente dentro de las mismas 3 columnas (2 o 3 veces por fila), queda bloqueado en esas intersecciones y se elimina de todas las demás casillas de esas 3 columnas.',
        summary: 'En 3 filas, un candidato se restringe a las mismas 3 columnas.'
      },
      xy_wing: {
        sidebarName: 'XY-Wing (Y-Wing)',
        name: 'XY-Wing (Ala en Y)',
        category: 'Alas',
        difficulty: 'Maestro',
        rule: 'Una casilla pivote con dos candidatos {A, B} ve a dos casillas "alas" con {A, C} y {B, C}. Sea cual sea el valor del pivote (A o B), una de las dos alas tendrá que ser C. Por lo tanto, cualquier casilla que vea a AMBAS alas no puede contener C.',
        summary: 'Un pivote {A, B} conecta con dos alas {A, C} y {B, C} para eliminar C.'
      }
    },

    // Theory & Combinatorics Section in Spanish
    theory: {
      heroTitle: 'Matemáticas, Complejidad y Combinatoria del Sudoku',
      heroSubtitle: 'Respuestas claras sobre teoría de juegos, cantidad de tableros posibles, generación al tiro y límites matemáticos.',
      q1Title: '1. ¿Es el Sudoku un Juego "Resuelto"?',
      q1Intro: 'En matemáticas y teoría de juegos, decir que un juego está "resuelto" depende de qué pregunta estemos haciendo:',
      stat1Label: 'Tableros 9×9 Válidos Totales',
      stat2Label: 'Tableros Esencialmente Únicos',
      stat3Label: 'Mínimo de Pistas para Solución Única',
      stat4Val: 'NP-Completo',
      stat4Label: 'Complejidad en Tableros N×N',
      q1P1: '• <strong>Para el Sudoku estándar de 9×9:</strong> Sí, está completamente analizado y resuelto computacionalmente. En 2005, Bertram Felgenhauer y Frazer Jarvis demostraron que el número exacto de tableros válidos completos de 9×9 es <strong>6.670.903.752.021.072.936.960</strong>. Si descontamos las simetrías (rotaciones, reflejos, reordenar filas/columnas y cambiarle el nombre a los números), Ed Russell y Frazer Jarvis demostraron que existen exactamente <strong>5.472.730.538</strong> tableros esencialmente distintos.',
      q1P2: '• <strong>La Prueba del Mínimo de 17 Pistas:</strong> En enero de 2012, Gary McGuire, Bastian Tugemann y Gilles Civario demostraron tras 7,1 millones de horas de supercomputador que <em>ningún Sudoku de 16 pistas puede tener jamás una solución única</em>. El mínimo matemático para que un Sudoku tenga solución única es de <strong>17 pistas</strong>.',
      q1P3: '• <strong>Para Sudokus generalizados de N×N (n² × n²):</strong> Determinar si un tablero gigante arbitrario tiene solución es un problema <strong>NP-completo</strong> (demostrado por Takayuki Yato y Takahiro Seta en 2003). Mientras un computador o celular resuelve un tablero de 9×9 en menos de un milisegundo, escalarlo a 100×100 vuelve el problema intratable en el peor caso.',
      btnLoad17: '🎮 Cargar el Sudoku de 17 Pistas de McGuire para Jugar',
      btnVerify17: '⚡ Probar Velocidad de Verificación (17 Pistas)',
      verify17Result: (ms, count) => `Resultado: ¡Verificado en ${ms} ms! Existe exactamente ${count} solución única (Benchmark de la prueba de Gary McGuire 2012).`,

      q2Title: '2. ¿Podemos Generar Todas las Combinaciones?',
      q2Intro: 'Depende de si hablamos de <strong>tableros llenos terminados</strong> o de <strong>puzzles iniciales con pistas</strong>:',
      q2P1: '• <strong>Los 6,67 × 10²¹ Tableros Completos:</strong> Imprimirlos o generarlos todos uno por uno es imposible a escala humana. Incluso si un computador generara 1.000 millones de tableros por segundo sin parar, tardaría <strong>211.000 años</strong> en listarlos todos. Guardarlos en texto sin comprimir ocuparía unos <strong>540.000 exabytes</strong>.',
      q2P2: '• <strong>Las 5.472 Millones de Clases de Simetría:</strong> <strong>¡Sí!</strong> Esto ya se hizo. Las 5.472.730.538 familias fundamentales han sido catalogadas e indexadas por matemáticos en bases de datos comprimidas de entre 40 y 60 gigabytes.',
      q2P3: '• <strong>Todos los Puzzles Válidos (Pistas Iniciales):</strong> El espacio de configuraciones parciales es de alrededor de 3<sup>81</sup> ≈ 4,4 × 10<sup>38</sup>. Incluso filtrando solo los que tienen solución única quedan entre 10<sup>30</sup> y 10<sup>35</sup> puzzles posibles. Guardarlos todos es físicamente imposible, ¡y por eso las aplicaciones modernas los generan <em>al tiro en el momento</em>!',

      q3Title: '3. ¿Se Generan en el Momento o Alguien los Diseña a Mano?',
      q3Intro: '<strong>¡Casi todos los Sudokus digitales modernos se generan 100% en el momento (al tiro)!</strong>',
      q3P1: 'Este es el algoritmo exacto de 4 etapas que usan los motores modernos (y que corre directamente aquí en tu navegador o teléfono):',
      codeFlow: `1. GENERACIÓN DEL TABLERO COMPLETO:
   Se parte con un tablero 9×9 vacío.
   Se rellenan las casillas usando backtracking aleatorio con propagación de restricciones (heurística MRV).
   Tarda: ~1 a 3 milisegundos.

2. EXCAVACIÓN SIMÉTRICA DE PISTAS:
   Se agrupan las casillas en pares con simetría rotacional de 180°: (r, c) y (8-r, 8-c).
   Se mezclan los pares al azar.
   Para cada par:
     Se borran temporalmente ambos números.
     Se comprueba unicidad: countSolutions(board, limit=2) === 1.
     Si sigue teniendo solución única: ¡se dejan vacías!
     Si queda ambiguo (>1 solución): ¡se restauran los números!

3. META DE DIFICULTAD:
   Se sigue excavando hasta llegar a la cantidad de pistas buscada:
   Fácil (35-40 pistas) • Medio (29-34 pistas) • Difícil (25-28 pistas) • Experto (21-24 pistas).

4. EVALUACIÓN LÓGICA HUMANA:
   Se ejecuta el solucionador lógico paso a paso (Sencillos → Pares → Intersecciones → X-Wing → Alas).
   ¡Se clasifica la dificultad según la técnica más avanzada necesaria para resolverlo sin adivinar!`,
      q3P2: '<strong>¿Por qué antes se diseñaban a mano?</strong> En los años 80 y 90, la editorial japonesa <em>Nikoli</em> (liderada por Maki Kaji) popularizó los Sudokus hechos a mano. Sus creadores trataban cada puzzle como una obra de arte, exigiendo simetría rotacional de 180° y pasos lógicos elegantes sin adivinar. Hoy en día, los algoritmos aplican esas mismas reglas estéticas y lógicas automáticamente en pocos milisegundos.',
      benchTitle: '⚡ Prueba en Vivo del Generador en tu Navegador',
      benchDesc: 'Toca el botón de abajo para poner a prueba el motor ahora mismo. Generará 5 Changokus nuevos, con solución única garantizada y simetría de 180°, midiendo cuánto tarda:',
      btnRunBench: 'Ejecutar Prueba de Velocidad en Vivo',
      benchInitialOutput: 'Toca "Ejecutar Prueba de Velocidad en Vivo" para medir el rendimiento del generador...',
      benchRunning: 'Ejecutando prueba en vivo (generando 5 Sudokus únicos con simetría de 180°)...',
      benchResult: (avgTime, totalTime, cluesStr, allUnique) => [
        `⚡ ¡Prueba Completada!`,
        `• Puzzles Generados: 5 Changokus únicos (simetría rotacional de 180°)`,
        `• Tiempo Promedio por Puzzle: ${avgTime} ms`,
        `• Tiempo Total de Ejecución: ${totalTime} ms`,
        `• Cantidad de Pistas: [${cluesStr}]`,
        `• Verificación de Solución Única: ${allUnique ? '100% Únicos Garantizados (countSolutions === 1)' : 'Falló'}`,
        `• Conclusión: ¡Sí! Se pueden crear infinitos Sudokus de alta calidad al tiro en milisegundos.`
      ].join('\n')
    }
  },

  en: {
    langCode: 'en',
    langLabel: '🇬🇧 English',
    appTitle: 'Changoku',
    appSubtitle: 'Labs',
    btnThemeLight: '☀️ Light',
    btnThemeDark: '🌙 Dark',
    toastThemeLight: '☀️ Light Mode (High Contrast) enabled',
    toastThemeDark: '🌙 Dark Mode enabled',

    // Navigation Tabs
    tabPlay: 'Play & Study',
    tabVisualizer: 'Technique Visualizer',
    tabTheory: 'Combinatorics & Theory',

    // Play Board Actions
    btnErase: '⌫ Erase',
    btnNotes: '✎ Pencil Notes',
    btnAutoCand: '⚡ Auto-Pencil',
    btnHint: '💡 Hint',
    btnCheckErrors: '🔍 Check Errors',
    btnUndo: '↩ Undo',
    btnRedo: '↪ Redo',
    btnSolve: '✓ Solve',

    // Generator & Controls
    generatorTitle: '🎲 Free Play Generator (On-The-Fly)',
    diffEasy: 'Easy',
    diffMedium: 'Medium',
    diffHard: 'Hard',
    diffExpert: 'Expert',
    btnNewGame: 'New Game',
    btnImport: 'Import',
    btnExport: 'Export / Debug',

    // Daily Challenge & Streak
    dailyTitle: '📅 Daily Challenge',
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayNamesFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    streakFormat: (s) => `🔥 Streak: ${s} ${s === 1 ? 'day' : 'days'}`,
    btnPlayDaily: '📅 Play Today\'s Challenge',
    btnPlayingDaily: '📅 Playing Today\'s Challenge',
    btnCompletedDaily: '✅ Today\'s Challenge Completed',
    btnShareResult: '📲 Share',
    dailyLoadedBanner: (dayName, diff, clues) => `📅 Daily Challenge (${dayName} • ${diff}) loaded with ${clues} clues. Everyone gets this exact board today!`,
    toastDailyLoaded: (dayName, diff) => `📅 ${dayName} Daily (${diff}) ready!`,
    toastJokerUsed: (used, streak, rem) =>
      `🃏 Streak Joker applied (${used})! Saved your ${streak}-day streak (${rem} ${rem === 1 ? 'joker' : 'jokers'} left).`,
    toastShareCopied: '📲 Result copied for WhatsApp!',
    shareTextFormat: ({ isDaily, dateStr, dayName, diffLabel, timeStr, hintsUsed, streak }) => [
      isDaily
        ? `🧩 *Daily Changoku #${dateStr}* (${dayName} • ${diffLabel})`
        : `🧩 *Changoku* (${diffLabel})`,
      `✅ Solved cleanly!`,
      `⏱️ Time: ${timeStr} • 💡 Hints: ${hintsUsed}`,
      `🔥 Daily Streak: ${streak} ${streak === 1 ? 'day' : 'days'}`
    ].join('\n'),

    // Status & Hints
    statusTitle: 'ℹ️ Board Status',
    statsFormat: (filled, conflicts, timeStr) => `Filled: ${filled}/81 • Conflicts: ${conflicts}${timeStr ? ` • ⏱️ ${timeStr}` : ''}`,
    defaultHintBanner: 'Click <strong>"💡 Hint"</strong> to detect the next logical deduction step, or enable <strong>"⚡ Auto-Pencil"</strong> to display all candidate pencil marks.',
    newGameLoadedBanner: (diff, clues) => `New ${diff} puzzle loaded with ${clues} clues.`,

    // Keyboard & Touch Guide
    controlsTitle: '⌨️ Controls & How to Play',
    controlsList: [
      '• <strong>1 - 9</strong>: Place digit or toggle candidate note',
      '• <strong>Backspace / Delete</strong>: Clear selected cell',
      '• <strong>Arrow Keys / Tap</strong>: Navigate grid',
      '• <strong>N / ✎ Button</strong>: Toggle Pencil note mode'
    ],

    // Toasts & Alerts
    toastCompleted: '🎉 Congratulations! You successfully solved the Changoku!',
    toastNoteOn: 'Pencil Mode ON',
    toastNoteOff: 'Pencil Mode OFF',
    toastAutoCandOn: 'Auto-candidates enabled',
    toastAutoCandOff: 'Auto-candidates cleared',
    toastNoErrors: '✓ Great job! All entered numbers match the solution.',
    toastErrorsFound: (count) => `⚠️ Found ${count} incorrect ${count === 1 ? 'number' : 'numbers'} (highlighted in red)!`,
    confirmSolve: 'Solve the remaining board automatically?',
    toastSolved: 'Board solved!',
    toastGenerating: 'Generating new puzzle on the fly...',
    toastReady: (diff, clues) => `Ready! ${diff} (${clues} clues)`,
    promptImport: 'Paste an 81-character Sudoku string (. or 0 for empty):',
    toastImported: 'Custom puzzle loaded!',
    toastTransferred: 'Technique board transferred to Play mode!',
    toast17Loaded: '17-Clue Minimum Puzzle loaded into Play board!',
    toastCopiedInitial: 'Initial puzzle copied to clipboard!',
    toastCopiedCurrent: 'Current state copied to clipboard!',

    // Export Modal
    modalTitle: '📋 Export & Board Debug Info',
    modalInitialLabel: 'Initial Puzzle (81-char string):',
    modalCurrentLabel: 'Current Board State (with your entries):',
    modalDiagLabel: 'Solver Diagnostics:',
    btnCopy: 'Copy',

    // Visualizer UI
    visGroupBasic: 'Basic Deductions',
    visGroupIntersections: 'Intersections',
    visGroupSubsets: 'Subsets',
    visGroupFish: 'Fish Techniques',
    visGroupWings: 'Wing Patterns',
    legendBase: 'Base Cells',
    legendPivot: 'Pivot',
    legendWing: 'Wings',
    legendTarget: 'Affected Peers',
    legendElim: 'Eliminated Candidate',
    labelCoreRule: 'Core Rule:',
    labelDeductionStep: 'Deduction Step:',
    btnApplyDeduction: 'Apply Deduction',
    btnAppliedDeduction: '✓ Deduction Applied',
    btnResetScenario: 'Reset Scenario',
    btnTransferPlay: 'Transfer to Play Board ↗',
    appliedSuccessHtml: '<span style="color: var(--success); font-weight: bold;">✓ Deduction Applied!</span> The highlighted deduction has been executed on the board.',

    difficultyNames: {
      'Very Easy': 'Very Easy',
      'Easy': 'Easy',
      'Medium': 'Medium',
      'Hard': 'Hard',
      'Expert / Master': 'Expert / Master',
      'Master': 'Master',
      'Basic': 'Basic'
    },

    // Elaborated Technique Catalog in English (matching the rich Spanish explanations)
    techniques: {
      naked_single: {
        sidebarName: 'Naked Single',
        name: 'Naked Single',
        category: 'Basic',
        difficulty: 'Very Easy',
        rule: 'If a cell has only one possible candidate digit remaining (because all other 8 digits already appear in its row, column, or 3×3 box), that digit MUST be placed in this cell.',
        summary: 'A cell has only one possible candidate remaining.'
      },
      hidden_single: {
        sidebarName: 'Hidden Single',
        name: 'Hidden Single',
        category: 'Basic',
        difficulty: 'Easy',
        rule: 'If within a row, column, or 3×3 box a candidate digit can only fit in one single cell, it must be placed there even if that cell currently has other pencil-mark notes.',
        summary: 'A digit has only one legal cell inside an entire row, column, or box.'
      },
      pointing_pair: {
        sidebarName: 'Pointing Candidates',
        name: 'Pointing Pairs / Triples',
        category: 'Intersections',
        difficulty: 'Medium',
        rule: 'If inside a 3×3 box all candidates for a digit are aligned within a single row or column, that digit is locked into that intersection and can be eliminated from the rest of that row or column outside the box.',
        summary: 'Inside a 3×3 box, a candidate is confined entirely to one row or column.'
      },
      box_line_reduction: {
        sidebarName: 'Box-Line Reduction',
        name: 'Box-Line Reduction (Claiming)',
        category: 'Intersections',
        difficulty: 'Medium',
        rule: 'If along a row or column all cells that can hold a digit fall inside a single 3×3 box, that line "claims" the digit for that box and the candidate can be eliminated from all other cells in that 3×3 box.',
        summary: 'Along a row or column, a candidate appears only within one 3×3 box.'
      },
      naked_pair: {
        sidebarName: 'Naked Pair',
        name: 'Naked Pair',
        category: 'Subsets',
        difficulty: 'Medium',
        rule: 'If two cells in the same row, column, or box contain the exact same two candidates {A, B} and no others, those two digits must occupy those two cells. You can eliminate A and B from all other cells in that unit.',
        summary: 'Two cells in the same unit share only the exact same two candidates {A, B}.'
      },
      hidden_pair: {
        sidebarName: 'Hidden Pair',
        name: 'Hidden Pair',
        category: 'Subsets',
        difficulty: 'Medium',
        rule: 'If two digits {A, B} appear as candidates only in the same two cells within a row, column, or box (hidden alongside other notes), A and B are locked into those two cells and all other candidates in those two cells can be removed.',
        summary: 'Two candidate digits only exist in two cells of an entire unit.'
      },
      naked_triple: {
        sidebarName: 'Naked Triple',
        name: 'Naked Triple',
        category: 'Subsets',
        difficulty: 'Hard',
        rule: 'If three cells in the same row, column, or box contain only candidates from a three-digit set {A, B, C} (such as AB, BC, and AC), those three digits are locked into those three cells and can be eliminated from the rest of the unit.',
        summary: 'Three cells in a unit share candidates drawn only from {A, B, C}.'
      },
      hidden_triple: {
        sidebarName: 'Hidden Triple',
        name: 'Hidden Triple',
        category: 'Subsets',
        difficulty: 'Hard',
        rule: 'If three digits {A, B, C} can only appear in three cells within a row, column, or box, those three cells are reserved for {A, B, C} and any other candidate digits inside those three cells can be eliminated.',
        summary: 'Three candidate digits appear only within three cells of a unit.'
      },
      x_wing: {
        sidebarName: 'X-Wing',
        name: 'X-Wing',
        category: 'Fish',
        difficulty: 'Hard',
        rule: 'When a candidate appears in exactly 2 cells across two different rows and both pairs align in the exact same 2 columns (forming a rectangle), the digit must go in opposite corners. Eliminate that candidate from all other cells in both columns (or rows).',
        summary: 'A candidate forms a rectangle across 2 rows and 2 columns.'
      },
      swordfish: {
        sidebarName: 'Swordfish',
        name: 'Swordfish (3×3 Fish)',
        category: 'Fish',
        difficulty: 'Master',
        rule: 'The 3×3 generalization of X-Wing: if across 3 rows a candidate appears only within the same 3 columns (2 or 3 times per row), it is locked into those intersections and can be eliminated from all other cells in those 3 columns.',
        summary: 'Across 3 rows, a candidate is confined to the same 3 columns.'
      },
      xy_wing: {
        sidebarName: 'XY-Wing (Y-Wing)',
        name: 'XY-Wing (Y-Wing)',
        category: 'Wings',
        difficulty: 'Master',
        rule: 'A bi-value pivot cell {A, B} sees two "wing" cells containing {A, C} and {B, C}. Whatever value the pivot takes (A or B), one of the two wings is forced to be C. Therefore, any cell that sees BOTH wings cannot contain C.',
        summary: 'A pivot {A, B} links two wings {A, C} and {B, C} to eliminate C.'
      }
    },

    // Theory & Combinatorics Section in English
    theory: {
      heroTitle: 'Sudoku Mathematics, Complexity & Combinatorics',
      heroSubtitle: 'Answering foundational questions on game theory, state spaces, algorithmic generation, and computational limits.',
      q1Title: '1. Is Sudoku a Solved Game?',
      q1Intro: 'In game theory and mathematics, whether a game is "solved" depends on the definition used:',
      stat1Label: 'Total Valid 9×9 Grids',
      stat2Label: 'Essentially Unique Grids',
      stat3Label: 'Minimum Clues for Uniqueness',
      stat4Val: 'NP-Complete',
      stat4Label: 'Complexity for N×N Boards',
      q1P1: '• <strong>For standard 9×9 Sudoku:</strong> Yes, it is exhaustively analyzed and computationally solved. In 2005, Bertram Felgenhauer and Frazer Jarvis proved the exact number of valid filled 9×9 Sudoku grids is <strong>6,670,903,752,021,072,936,960</strong>. Taking into account all symmetries (rotations, reflections, permutations of rows/columns within bands, and digit relabeling), Ed Russell and Frazer Jarvis proved there are exactly <strong>5,472,730,538</strong> essentially different equivalence classes.',
      q1P2: '• <strong>The 17-Clue Minimum Proof:</strong> In January 2012, Gary McGuire, Bastian Tugemann, and Gilles Civario proved via an exhaustive 7.1 million CPU-hour supercomputer search that <em>no 16-clue Sudoku can ever have a unique solution</em>. Standard Sudoku requires a mathematical minimum of <strong>17 clues</strong>.',
      q1P3: '• <strong>For generalized N×N Sudoku (n² × n²):</strong> Determining whether an arbitrary puzzle has a valid solution is <strong>NP-complete</strong> (proved by Takayuki Yato and Takahiro Seta, 2003). While computers solve 9×9 boards in under a millisecond using backtracking or Donald Knuth\'s Dancing Links (Algorithm X), scaling the grid to 100×100 quickly becomes intractable in the worst case.',
      btnLoad17: '🎮 Load Gary McGuire\'s 17-Clue Puzzle into Play Board',
      btnVerify17: '⚡ Verify 17-Clue Uniqueness Speed',
      verify17Result: (ms, count) => `Result: Verified in ${ms} ms! Exactly ${count} solution exists. (Gary McGuire 2012 Proof benchmark).`,

      q2Title: '2. Can We Generate All Combinations?',
      q2Intro: 'It depends on whether you mean <strong>completed grids</strong> or <strong>partial clue puzzles</strong>:',
      q2P1: '• <strong>All 6.67 × 10²¹ Raw Grids:</strong> Sequential output of all raw grids is practically impossible due to cosmic time scales. Even if a computer generated 1 billion grids per second without pausing, it would take <strong>211,000 years</strong> to output all 6.67 × 10<sup>21</sup> grids. Storing them in raw uncompressed text would require roughly <strong>540,000 exabytes</strong> of storage!',
      q2P2: '• <strong>All 5.47 Billion Symmetry Equivalence Classes:</strong> <strong>Yes!</strong> This has been done. The 5,472,730,538 fundamental classes have been completely catalogued and indexed by mathematicians into compressed databases of roughly 40 to 60 gigabytes.',
      q2P3: '• <strong>All Valid Puzzles (Starting Clue Layouts):</strong> The space of all partial configurations is roughly 3<sup>81</sup> ≈ 4.4 × 10<sup>38</sup>. Even filtering only for those with a single unique solution leaves an estimated 10<sup>30</sup> to 10<sup>35</sup> valid puzzles. Storing all of them is physically impossible—which is why modern software generates them <em>procedurally on demand</em>!',

      q3Title: '3. Are Puzzles Generated On-The-Fly or Handcrafted?',
      q3Intro: '<strong>Almost all modern Sudoku puzzles are generated 100% on the fly!</strong>',
      q3P1: 'Here is the exact 4-stage algorithm used by modern game engines (and running directly in this app):',
      codeFlow: `1. FULL GRID GENERATION:
   Start with an empty 9×9 board.
   Fill cells using randomized backtracking with constraint propagation (MRV heuristic).
   Takes: ~1 to 3 milliseconds.

2. SYMMETRIC HOLE DIGGING:
   Group cells into 180° rotationally symmetric pairs: (r, c) and (8-r, 8-c).
   Shuffle the pairs into random order.
   For each pair:
     Temporarily clear both cells.
     Check uniqueness: countSolutions(board, limit=2) === 1.
     If still strictly unique: keep cells cleared!
     If ambiguous (>1 solutions): rollback and restore numbers!

3. DIFFICULTY TARGETING:
   Continue digging until clue target is reached:
   Easy (35-40 clues) • Medium (29-34 clues) • Hard (25-28 clues) • Expert (21-24 clues).

4. LOGICAL DEDUCTION GRADING:
   Run a human-style solver (Singles → Pairs → Intersections → X-Wings → Wings).
   Grade the puzzle's difficulty based on the hardest technique required to solve it without guessing!`,
      q3P2: '<strong>Why did people design them by hand?</strong> In the 1980s and 1990s, the Japanese publisher <em>Nikoli</em> (led by Maki Kaji) popularized handcrafted Sudokus. Nikoli\'s human designers treated puzzle creation as an art form, insisting that every puzzle have aesthetic 180° rotational symmetry, beautiful clue patterns, and elegant logical step transitions without trial-and-error guessing. Today, procedural computer algorithms can enforce those same aesthetic and logical constraints automatically in just a few milliseconds.',
      benchTitle: '⚡ Live In-Browser Generator Benchmark',
      benchDesc: 'Click below to benchmark the engine directly in your browser. It will generate 5 brand-new, mathematically unique Sudokus with 180° rotational symmetry and measure execution times live:',
      btnRunBench: 'Run Live Generation Benchmark',
      benchInitialOutput: 'Click "Run Live Generation Benchmark" to test generator performance...',
      benchRunning: 'Running live on-the-fly generation benchmark (5 puzzles with 180° symmetry)...',
      benchResult: (avgTime, totalTime, cluesStr, allUnique) => [
        `⚡ Benchmark Completed!`,
        `• Puzzles Generated: 5 unique Sudokus (180° rotational symmetry)`,
        `• Average Generation Time: ${avgTime} ms per puzzle`,
        `• Total Execution Time: ${totalTime} ms`,
        `• Clue Counts: [${cluesStr}]`,
        `• Uniqueness Check: ${allUnique ? '100% Unique Guaranteed (countSolutions === 1)' : 'Failed'}`,
        `• Conclusion: Yes! Infinite high-quality Sudokus can be generated on the fly in milliseconds.`
      ].join('\n')
    }
  }
};

/**
 * Translates a dynamic solver/technique step object into the active language.
 */
export function localizeStep(step, lang = 'es') {
  if (!step || lang !== 'es') return step;

  const esTech = TRANSLATIONS.es.techniques[step.id];
  const name = esTech ? esTech.name : step.name;

  // Translate unit names & dynamic step descriptions into friendly Spanish
  let desc = step.description || '';

  desc = desc
    .replace(/^Cell (R\d+C\d+) has only one candidate remaining: \[(\d+)\]\. It must be placed here\.$/,
      'En la casilla $1 solo queda un candidato posible: el [$2]. ¡Va ahí sí o sí!')
    .replace(/^In row (\d+), digit \[(\d+)\] can only fit in cell (R\d+C\d+)\.$/,
      'En la Fila $1, el número [$2] solo cabe en la casilla $3.')
    .replace(/^In col (\d+), digit \[(\d+)\] can only fit in cell (R\d+C\d+)\.$/,
      'En la Columna $1, el número [$2] solo cabe en la casilla $3.')
    .replace(/^In box (\d+), digit \[(\d+)\] can only fit in cell (R\d+C\d+)\.$/,
      'En el Bloque $1, el número [$2] solo cabe en la casilla $3.')
    .replace(/^In Box (\d+), digit \[(\d+)\] is confined to Row (\d+)\. Therefore, \[(\d+)\] can be eliminated from all other cells in Row (\d+)\.$/,
      'En el Bloque $1, el candidato [$2] solo aparece en la Fila $3. Por lo tanto, se descarta el [$4] del resto de la Fila $5.')
    .replace(/^In Box (\d+), digit \[(\d+)\] is confined to Column (\d+)\. Therefore, \[(\d+)\] can be eliminated from all other cells in Column (\d+)\.$/,
      'En el Bloque $1, el candidato [$2] solo aparece en la Columna $3. Por lo tanto, se descarta el [$4] del resto de la Columna $5.')
    .replace(/^In row (\d+), digit \[(\d+)\] is confined to Box (\d+)\. It can be eliminated from the rest of Box (\d+)\.$/,
      'En la Fila $1, el número [$2] está encerrado en el Bloque $3. Se puede eliminar del resto del Bloque $4.')
    .replace(/^In col (\d+), digit \[(\d+)\] is confined to Box (\d+)\. It can be eliminated from the rest of Box (\d+)\.$/,
      'En la Columna $1, el número [$2] está encerrado en el Bloque $3. Se puede eliminar del resto del Bloque $4.')
    .replace(/^Cells (R\d+C\d+) and (R\d+C\d+) in (row|col|box) (\d+) both contain only \[([\d, ]+)\]\. Those digits can be eliminated from all other cells in that (row|col|box)\.$/,
      (_, c1, c2, u1, idx, digits) => {
        const unitEs = u1 === 'row' ? 'la Fila' : u1 === 'col' ? 'la Columna' : 'el Bloque';
        return `Las casillas ${c1} y ${c2} en ${unitEs} ${idx} tienen solo los candidatos [${digits}]. Se eliminan esos números del resto de ${unitEs} ${idx}.`;
      })
    .replace(/^In (row|col|box) (\d+), digits \[([\d, ]+)\] appear only in (R\d+C\d+) and (R\d+C\d+)\. All other candidates in these two cells can be eliminated\.$/,
      (_, u1, idx, digits, c1, c2) => {
        const unitEs = u1 === 'row' ? 'la Fila' : u1 === 'col' ? 'la Columna' : 'el Bloque';
        return `En ${unitEs} ${idx}, los números [${digits}] solo aparecen en ${c1} y ${c2}. Se borran los demás candidatos sobrantes de esas dos casillas.`;
      })
    .replace(/^Cells ([^i]+) in (row|col|box) (\d+) form a Naked Triple on digits \[([\d, ]+)\]\. Eliminating \[([\d, ]+)\] from other cells in that (row|col|box)\.$/,
      (_, cells, u1, idx, digits) => {
        const unitEs = u1 === 'row' ? 'la Fila' : u1 === 'col' ? 'la Columna' : 'el Bloque';
        return `Las casillas ${cells} en ${unitEs} ${idx} forman un Trío Desnudo con [${digits}]. Se eliminan [${digits}] del resto de ${unitEs} ${idx}.`;
      })
    .replace(/^In (row|col|box) (\d+), digits \[([\d, ]+)\] appear only in cells ([^.]+)\. All other candidates in those 3 cells are eliminated\.$/,
      (_, u1, idx, digits, cells) => {
        const unitEs = u1 === 'row' ? 'la Fila' : u1 === 'col' ? 'la Columna' : 'el Bloque';
        return `En ${unitEs} ${idx}, los números [${digits}] solo aparecen en las casillas ${cells}. Se eliminan los demás candidatos de esas 3 casillas.`;
      })
    .replace(/^Digit \[(\d+)\] forms an X-Wing in Rows (\d+) and (\d+) across Columns (\d+) and (\d+)\. Eliminating \[(\d+)\] from all other cells in Columns (\d+) and (\d+)\.$/,
      'El candidato [$1] forma un X-Wing en las Filas $2 y $3 cruzando las Columnas $4 y $5. Se elimina el [$6] del resto de las Columnas $7 y $8.')
    .replace(/^Digit \[(\d+)\] forms an X-Wing in Columns (\d+) and (\d+) across Rows (\d+) and (\d+)\. Eliminating \[(\d+)\] from all other cells in Rows (\d+) and (\d+)\.$/,
      'El candidato [$1] forma un X-Wing en las Columnas $2 y $3 cruzando las Filas $4 y $5. Se elimina el [$6] del resto de las Filas $7 y $8.')
    .replace(/^Digit \[(\d+)\] forms a Swordfish across Rows ([\d, ]+) and Columns ([\d, ]+)\. Eliminating \[(\d+)\] from all other cells in those 3 columns\.$/,
      'El candidato [$1] forma un Swordfish en las Filas $2 y las Columnas $3. Se elimina el [$4] del resto de esas 3 columnas.')
    .replace(/^Digit \[(\d+)\] forms a Swordfish across Columns ([\d, ]+) and Rows ([\d, ]+)\. Eliminating \[(\d+)\] from all other cells in those 3 rows\.$/,
      'El candidato [$1] forma un Swordfish en las Columnas $2 y las Filas $3. Se elimina el [$4] del resto de esas 3 filas.')
    .replace(/^Pivot cell (R\d+C\d+) \[([\d, ]+)\] links Wing 1 (R\d+C\d+) \[([\d, ]+)\] and Wing 2 (R\d+C\d+) \[([\d, ]+)\]\. Regardless of the pivot's value, one wing must be \[(\d+)\], so any cell seeing both wings cannot contain \[(\d+)\]\.$/,
      'La casilla pivote $1 [$2] conecta con el Ala 1 en $3 [$4] y el Ala 2 en $5 [$6]. Sea cual sea el valor del pivote, una de las alas será [$7], por lo que cualquier casilla que vea a ambas alas no puede tener el [$8].');

  return {
    ...step,
    name,
    description: desc
  };
}
