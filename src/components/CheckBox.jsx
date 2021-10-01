import * as React from "react"

export function CheckBox(props) {
  const checkState = typeof props.checked !== "boolean" ? true : props.checked
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      width={props.width || 20}
      height={props.height || 20}
      onClick={() => {
        props.onChange(!checkState)
      }}
    >
      <path
        fill="#FF4848"
        d="M8 75.5c-1.93 0-3.5-1.57-3.5-3.5V8c0-1.93 1.57-3.5 3.5-3.5h64c1.93 0 3.5 1.57 3.5 3.5v64c0 1.93-1.57 3.5-3.5 3.5H8z"
      />
      {checkState ? (
        <path
          fill="none"
          stroke="#fff"
          strokeMiterlimit={10}
          strokeWidth={6}
          d="M22 40.107l11.929 11.929 26.84-26.841"
        />
      ) : null}
    </svg>
  )
}
