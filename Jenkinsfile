pipeline{
    agent none //we will define agents for each stage
    stages{
        stage('Build'){
            agent{
                label 'build-agent'
            }
            steps{
                sh 'npm install'
            }
        }
        stage('Docker Build'){
            agent{
                label 'docker-agent'
            }
            steps{
                sh 'echo "build started"'
                sh 'docker build -t chat-sphere:latest .'
            }
        }
        stage('Docker Push'){
            agent{
                label 'docker-agent'
            }
            steps{
                withCredentials([usernamePassword(credentialsId:'dockerhub-credentials',usernameVariable:'DOCKER_USERNAME', passwordVariable:'DOCKER_PASSWORD')]){
                    sh 'echo "$DOCKER_USERNAME" | docker login -u $DOCKER_USERNAME --password-stdin'
                }
            }
        }
    }
}