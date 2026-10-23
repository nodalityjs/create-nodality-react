# Run `gh auth status` and capture the output
auth_output=$(gh auth status 2>&1)

# Print the output for logging

# Check if logged in as 'nodalityjs'
if echo "$auth_output" | grep -q 'github\.com as nodalityjs'; then
  echo "🚀 Logged in as nodalityjs — continuing."
else
  echo "🚫 Not logged in as nodalityjs. Aborting."
  exit 1
fi
