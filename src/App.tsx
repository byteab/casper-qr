import { useState } from "react"
import logo from "./logo.svg"
// @ts-ignore
import debounce from "debounce"
import QRCode from "react-qr-code"
import "./App.css"

function App() {
  const [{ receiver, amount, message }, setState] = useState({
    receiver: null as null | string,
    amount: null as null | string,
    message: null as null | string,
  })

  let qrValue = ""
  if (receiver) {
    qrValue = `casper=${receiver}`
    if (amount || message) {
      qrValue += "?"
      if (amount && message) {
        qrValue += `amount=${amount}`
        qrValue += `&message=${message}`
      } else if (amount) {
        qrValue += `amount=${amount}`
      } else {
        qrValue += `message=${message}`
      }
    } else {
      qrValue.replace("?", "")
    }
  }

  const handleChange = debounce((e: any) => {
    setState((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }, 100)

  return (
    <div className="App">
      {receiver ? <QRCode value={qrValue} /> : null}
      <h1>{qrValue}</h1>
      <input
        name="receiver"
        onChange={handleChange}
        placeholder="Receiver address"
      />
      <input
        name="amount"
        type="number"
        onChange={handleChange}
        placeholder="Amount"
      />
      <input name="message" onChange={handleChange} placeholder="Message" />
    </div>
  )
}

export default App
