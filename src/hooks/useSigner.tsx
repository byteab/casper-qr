import * as React from "react"
import { Signer } from "casper-js-sdk"

type State = {
  status:
    | "loading"
    | "not_installed"
    | "locked"
    | "not_connected"
    | "connected"
    | "not_connected_and_maybe_locked"
  activeKey: string
}

export const useSigner = () => {
  const [state, setState] = React.useState<Partial<State>>({
    status: "loading",
  })

  const [internalState, setInternalState] = React.useState<
    "connected_and_maybe_locked" | ""
  >("")

  React.useEffect(() => {
    // only if connected
    if (
      state.status === "connected" ||
      internalState === "connected_and_maybe_locked"
    ) {
      // this block is pretty sure that key exists.
      // because without a key "connected" state is never happening
      ;(async () => {
        try {
          let activePublicKey = await Signer.getActivePublicKey()
          if (activePublicKey) {
            setState((prev) => ({
              ...prev,
              activeKey: activePublicKey,
              status: "connected",
            }))
            setInternalState("")
          }
        } catch (error) {
          // exception only occurs when locked
          // connected state is already verified on the top `if()`
          setState((prev) => ({
            ...prev,
            status: "locked",
          }))
        }
      })()
    }
  }, [state.status, internalState])
  // Without the timeout it doesn't always work properly
  React.useEffect(() => {
    setTimeout(async () => {
      try {
        const connected = await Signer.isConnected()
        // for not connected it return false
        // TODO: check for locked
        if (connected) {
          // connected but maybe locked
          setState((prev) => ({
            ...prev,
            status: "loading",
          }))
          setInternalState("connected_and_maybe_locked")
        } else {
          // not connected but maybe locked as well
          setState((prev) => ({
            ...prev,
            status: "not_connected_and_maybe_locked",
          }))
        }
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          status: "not_installed",
        }))
      }
    }, 100)
    const listenerConnected = (msg: any) => {
      let isLocked = !msg.detail.isUnlocked
      setState((prev) => ({
        ...prev,
        status: isLocked ? "locked" : "connected",
        activeKey: msg.detail.activeKey,
      }))
    }
    window.addEventListener("signer:connected", listenerConnected)
    const listenerDisconnected = (msg: any) => {
      let isLocked = !msg.detail.isUnlocked
      setState((prev) => ({
        ...prev,
        status: isLocked ? "locked" : "not_connected",
        activeKey: msg.detail.activeKey,
      }))
    }
    window.addEventListener("signer:disconnected", listenerDisconnected)
    const listenerTabUpdated = (msg: any) => {
      let isLocked = !msg.detail.isUnlocked
      let isConnected = msg.detail.isConnected
      setState((prev) => ({
        ...prev,
        status: isLocked
          ? "locked"
          : isConnected
          ? "connected"
          : "not_connected",
        activeKey: msg.detail.activeKey,
      }))
    }
    window.addEventListener("signer:tabUpdated", listenerTabUpdated)
    const listenerActiveKeyChanged = (msg: any) => {
      setState((prev) => ({
        ...prev,
        activeKey: msg.detail.activeKey,
      }))
    }
    window.addEventListener("signer:activeKeyChanged", listenerActiveKeyChanged)
    const listenerLocked = (msg: any) => {
      let isLocked = !msg.detail.isUnlocked
      let isConnected = msg.detail.isConnected
      setState((prev) => ({
        ...prev,
        status: isLocked
          ? "locked"
          : isConnected
          ? "connected"
          : "not_connected",
        activeKey: msg.detail.activeKey,
      }))
    }
    window.addEventListener("signer:locked", listenerLocked)
    const listenerUnlocked = (msg: any) => {
      let isLocked = !msg.detail.isUnlocked
      let isConnected = msg.detail.isConnected
      setState((prev) => ({
        ...prev,
        status: isLocked
          ? "locked"
          : isConnected
          ? "connected"
          : "not_connected",
        activeKey: msg.detail.activeKey,
      }))
    }
    window.addEventListener("signer:unlocked", listenerUnlocked)
    const listenerInitialState = (msg: any) => {
      let isLocked = !msg.detail.isUnlocked
      let isConnected = msg.detail.isConnected
      setState((prev) => ({
        ...prev,
        status: isLocked
          ? "locked"
          : isConnected
          ? "connected"
          : "not_connected",
        activeKey: msg.detail.activeKey,
      }))
    }
    window.addEventListener("signer:initialState", listenerInitialState)

    return () => {
      window.removeEventListener("signer:initialState", listenerInitialState)
      window.removeEventListener("signer:unlocked", listenerUnlocked)
      window.removeEventListener("signer:locked", listenerLocked)
      window.removeEventListener(
        "signer:activeKeyChanged",
        listenerActiveKeyChanged
      )
      window.removeEventListener("signer:tabUpdated", listenerTabUpdated)
      window.removeEventListener("signer:disconnected", listenerDisconnected)
      window.removeEventListener("signer:connected", listenerConnected)
    }
  }, [])
  return state
}
