# workflow "Mirror to GHE" {
#   resolves = ["Mirror Repository"]
#   on = "push"
# }

# action "Mirror Repository" {
#   uses = "mirror-action"
#   args = "https://github.ibm.com/Christopher-Hiller/report-toolkit.git"
#   secrets = ["GIT_PASSWORD"],
#   env = {
#     GIT_USERNAME = "Christopher-Hiller"
#   }
# }
