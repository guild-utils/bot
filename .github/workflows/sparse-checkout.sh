# https://github.com/actions/checkout/issues/172#issuecomment-597265972
# https://qiita.com/y-icchi/items/1bddd58872f9624ba2eb

REPO="https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
BRANCH="${GITHUB_REF/#refs\/heads\//}"

# Following code is based on logs of actions/checkout@v, with sparseCheckout stuff inserted in the middle
echo "Syncing repository: $GITHUB_REPOSITORY"
echo "Working directory is '$(pwd)' GITHUB_WORKSPACE=$GITHUB_WORKSPACE BRANCH=$BRANCH"
git version
git init $GITHUB_WORKSPACE
git remote add origin https://github.com/$GITHUB_REPOSITORY
git config --local gc.auto 0
# Now interesting part
git config core.sparseCheckout true
git config filter.lfs.smudge "git-lfs smudge --skip %f"
# Add here contents of sparse-checkout line by line
git sparse-checkout add /package.json
git sparse-checkout add /lerna.json
git sparse-checkout add /tsconfig.json
git sparse-checkout add /yarn.lock
git sparse-checkout add /packages/domains/command-data
git sparse-checkout add /packages/presentation/command-data-common
git sparse-checkout add /packages/presentation/web


# echo ... 
git pull origin master 
git lfs pull -I 