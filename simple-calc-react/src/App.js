import { useCallback, useState, useMemo} from "react"
import click from "./click.mp3"

function App() {
  const [number, setNumber] = useState("")
  const [result, setResult] = useState("")

  // Stores the operator for the current calculation.
  const [operator, setOperator] = useState("") 
  const [lastInputWasOperator, setLastInputWasOperator] = useState(false)

  // Indicates whether user has already used an operator in a single expression.
  const [operatorUsedOnceInExpression, setOperatorUsedOnceInExpression] = useState(false) 
  const [periodUsed, setPeriodUsed] = useState(false)
  const [display, setDisplay] = useState("")
  const [subdisplay, setSubdisplay] = useState("")

  const audio = useMemo(() => new Audio(click), [])

  // Plays click audio when user interacts with buttons.
  const playAudio = useCallback(() => {
    audio.volume = 0.1
    audio.play()
  }, [audio])

  // Updates display based on user input and also handles incorrect input.
  const updateDisplay = useCallback(
    (value) => {
      if (display === "" && value === "0") return;
      if (display === "NUMBER TOO BIG") {
        setDisplay(value)
        playAudio()
        return
      }

      if (value === ".") {
        if (periodUsed) return
        setPeriodUsed(true)

        playAudio()
      }
 
      playAudio()

      if (display.length > 16) setDisplay("NUMBER TOO BIG")
      else setDisplay((prevDisplay) => prevDisplay + value)

      setLastInputWasOperator(false)
    },
    [display, periodUsed, playAudio]
  )

  // Handles functionality after user has used an operator.
  // Behaves differently based on operator usage.
  const usedOperator = (op) => {
    if (!display) return
    if (lastInputWasOperator) return

    if (operatorUsedOnceInExpression) {
      setOperator(op)
      setLastInputWasOperator(true)
      let r = calculation()
      setSubdisplay(r + op)
      setNumber(r)
      setDisplay("")
    } else {
      setOperator(op)
      setLastInputWasOperator(true)
      setOperatorUsedOnceInExpression(true)
      setSubdisplay(display + op)
      setNumber(display)
      setDisplay("")
    }

    playAudio()
  }

  // Handles clear functionality.
  const handleClear = () => {
    setPeriodUsed(false)
    setSubdisplay("")
    setDisplay("")
    setNumber("")
    setLastInputWasOperator(false)
    setOperatorUsedOnceInExpression(false)

    playAudio()
  }

  // Returns calculation result.
  const calculation = () => {
    let r = 0
    if (operator === "+") r = Number(number) + Number(display)
    else if (operator === "-") r = Number(number) - Number(display)
    else if (operator === "*") r = Number(number) * Number(display)
    else if (operator === "/") r = Number(number) / Number(display)
    return r
  }

  // Handles functionality when user clicks "=" button.
  const handleCalculate = () => {
    if (!display) return
    if (result.toString().length > 16) setDisplay("NUMBER TOO BIG")
    else setDisplay(calculation())

    
    setSubdisplay(number + operator + display + "=");
    setLastInputWasOperator(false)
    setOperatorUsedOnceInExpression(false)
    setResult("")

    playAudio()
  }

  // Handles SAVE API call.
  const handleSave = () => {
    fetch("http://localhost:3001/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ num: display }),
    }).catch((error) => console.log(error))

    playAudio()
  }

  // Handles LOAD API call.
  const handleLoad = () => {
    fetch("http://localhost:3001/api/load")
      .then((response) => response.json())
      .then((data) => setDisplay(data["num"]))
      .catch((error) => console.log(error))
    
      playAudio()
  }

  // Returns numbers 1-9 as buttons.
  const createNumbers = () => {
    const numbers = []

    for (let i = 1; i < 10; i++) {
      numbers.push(
        <button onClick={() => updateDisplay(i.toString())} key={i}>
          {i}
        </button>
      )
    }

    return numbers
  }

  return (
    <div className="App">
      <div className="flex-container">
        <div className="left-section"></div>
        <div className="middle-section">
          <div className="calculator">
            <div className="display">
                                                  {/* Empty Character */}
              <div className="subdisplay">{subdisplay || "‎"}</div>
              {display || "0"}
            </div>

            <div className="buttons">
              <div className="operators">
                <button onClick={() => usedOperator("+")}>+</button>
                <button onClick={() => usedOperator("-")}>-</button>
                <button onClick={() => usedOperator("*")}>*</button>
                <button onClick={() => usedOperator("/")}>/</button>
              </div>
              <div className="functions">
                <button onClick={() => handleSave()}>SAVE</button>
                <button onClick={() => handleLoad()}>LOAD</button>
                <button onClick={() => handleClear()}>CLR</button>
              </div>
              <div className="numbers">
                {createNumbers()}
                <button onClick={() => updateDisplay(".")}>.</button>
                <button onClick={() => updateDisplay("0")}>0</button>
                <button onClick={() => handleCalculate()}>=</button>
              </div>
            </div>
          </div>
        </div>
        <div className="right-section"></div>
      </div>
    </div>
  );
}

export default App
