FROM ubuntu:14.04

ENV DEBIAN_FRONTEND noninteractive
ENV HOME /root

RUN apt-get update && \
    apt-get upgrade --yes

RUN apt-get install --quiet --yes curl
RUN apt-get install --quiet --yes git
RUN apt-get install --quiet --yes make
RUN apt-get install --quiet --yes npm
RUN apt-get install --quiet --yes python-software-properties
RUN apt-get install --quiet --yes software-properties-common
RUN apt-add-repository ppa:brightbox/ruby-ng
RUN apt-get update
RUN apt-get install --quiet --yes ruby2.2 ruby2.2-dev ruby-switch
RUN ruby-switch --set ruby2.2

RUN npm install --global n
RUN npm install --global bower

RUN n 0.10

RUN gem install --no-rdoc --no-ri jekyll -v 3.0.1

WORKDIR /srv/

EXPOSE 4000

ENTRYPOINT ["jekyll"]
