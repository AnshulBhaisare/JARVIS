/**
 * Evaluates the spoken/typed command locally.
 * If it matches a simple fast-path command (e.g. "what's the time", "open camera"),
 * it immediately returns a structured result identical to what the Gemini API would return.
 * This completely bypasses the network and LLM API for instantaneous execution.
 * 
 * Returns `null` if no local match is found, triggering a fallback to the Gemini API.
 */
export function checkLocalCommand(command) {
  const text = command.toLowerCase().trim()

  // 1. Time
  if (text === 'time' || text.includes('what is the time') || text.includes("what's the time") || text.includes('current time')) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return {
      tool: 'ai.answer_question',
      args: {},
      response_text: `The time is ${time}`,
      response_mode: 'short',
      requires_confirmation: false,
      isLocal: true
    }
  }

  // 2. Date
  if (text === 'date' || text.includes('what is the date') || text.includes("what's the date") || text.includes("today's date")) {
    const date = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    return {
      tool: 'ai.answer_question',
      args: {},
      response_text: `Today is ${date}`,
      response_mode: 'short',
      requires_confirmation: false,
      isLocal: true
    }
  }

  // 3. System Tools - Camera
  if (text.includes('open camera') || text.includes('take a picture') || text.includes('take a photo') || text.includes('capture image')) {
    return {
      tool: 'system.open_camera',
      args: {},
      response_text: 'Opening your camera.',
      response_mode: 'short',
      requires_confirmation: false,
      isLocal: true
    }
  }

  // 4. System Tools - Calculator
  if (text.includes('open calculator') || text === 'calculator') {
    return {
      tool: 'system.open_app',
      args: { app_name: 'calculator' },
      response_text: 'Opening calculator.',
      response_mode: 'short',
      requires_confirmation: false,
      isLocal: true
    }
  }

  // 5. System Tools - Browser
  if (text.includes('open browser') || text.includes('open chrome') || text.includes('start chrome')) {
    return {
      tool: 'system.open_app',
      args: { app_name: 'chrome' },
      response_text: 'Opening your browser.',
      response_mode: 'short',
      requires_confirmation: false,
      isLocal: true
    }
  }

  // 6. System Tools - Notepad
  if (text.includes('open notepad') || text === 'notepad') {
    return {
      tool: 'system.open_app',
      args: { app_name: 'notepad' },
      response_text: 'Opening Notepad.',
      response_mode: 'short',
      requires_confirmation: false,
      isLocal: true
    }
  }

  // 7. System Tools - File Explorer
  if (text.includes('open explorer') || text.includes('open file explorer') || text.includes('open my files')) {
    return {
      tool: 'system.open_app',
      args: { app_name: 'explorer' },
      response_text: 'Opening File Explorer.',
      response_mode: 'short',
      requires_confirmation: false,
      isLocal: true
    }
  }

  // No fast-path match found. Fallback to Gemini API.
  return null
}
