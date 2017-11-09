link1 {
  go: "sitemap.mml"
}
calc {
  prompt: addend1, "Addend 1:"
  prompt: addend2, "Addend 2:"
  +: sum, $addend1, $addend2
  output: "sum", $sum
}
init {
  output: "sum", "???"
}
