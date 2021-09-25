import styled from "styled-components"
import { roseRed } from "../styles/colors"

const _Input = styled.input`
  width: 30rem;
  height: 2rem;
  padding: 0.5rem;
  padding-left: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: inline-block;
  font-size: 1rem;
  :active, :focus {
    border-color: ${roseRed};
    outline-color: ${roseRed};
  }
  :hover {
    border-color: rgba(0,0,0,0.3);
  }
`

const InputContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
`

const Label = styled.div`
  position: absolute;
  right: 1%;
  padding-left: 2%;
  padding-right: 2%;
  top: 4%;
  background-color: rgba(255, 255, 255, 0.9);
  align-self: center;
  font-size: 1rem;
  height: 90%;
  color: #df5555;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem;
`
const InputTitle = styled.div`
  font-size: 1.2rem;
  margin-left: 0.2rem;
  margin-bottom: 0.5rem;
  color: rgba(0, 0, 0, 0.6);
`
const ErrorText = styled.p`
  position: absolute;
  color: red;
  margin-left: 0.5rem;
  margin-top: 0.30rem;
  font-size: 0.9rem;
`

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
  title?: string
  errorText?: string
}

const Input: React.FC<Props> = ({
  children,
  label,
  errorText,
  title,
  ...props
}) => {
  return (
    <div>
      {title ? <InputTitle>{title}</InputTitle> : null}
      <InputContainer>
        {label ? <Label className="inputLabel">{label}</Label> : null}
        <_Input {...props}>{children}</_Input>
      </InputContainer>
      {errorText ? <ErrorText>{errorText}</ErrorText> : null}
    </div>
  )
}

export { Input }
