start:
	docker run -v ${PWD}:/usr/src/app -p 4000:4000 starefossen/github-pages jekyll serve \
		--incremental \
		--config _config.yml,_config.dev.yml \
		-d /_site \
		--future \
		--watch \
		--force_polling \
		-H 0.0.0.0 \
		-P 4000
