import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import { WrappedAxisTick, wrapLabel } from "@/components/wrapped-axis-tick"

describe("wrapLabel", () => {
  it("keeps a short label on one line", () => {
    expect(wrapLabel("Calculus I")).toEqual(["Calculus I"])
  })

  it("breaks at word boundaries once a line would pass 15 characters", () => {
    expect(wrapLabel("Data Structures and Algorithms")).toEqual(["Data Structures", "and Algorithms"])
  })

  it("keeps two lines and shortens the second when more would follow", () => {
    expect(wrapLabel("Introduction to Machine Learning with Python")).toEqual(["Introduction to", "Machine..."])
  })

  it("never splits a single long word", () => {
    expect(wrapLabel("Supercalifragilisticexpialidocious")).toEqual(["Supercalifragilisticexpialidocious"])
  })
})

describe("WrappedAxisTick", () => {
  it("draws one text element per line at the tick position", () => {
    const { container } = render(
      <svg>
        <WrappedAxisTick x={40} y={200} payload={{ value: "Data Structures and Algorithms" }} fill="#9ca3af" />
      </svg>,
    )

    expect(container.querySelector("g")?.getAttribute("transform")).toBe("translate(40,200)")
    const lines = [...container.querySelectorAll("text")]
    expect(lines.map((t) => t.textContent)).toEqual(["Data Structures", "and Algorithms"])
    expect(lines.map((t) => t.getAttribute("dy"))).toEqual(["8", "22"])
    expect(lines[0].getAttribute("fill")).toBe("#9ca3af")
  })
})
