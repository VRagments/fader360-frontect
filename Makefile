.POSIX:

ENV ?= dev
VERSION ?= $(shell  grep -r version package.json | cut -d'"' -f4)

DOCKER_PROJECT ?= mediaverseeu
DOCKER_IMAGE ?= fader360-frontend
# ?= defers variable resolution in recipes. need to pin it statically here
DOCKER_TAG := $(shell date +%Y%m%d-%H%M%S).v${VERSION}-${ENV}
DOCKER_LOCAL_IMAGE ?= "${DOCKER_IMAGE}:${DOCKER_TAG}"

all: help

.PHONY: dockerhub-login
dockerhub-login: ## loginto mediaversue docker hub
	docker login

.PHONY: docker-push
docker-push: ## push local tagged docker image to repository
	docker push ${DOCKER_PROJECT}/${DOCKER_IMAGE}:${DOCKER_TAG}

.PHONY: docker-list
docker-list: ## list docker images in repository
	docker image ls --all ${DOCKER_PROJECT}/${DOCKER_IMAGE}

.PHONY: docker-pull
docker-pull: ## pull docker image from repository
	docker pull ${DOCKER_PROJECT}/${DOCKER_IMAGE}:${DOCKER_TAG}

.PHONY: build-upload-release
build-upload-release: | docker-build docker-tag docker-push

.PHONY: docker-tag
docker-tag: ## tag local docker image
	test -n "$(DOCKER_LOCAL_IMAGE)"  # $$DOCKER_LOCAL_IMAGE
	docker tag ${DOCKER_LOCAL_IMAGE} ${DOCKER_PROJECT}/${DOCKER_IMAGE}:${DOCKER_TAG}

.PHONY: docker-build
docker-build: ## build docker based image for distribution
	rsync --verbose --human-readable --progress --archive --compress --delete \
		--exclude 'node_modules' postcss.config.js tailwind.config.js \
		package.json yarn.lock public .eslintrc.js tsconfig.json Makefile src \
		nginx.conf docker/work/
	ENV=${ENV} \
	DOCKER_IMAGE=${DOCKER_IMAGE} \
	DOCKER_TAG=${DOCKER_TAG} \
	VERSION=${VERSION} \
	docker compose build fader360_frontend

.PHONY: docker-run
docker-run:
	rsync --verbose --human-readable --progress --archive --compress --delete \
		--exclude 'node_modules' postcss.config.js tailwind.config.js \
		package.json yarn.lock public .eslintrc.js tsconfig.json Makefile src \
		nginx.conf docker/work/
	ENV=${ENV} \
	DOCKER_IMAGE=${DOCKER_IMAGE} \
	DOCKER_TAG=${DOCKER_TAG} \
	VERSION=${VERSION} \
	docker compose run --service-ports fader360_frontend

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'