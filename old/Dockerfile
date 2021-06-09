#dont think dockerfile is useful in this case - to check

FROM alpine

EXPOSE 8080

ENV UID="1000" \
    UNAME="developer" \
    GID="1000" \
    GNAME="developer" \
    SHELL="/bin/bash" \
    UHOME=/home/developer \ 
		PROJ_NAME="mod1_project" 

RUN apk update && apk upgrade && \
		apk add --no-cache npm bash sudo

# Create HOME dir
RUN mkdir -p "${UHOME}" \
    && chown "${UID}":"${GID}" "${UHOME}" \
# Create user
    && echo "${UNAME}:x:${UID}:${GID}:${UNAME},,,:${UHOME}:${SHELL}" \
    >> /etc/passwd \
    && echo "${UNAME}::17032:0:99999:7:::" \
    >> /etc/shadow \
# No password sudo
    && echo "${UNAME} ALL=(ALL) NOPASSWD: ALL" \
    > "/etc/sudoers.d/${UNAME}" \
    && chmod 0440 "/etc/sudoers.d/${UNAME}" \
# Create group
    && echo "${GNAME}:x:${GID}:${UNAME}" \
    >> /etc/group



USER $UNAME


RUN echo "==============================="
RUN ls && pwd
RUN echo "==============================="


RUN mkdir -p $UHOME/$PROJ_NAME
WORKDIR $UHOME/$PROJ_NAME
RUN mkdir src dist
ADD dist ./dist/
ADD src ./src/
COPY package.json .
COPY package-lock.json .

#RUN npm install @kitware/vtk.js && npm install -D webpack-cli webpack webpack-dev-server

RUN npm install

#ENTRYPOINT ["bash"]
ENTRYPOINT ["npm", "run", "start"]
