#!/usr/bin/env sh
set -e

# Ensure that vintner is installed
if ! which vintner &>/dev/null; then
    echo "\"vintner\" not installed"
    exit 1
fi

. magic.sh -n
TYPE_SPEED=100

cd ../../../

echo '# Installation'
p 'wget -q https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64'
sleep 1

p 'mv vintner-linux-x64 /usr/bin/vintner'
# sleep 0.5

p 'chmod +x /usr/bin/vintner'
# sleep 0.5

pe 'vintner setup init'
# sleep 0.5

echo ''
echo '# Orchestrator'

pe 'vintner orchestrators init xopera'
# sleep 0.5

pe 'vintner orchestrators enable --orchestrator xopera'
# sleep 0.5

echo ''
echo '# Deployment'

pe 'vintner templates import --template getting-started --path examples/xopera-getting-started'
# sleep 0.5

pe 'vintner instances create --instance getting-started --template getting-started'
# sleep 0.5

pe 'vintner instances resolve --instance getting-started --inputs examples/xopera-getting-started/variability-inputs.example.yaml'
## sleep 0.5

pe 'vintner instances deploy --instance getting-started'
## sleep 0.5

echo ''
echo '# Results'
pe 'cat /tmp/vintner-getting-started.txt'
#echo 'First Textfile has been selected!'
# sleep 0.5

echo ''
echo ''
echo '# Undeployment'
pe 'vintner instances undeploy --instance getting-started'
# sleep 0.5
