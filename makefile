serve:
	@docker run --rm -v "$$PWD:/src" -p 4000:4000 grahamc/jekyll serve -H 0.0.0.0

setup:
	@npm install
