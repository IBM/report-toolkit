workflow "New workflow" {
  resolves = ["Mirror Repository"]
  on = "push"
}

action "Mirror Repository" {
  uses = "spyoungtech/mirror-action@v0.1.1"
  args = "https://github.ibm.com/Christopher-Hiller/gnostic.git"
  secrets = ["GIT_PASSWORD"]
}
