import * as React from "react"
import QRCode from "react-qr-code"
import { toast } from "react-toastify"
import styled from "styled-components"
import { Input, Title } from "."
import { Button } from "./Button"
import metamaskURL from "../assets/metamask.png"
import { useDebouncedEffect } from "../utils/useDebouncedEffect"
import { countNumberOfDecimals } from "../utils/countNumberOfDecimals"
import { ethers } from "ethers"

const Container = styled.div`
  background-color: #fff;
  width: 60vw;
  height: 87vh;
  border-radius: 10px;
  -webkit-box-shadow: -1px 5px 50px -17px rgba(0, 0, 0, 0.08);
  box-shadow: -1px 5px 50px -17px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  padding-left: 4rem;
  padding-right: 4rem;
`
const Top = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
`
const Bottom = styled.div`
  flex: 4;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 5rem;
`

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  flex-grow: 1;
  padding-top: 2.5rem;
`

const MetaImage = styled.img`
  width: 2rem;
  height: 2rem;
  object-fit: contain;
  cursor: pointer;
`

type State = {
  receiver?: string
  amount?: string
  message?: string
  transactionID?: string
}

// TODO
// download qr code

export const QRGenerator = () => {
  const [state, setState] = React.useState<State>({})
  // address received from metamask

  const [currentAccount, setCurrentAccount] = React.useState("")
  const { receiver, amount, message, transactionID } = state

  const [errors, setErrors] = React.useState<State>({})

  const qrState = !state.receiver
    ? "error"
    : Object.keys(state).length === 0
    ? "empty"
    : Object.keys(errors).length
    ? "error"
    : "valid"

  const [qrValue, setQrValue] = React.useState("")

  useDebouncedEffect(
    () => {
      let qrValue = ""
      if (state.receiver) {
        qrValue = `casper:${receiver}`
        if (amount || message || transactionID) {
          qrValue += "?"
          let obj = { amount, message, transactionID }
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
    [state],
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
        if (value && !ethers.utils.isAddress(value + "")) {
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
    const { ethereum } = window

    if (!ethereum) {
      toast("Make sure Metamask is installed!")
    }
    try {
      // already authorized accounts
      let accounts = await ethereum.request({ method: "eth_accounts" })
      if (accounts.length) {
        // setCurrentAccount(accounts[0])
        setState((prev) => ({ ...prev, receiver: accounts[0] }))
        setErrors((prev) => {
          let obj = { ...prev }
          delete obj.receiver
          return obj
        })
      } else {
        let accounts = await ethereum.request({
          method: "eth_requestAccounts",
        })
        if (accounts.length) {
          setState((prev) => ({ ...prev, receiver: accounts[0] }))
          setErrors((prev) => {
            let obj = { ...prev }
            delete obj.receiver
            return obj
          })
          // setCurrentAccount(accounts[0])
        } else {
          toast("no account found!")
        }
      }
    } catch (e: any) {
      toast("something went wrong! ", e.message)
    }
  }

  const downloadQRCode = () => {
    const svg = document.getElementById("QRCode")
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
      if (ctx) {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          const pngFile = canvas.toDataURL("image/png")
          const downloadLink = document.createElement("a")
          downloadLink.download = state.transactionID
            ? state.transactionID + "-CasperQRCode"
            : "CasperQRCode"
          downloadLink.href = `${pngFile}`
          downloadLink.click()
        }
        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
      } else {
        toast("Something went wrong!")
      }
    } else {
      toast("Something went wrong!")
    }
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
            label={<MetaImage onClick={getAddress} src={metamaskURL} />}
            title="Receiver Address *"
            value={state.receiver}
            onChange={handleChange}
            name="receiver"
            placeholder="Enter receiver address in here"
          />
          <Input
            errorText={errors.amount}
            title="Casper Amount"
            value={state.amount}
            type="number"
            name="amount"
            label={"CSPR"}
            onChange={handleChange}
            placeholder="Enter casper amount"
          />
          <Input
            errorText={errors.message}
            name="message"
            value={state.message}
            title="Message"
            onChange={handleChange}
            placeholder="Enter a message"
          />
          <Input
            errorText={errors.transactionID}
            name="transactionID"
            value={state.transactionID}
            title="Transaction ID"
            onChange={handleChange}
            placeholder="Enter a transaction ID"
          />
        </InputsContainer>
        <QRContainer>
          <QRCode
            id={"QRCode"}
            disabled={!receiver}
            value={qrValue}
            size={300}
          />
          <Button onClick={downloadQRCode} disabled={qrState !== "valid"}>
            {qrState !== "valid" ? "Invalid QR" : "Download"}
          </Button>
        </QRContainer>
      </Bottom>
    </Container>
  )
}
