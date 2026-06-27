type LoaderControls = {
  show: () => void
  hide: () => void
}

let controls: LoaderControls = {
  show: () => {},
  hide: () => {},
}

export const registerLoader = (c: LoaderControls) => {
  controls = c
}

export const getGlobalLoader = (): LoaderControls => controls
