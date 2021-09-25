import * as React from "react"
import styled from "styled-components"
import { roseRed } from "../styles/colors"
interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {}

const _Button = styled.button`
  border: none;
  background-color: ${(props) =>
    props.disabled ? "rgba(158, 222, 115, 0.3)" : "rgba(158, 222, 115, 1)"};
  -webkit-box-shadow: 2px 6px 15px -3px rgba(0, 0, 0, 0.17);
  box-shadow: 2px 6px 15px -3px rgba(0, 0, 0, 0.17);
  color: #fff;
  font-size: 1.5rem;
  font-family: inherit;
  padding: 1rem;
  width: 85%;
  border-radius: 0.3rem;
  cursor: pointer;
  align-self: flex-end;
  transition: all 0.2s;
  :hover {
    -webkit-box-shadow: 1px 10px 20px -3px rgba(0, 0, 0, 0.13);
    box-shadow: 1px 10px 20px -3px rgba(0, 0, 0, 0.13);
  }
  @media screen and (-ms-high-contrast: active) {
    border: 2px solid currentcolor;
  }
`
export const Button: React.FC<Props> = ({ children, disabled, ...props }) => {
  return (
    //@ts-ignore
    <_Button disabled={disabled} {...props}>
      {children}
    </_Button>
  )
}
