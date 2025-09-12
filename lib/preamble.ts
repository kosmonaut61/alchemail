let storedPreamble = ""

export async function getPreamble(): Promise<string> {
  return storedPreamble
}

export async function updatePreamble(newPreamble: string): Promise<void> {
  storedPreamble = newPreamble
}

export async function savePreamble(newPreamble: string): Promise<void> {
  storedPreamble = newPreamble
}
