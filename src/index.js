var React = require('react');
const { h, app } = require('hyperapp');
/** @jsx h */
var d3 = require('d3');

const { interpolateWarm } = d3

Math.deg = radians => radians * (180 / Math.PI)

const memoizedCalc = (function() {
  const memo = {}

  const key = ({ w, heightFactor, lean }) => [w, heightFactor, lean].join("-")

  return args => {
    const memoKey = key(args)

    if (memo[memoKey]) {
      return memo[memoKey]
    } else {
      const { w, heightFactor, lean } = args

      const trigH = heightFactor * w

      const result = {
        nextRight: Math.sqrt(trigH ** 2 + (w * (0.5 + lean)) ** 2),
        nextLeft: Math.sqrt(trigH ** 2 + (w * (0.5 - lean)) ** 2),
        A: Math.deg(Math.atan(trigH / ((0.5 - lean) * w))),
        B: Math.deg(Math.atan(trigH / ((0.5 + lean) * w)))
      }

      memo[memoKey] = result
      return result
    }
  }
})()

const Pythagoras = ({
  w,
  x,
  y,
  heightFactor,
  lean,
  left,
  right,
  lvl,
  maxlvl
}) => {
  if (lvl >= maxlvl || w < 1) {
    return null
  }

  const { nextRight, nextLeft, A, B } = memoizedCalc({
    w: w,
    heightFactor: heightFactor,
    lean: lean
  })

  let rotate = ""

  if (left) {
    rotate = `rotate(${-A} 0 ${w})`
  } else if (right) {
    rotate = `rotate(${B} ${w} ${w})`
  }

  return (
    <g ns="svg" transform={`translate(${x} ${y}) ${rotate}`}>
      <rect
        width={w}
        height={w}
        x={0}
        y={0}
        style={{
          fill: interpolateWarm(lvl / maxlvl)
        }}
      />

      <Pythagoras
        w={nextLeft}
        x={0}
        y={-nextLeft}
        lvl={lvl + 1}
        maxlvl={maxlvl}
        heightFactor={heightFactor}
        lean={lean}
        left
      />

      <Pythagoras
        w={nextRight}
        x={w - nextRight}
        y={-nextRight}
        lvl={lvl + 1}
        maxlvl={maxlvl}
        heightFactor={heightFactor}
        lean={lean}
        right
      />
    </g>
  )
}

const { select, mouse, touches } = d3
const { scaleLinear } = d3

const SVG_WIDTH = () => window.innerWidth - 20
const SVG_HEIGHT = () => window.innerHeight - 20
const SVG = null

const state = {
  currentMax: 8,
  baseW: 80,
  heightFactor: 0,
  lean: 0
}

const actions = {
  move: ({ heightFactor, lean }) => ({ heightFactor, lean })
}

const view = (state, actions) => {
  function onMouseMove(svg) {
    const [x, y] = mouse(svg)

    const scaleFactor = scaleLinear()
      .domain([SVG_HEIGHT(), 0])
      .range([0, 0.8])
    const scaleLean = scaleLinear()
      .domain([0, SVG_WIDTH() / 2, SVG_WIDTH()])
      .range([0.5, 0, -0.5])

    actions.move({
      heightFactor: scaleFactor(y),
      lean: scaleLean(x)
    })
  }
  
  function onTouchMove(svg) {
    const [x, y] = touches(svg)[0]

    const scaleFactor = scaleLinear()
      .domain([SVG_HEIGHT(), 0])
      .range([0, 0.8])
    const scaleLean = scaleLinear()
      .domain([0, SVG_WIDTH() / 2, SVG_WIDTH()])
      .range([0.5, 0, -0.5])

    actions.move({
      heightFactor: scaleFactor(y),
      lean: scaleLean(x)
    })
  }

  return (
    <svg
      oncreate={svg => 
          {
            select(svg).on("mousemove", () => onMouseMove(svg));
            select(svg).on("touchmove", () => onTouchMove(svg));
          }
    }
      width={SVG_WIDTH()}
      height={SVG_HEIGHT()}
    >
      <Pythagoras
        w={state.baseW}
        h={state.baseW}
        heightFactor={state.heightFactor}
        lean={state.lean}
        x={SVG_WIDTH() / 2 - 40}
        y={SVG_HEIGHT() - state.baseW}
        lvl={0}
        maxlvl={state.currentMax}
      />
    </svg>
  )
}

app(state, actions, view, document.body)
