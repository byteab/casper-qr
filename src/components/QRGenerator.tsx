import * as React from "react"
import { QRCode } from "react-qrcode-logo"
import { toast } from "react-toastify"
import styled from "styled-components"
import { Input, Title } from "."
import { Button } from "./Button"
import casperImage from "../assets/casperlogo.jpeg"
import casperHighResImage from "../assets/logoqr.png"
import { useDebouncedEffect } from "../utils/useDebouncedEffect"
import { countNumberOfDecimals } from "../utils/countNumberOfDecimals"
import { useSigner } from "../hooks/useSigner"
import "../styles/QRGenerator.css"

const Container = styled.div`
  background-color: #fff;
  max-width: 55rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding-left: 4rem;
  padding-right: 4rem;
  overflow-y: auto;
  margin: auto;
  margin-top: 2rem;
`
const Top = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
`
const Bottom = styled.div`
  flex: 4;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
`

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  flex-basis: 25rem;
`

const QRContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-basis: 20rem;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  padding-top: 2.5rem;
  padding-left: 0;
  padding-right: 0;
`

const GenerateImage = styled.img`
  width: 2rem;
  height: 2rem;
  object-fit: contain;
  cursor: pointer;
`

type State = {
  receiver?: string
  amount?: string
  message?: string
  transfer_id?: string
}

const casperLiveBase = "https://cspr.live/transfer?"

const patternAddress = /^[1234567890abcdefghijklmnopqrstuvwxyz]{68}$/
const generatedTransferID = Math.ceil(new Date().valueOf() / 1000)

export const QRGenerator = () => {
  const [state, setState] = React.useState<State>({
    transfer_id: generatedTransferID + "",
  })
  const { activeKey, status } = useSigner()

  const { receiver, amount, message, transfer_id } = state
  const [isCasperLiveLink, setIsCasperLiveLink] = React.useState(true)

  const [errors, setErrors] = React.useState<State>({})

  const qrState = !state.receiver
    ? "error"
    : Object.keys(state).length === 0
    ? "empty"
    : Object.keys(errors).length
    ? "error"
    : "valid"

  const [qrValue, setQrValue] = React.useState(
    "this_is_an_invalid_casper_qr_code" + transfer_id
  )

  useDebouncedEffect(
    () => {
      let qrValue = ""
      if (state.receiver) {
        if (isCasperLiveLink) {
          qrValue = casperLiveBase + `recipient=${receiver}`
        } else {
          qrValue = `casper:${receiver}`
        }
        if (amount || message || transfer_id) {
          if (!isCasperLiveLink) {
            qrValue += "?"
          }
          let obj = { amount, message, transfer_id }
          // casper live doesn't accept message param
          // if (isCasperLiveLink) {
          //   delete obj.message
          // }
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              //@ts-ignore
              const element = obj[key]
              if (element) {
                if (qrValue.includes("=")) {
                  qrValue += `&${key}=${element}`
                } else {
                  qrValue += `${key}=${element}`
                }
              }
            }
          }
        }
        setQrValue(qrValue)
      }
    },
    [state, isCasperLiveLink],
    250
  )

  const validate = ({
    name,
    value,
  }: {
    name: string
    value: string | number
  }): boolean => {
    switch (name) {
      case "receiver": {
        // check regex
        if (value && !patternAddress.test(value + "")) {
          setErrors((prev) => ({ ...prev, receiver: "invalid address" }))
          return false
        }
        break
      }
      case "amount": {
        if (value && value < 0) {
          setErrors((prev) => ({ ...prev, amount: "Amount can't be negative" }))
          return false
        }
        if (value && countNumberOfDecimals(value as number) > 18) {
          setErrors((prev) => ({
            ...prev,
            amount: "Number of decimal places can't be more than 18",
          }))
          return false
        }
        break
      }
      default:
        return true
    }
    setErrors((prev) => {
      let result = { ...prev }
      delete result[name]
      return result
    })
    return true
  }

  const handleChange = (e: any) => {
    let name = e.target.name as string
    let value = e.target.value
    console.log(value)
    console.log(typeof value)
    validate({ name, value })
    setState((prev) => {
      let result = {
        ...prev,
        [name]: value,
      }
      if (!value) {
        //@ts-ignore
        delete result[name]
      }
      return result
    })
  }

  const getAddress = async () => {
    if (status === "loading") return
    if (status === "not_installed") {
      toast(
        "Please install CasperLabs Signer extension and make sure there is an active key"
      )
      return
    }
    if (status === "locked") {
      toast("CasperLabs signer is locked")
      return
    }
    if (status === "not_connected") {
      toast("CasperLabs signer is not connected")
      return
    }
    if (status === "not_connected_and_maybe_locked") {
      toast("Make sure CasperLabs signer is Connected and not locked")
      return
    }
    if (status === "connected" && activeKey) {
      validate({ name: "receiver", value: activeKey })
      setState((prev) => ({ ...prev, receiver: activeKey }))
      return
    }
    // if none of the above handle it
    toast(
      "Something is wrong! please make sure CasperLabs is installed, unlocked and connected"
    )
  }

  const downloadQRCode = () => {
    var link = document.createElement("a")
    link.download = state.transfer_id
      ? state.transfer_id + "-CasperQRCode.png"
      : "CasperQRCode.png"
    //@ts-ignore
    link.href = document.getElementById("react-qrcode-logo")?.toDataURL()
    link.click()
  }

  React.useEffect(() => {
    let qrCode = document.getElementById("react-qrcode-logo")
    if (qrCode) {
      // disable right click on qrCode
      qrCode.oncontextmenu = () => false
    }
  }, [])

  const onCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const value = target.checked
    setIsCasperLiveLink(value)
  }

  return (
    <Container>
      <Top>
        <Title>Casper QR Code Generator</Title>
      </Top>
      <Bottom>
        <InputsContainer>
          <Input
            errorText={errors.receiver}
            label={<GenerateImage onClick={getAddress} src={casperImage} />}
            title="Receiver Address *"
            value={state.receiver || ""}
            onChange={handleChange}
            name="receiver"
            placeholder="Enter receiver address in here"
          />
          <Input
            errorText={errors.amount}
            title="Casper Amount"
            value={state.amount || ""}
            type="number"
            name="amount"
            label={"CSPR"}
            onChange={handleChange}
            placeholder="Enter casper amount"
          />
          <Input
            errorText={errors.message}
            name="message"
            value={state.message || ""}
            title="Message"
            onChange={handleChange}
            placeholder="Enter a message"
          />
          <Input
            errorText={errors.transfer_id}
            name="transfer_id"
            value={state.transfer_id || ""}
            title="Transaction ID"
            onChange={handleChange}
            placeholder="Enter a transaction ID"
          />
        </InputsContainer>
        <QRContainer>
          <QRCode
            logoImage={casperHighResImage}
            logoHeight={120}
            logoWidth={120}
            // disabled={!receiver}
            qrStyle="dots"
            logoOpacity={1}
            eyeRadius={5}
            value={qrValue}
            size={300}
          />
          <Button onClick={downloadQRCode} disabled={qrState !== "valid"}>
            {qrState !== "valid" ? "Invalid QR" : "Download"}
          </Button>
        </QRContainer>
        <div className="inputContainer">
          <input
            id="toCasperLive"
            className="checkBox"
            checked={isCasperLiveLink}
            onChange={onCheckChange}
            type="checkbox"
          />
          <label htmlFor="toCasperLive" className="checkBoxLabel">
            Generate for casper.live
          </label>
        </div>
      </Bottom>
    </Container>
  )
}
