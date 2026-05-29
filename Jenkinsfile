// Portfolio CI — builds and verifies the nginx image from the multi-stage Dockerfile.
// Agent needs the Docker CLI + a usable Docker daemon. Node is NOT required on the agent
// (lint/typecheck/build all run inside the image build).
//
// Pushing is OFF by default. To enable: set REGISTRY below (e.g.
// <acct>.dkr.ecr.<region>.amazonaws.com or docker.io/<user>), make sure the agent is
// authenticated to it (docker login / `aws ecr get-login-password | docker login ...`),
// and the Push stage will run automatically.

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
    }

    environment {
        IMAGE_NAME = 'portfolio'
        REGISTRY = ''
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.IMAGE = "${env.IMAGE_NAME}:${env.GIT_SHA}"
                }
            }
        }

        stage('Test (lint + typecheck)') {
            steps {
                sh 'docker build --target test -t ${IMAGE_NAME}:test .'
            }
        }

        stage('Build image') {
            steps {
                sh 'docker build -t ${IMAGE} -t ${IMAGE_NAME}:latest .'
            }
        }

        stage('Smoke test') {
            steps {
                sh '''
                    set -e
                    cname="portfolio_smoke_${BUILD_NUMBER}"
                    docker rm -f "$cname" >/dev/null 2>&1 || true
                    docker run -d --name "$cname" "$IMAGE"
                    # wait for nginx to come up, then assert it actually serves the hero
                    for i in $(seq 1 15); do
                        if docker exec "$cname" wget -qO- http://localhost/ >/dev/null 2>&1; then break; fi
                        sleep 1
                    done
                    docker exec "$cname" wget -qO- http://localhost/ | grep -q "Yoram Izilov"
                '''
            }
            post {
                always {
                    sh 'docker rm -f "portfolio_smoke_${BUILD_NUMBER}" >/dev/null 2>&1 || true'
                }
            }
        }

        stage('Push') {
            when { expression { return env.REGISTRY?.trim() } }
            steps {
                sh '''
                    set -e
                    docker tag "$IMAGE" "$REGISTRY/$IMAGE"
                    docker tag "$IMAGE_NAME:latest" "$REGISTRY/$IMAGE_NAME:latest"
                    docker push "$REGISTRY/$IMAGE"
                    docker push "$REGISTRY/$IMAGE_NAME:latest"
                '''
            }
        }

        stage('Deploy (main only)') {
            // Deploys to the same Docker host as the Jenkins agent via docker compose.
            // For a single-branch pipeline where BRANCH_NAME is unset, the GIT_BRANCH check
            // covers it; remove this `when` to deploy on every run. Uses compose v2
            // (`docker compose`); for v1 swap to `docker-compose`.
            when {
                anyOf {
                    branch 'main'
                    expression { (env.GIT_BRANCH ?: '') ==~ /(origin\/)?main/ }
                }
            }
            steps {
                sh 'docker compose up -d --remove-orphans'
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f >/dev/null 2>&1 || true'
        }
    }
}
