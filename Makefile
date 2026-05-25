PORT := 4321

.PHONY: start

start:
	@tailscale serve --bg $(PORT) >/dev/null
	@URL="https://$$(tailscale status --json | grep -m1 DNSName | cut -d'"' -f4 | sed 's/\.$$//')"; \
	printf "\n→ Test URL: %s\n\n" "$$URL"
	@pnpm dev --host 127.0.0.1
