# ColorFlex short commands — source from any directory to run from project root.
# Add to your shell profile to have them everywhere:
#   echo 'source /Volumes/K3/jobs/colorflex2/scripts/cf-aliases.sh' >> ~/.bashrc
#   (or ~/.zshrc)
#
# Usage:
#   cfs "message"     save (git add + commit)
#   cfd               deploy changed files only
#   cfo <path>        deploy one file (e.g. templates/page.colorflex.liquid)
#   cfa               deploy all (with --nodelete)
#   cfp               pull theme from Shopify
#   cfsync            sync theme-pull/ into src/ (after cfp)
#   cfcompare         compare src/ vs theme-pull/ (don't use 'compare' — that's ImageMagick)
#   cfl               git log --oneline (last 15)

CF_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"

cfs()  { (cd "$CF_ROOT" && ./scripts/git-save.sh "$@"); }
cfd()  { (cd "$CF_ROOT" && ./deploy-shopify-cli.sh changed); }
cfo()  { (cd "$CF_ROOT" && ./deploy-shopify-cli.sh only "$1"); }
cfa()  { (cd "$CF_ROOT" && ./deploy-shopify-cli.sh all); }
cfp()  { (cd "$CF_ROOT" && ./deploy-shopify-cli.sh pull); }
cfsync() { (cd "$CF_ROOT" && ./scripts/theme-sync-from-pull.sh); }
cfcompare() { (cd "$CF_ROOT" && ./scripts/theme-compare.sh "$@"); }
cfl()  { (cd "$CF_ROOT" && git log --oneline -15); }
h() { history; }   