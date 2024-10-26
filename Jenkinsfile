pipeline {
    agent none // We will define agents for each stage
    triggers {
        pollSCM 'H/1 * * * *' // This will trigger the pipeline every minute at a random minute
    }
    stages {
        stage('Build') {
            agent {
                label 'build-agent' // Using a specific agent for the build stage
            }
            steps {
                sh 'npm install' // Install dependencies
            }
        }
        stage('Docker Build') {
            agent {
                label 'docker-agent' // Using a specific agent for the Docker build stage
            }
            steps {
                sh 'echo "build started"' // Log message indicating build start
                sh 'docker build -t shane25225/chat-sphere:latest .' // Build the Docker image
            }
        }
        stage('Docker Push') {
            agent {
                label 'docker-agent' // Using the same agent for Docker push
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh 'echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin' // Login to Docker Hub
                    sh 'docker push shane25225/chat-sphere:latest' // Push the Docker image to Docker Hub
                }
            }
        }
    }
}
