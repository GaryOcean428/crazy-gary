declare global {
  var testData: {
    users: Record<string, any>
    tasks: any[]
    heavyConfig: Record<string, any>
  } | undefined
}

export {}