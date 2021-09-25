import * as React from "react"
import { QRGenerator } from "./QRGenerator"

function App() {
  return (
    <div
      style={{
        backgroundColor: "rgba(0,0,0,0.008)",
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <QRGenerator />
    </div>
  )
}

export default App
